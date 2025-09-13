// vis-render.js
export function initNetwork(containerId, graphData, initialMode = "neutral") {
    // Initialize nodes and edges from graphData
    const nodes = new vis.DataSet(
        graphData.nodes.map(n => ({
            id: n.id,
            label: n.label,
            x: n.x,
            y: n.y,
            fixed: false,

            color: { background: "#8ecae6", border: "#219ebc" },
            font: { color: "#023047", size: 16, face: "Arial", bold: true },
            //shape: "dot",
        }))
    );

    const edges = new vis.DataSet(
        graphData.edges.map(e => ({
            id: e.id,
            from: e.from,
            to: e.to,
            label: e.label,

            color: { color: "#ffb703", highlight: "#fb8500" },
            smooth: false,
            font: { align: "top", color: "#023047", size: 14 },
            width: 3
        }))
    );

    const container = document.getElementById(containerId);
    const data = { nodes, edges };

    const options = {
        layout: { improvedLayout: false },
        physics: { enabled: false },
        edges: { font: { align: "top" } },
        nodes: { shape: "circle", size: 30 },
        interaction: { dragNodes: true, hover: true, selectable: true, dragView: true }
    };

    const network = new vis.Network(container, data, options);

    let currentMode = initialMode;
    let selectedNode = null;
    let pendingConnect = null;

    function setMode(mode) {
        currentMode = mode;
        switch (mode) {
            case "neutral":
                network.setOptions({ interaction: { dragNodes: true, dragView: true, selectable: false } });
                pendingConnect = null;
                break;
            case "add":
                network.setOptions({ interaction: { dragNodes: false, dragView: true, selectable: false } });
                break;
            case "delete":
            case "edit":
            case "connect":
                network.setOptions({ interaction: { dragNodes: false, dragView: true, selectable: true } });
                if (mode !== "connect") pendingConnect = null;
                break;
        }
    }

    setMode(initialMode);

    // Click events
    network.on("click", (params) => {

        if (currentMode === "add") {
            const nodeId = `N${nodes.length + 1}`;
            const pos = params.pointer.canvas;
            nodes.add({ id: nodeId, label: nodeId, x: pos.x, y: pos.y });
        }
        else if (currentMode === "delete") {
            if (params.nodes.length > 0) {
                const nodeId = params.nodes[0];
                nodes.remove(nodeId);
                edges.forEach(e => {
                    if (e.from === nodeId || e.to === nodeId) edges.remove(e.id);
                });
            } else if (params.edges.length > 0) {
                edges.remove(params.edges[0]);
            }
        }
        else if (currentMode === "edit") {
            if (params.nodes.length > 0) {
                selectedNode = params.nodes[0];
                const newLabel = prompt("Enter new label:", nodes.get(selectedNode).label);
                if (newLabel) nodes.update({ id: selectedNode, label: newLabel });
            } else if (params.edges.length > 0) {
                const edgeId = params.edges[0];
                const currentEdge = edges.get(edgeId);
                const newWeight = prompt("Enter new weight:", currentEdge.label);
                if (newWeight !== null && newWeight.trim() !== "") {
                    edges.update({ id: edgeId, label: newWeight });
                }
            }
        }
        else if (currentMode === "connect") {
            if (params.nodes.length > 0) {
                const clickedNode = params.nodes[0];
                if (!pendingConnect) {
                    pendingConnect = clickedNode;
                } else if (pendingConnect !== clickedNode) {
                    const key = [pendingConnect, clickedNode].sort().join("|");
                    if (!edges.get(key)) {
                        edges.add({ id: key, from: pendingConnect, to: clickedNode, label: "1", font: { align: "top" }, smooth: false, color: { color: "#999" } });
                    }
                    pendingConnect = null;
                }
            }
        }
    });

    function highlightPath(path) {
        edges.forEach(e => edges.update({ id: e.id, color: { color: "#999" } }));
        for (let i = 0; i < path.length - 1; i++) {
            const key = [path[i], path[i + 1]].sort().join("|");
            edges.update({ id: key, color: { color: "red" } });
        }
    }

    function lockPositions(statusEl) {
        const update = [];
        nodes.forEach(n => {
            const pos = network.getPositions([n.id])[n.id];
            update.push({ id: n.id, x: pos.x, y: pos.y, fixed: { x: true, y: true } });
        });
        nodes.update(update);
        if (statusEl) statusEl.textContent = "Positions locked.";
    }

    function exportNetworkData() {
        const nodesArray = [];
        nodes.forEach(n => {
            const pos = network.getPositions([n.id])[n.id];
            nodesArray.push({ id: n.id, label: n.label, x: pos.x, y: pos.y });
        });

        const edgesArray = [];
        edges.forEach(e => edgesArray.push({ id: e.id, from: e.from, to: e.to, label: e.label }));

        return { nodes: nodesArray, edges: edgesArray };
    }

    return { network, nodes, edges, highlightPath, lockPositions, exportNetworkData, setMode };
}
