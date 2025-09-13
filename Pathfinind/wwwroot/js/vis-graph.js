export class VisGraph {
    constructor(nodesDataSet, edgesDataSet, directed = false) {
        this.nodes = nodesDataSet;
        this.edges = edgesDataSet;
        this.directed = directed;

        // Map from label to ID
        this.labelToId = {};
        this.nodes.forEach(n => {
            this.labelToId[n.label] = n.id;
        });

        this.adjMap = this.buildAdjMap();
    }

    buildAdjMap() {
        const map = {};
        this.nodes.forEach(node => map[node.id] = {});

        this.edges.forEach(edge => {
            const weight = parseFloat(edge.label) || 1;
            map[edge.from][edge.to] = weight;
            if (!this.directed) map[edge.to][edge.from] = weight;
        });

        return map;
    }

    // Accept labels instead of IDs
    findShortestPath(startLabel, endLabel) {
        const startId = this.labelToId[startLabel] || startLabel;
        const endId = this.labelToId[endLabel] || endLabel;

        const nodes = Object.keys(this.adjMap);
        const distances = {};
        const previous = {};
        const unvisited = new Set(nodes);

        nodes.forEach(n => distances[n] = Infinity);
        distances[startId] = 0;

        while (unvisited.size > 0) {
            let current = null;
            unvisited.forEach(n => {
                if (current === null || distances[n] < distances[current]) current = n;
            });

            if (distances[current] === Infinity) break;
            unvisited.delete(current);

            if (current === endId) break;

            for (const [neighbor, weight] of Object.entries(this.adjMap[current])) {
                if (!unvisited.has(neighbor)) continue;
                const alt = distances[current] + weight;
                if (alt < distances[neighbor]) {
                    distances[neighbor] = alt;
                    previous[neighbor] = current;
                }
            }
        }

        const path = [];
        let u = endId;
        while (u !== undefined) {
            path.unshift(u);
            u = previous[u];
        }

        return path[0] === startId ? path : null;
    }

    highlightPath(path) {
        // Reset all edges
        this.edges.forEach(e => this.edges.update({ id: e.id, color: { color: "#999" }, width: 5 }));
        // Reset all nodes
        this.nodes.forEach(n => this.nodes.update({ id: n.id, color: { background: "#8ecae6", border: "#219ebc" } }));

        // Highlight edges along the path
        for (let i = 0; i < path.length - 1; i++) {
            const from = path[i];
            const to = path[i + 1];

            const edgeId = this.directed
                ? this.edges.get().find(e => e.from === from && e.to === to)?.id
                : this.edges.get().find(e => (e.from === from && e.to === to) || (e.from === to && e.to === from))?.id;

            if (edgeId) {
                this.edges.update({ id: edgeId, color: { color: "red" } });
            }
        }

        // Highlight nodes along the path
        path.forEach(nodeId => {
            this.nodes.update({ id: nodeId, color: { background: "#fb8500", border: "#ffb703" } });
        });
    }

}
