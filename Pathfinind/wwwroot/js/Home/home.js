import { initNetwork } from "../vis-render.js";
import { VisGraph } from '../vis-graph.js';

$(async function () {
    let mapData = mapDataFromView; // array of maps
    let mapId = $("#mapSelection").val();

    // Function to get map object by Id
    function getMapById(id) {
        return mapData.find(m => m.Id == id);
    }

    // Fetch initial graph data
    let response = await fetch(`/MapDatas/Details/${mapId}`).then(res => res.json());

    let graphData = {
        nodes: response.nodes || [],
        edges: response.edges || []
    };

    const { network, nodes, edges, lockPositions, highlightPath, exportNetworkData, setMode } = initNetwork("network", graphData);
    let visGraph = new VisGraph(nodes, edges, false);
    // Preload initial map image
    let img = new Image();
    img.src = getMapById(mapId).ImagePath;
    img.onload = () => {
        network.on("beforeDrawing", (ctx) => {
            ctx.save();
            ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.restore();
        });

        lockPositions();

        network.redraw();
    };

    // Change map
    $("#mapSelection").on("change", async function () {
        mapId = $(this).val();
        const response = await fetch(`/MapDatas/Details/${mapId}`).then(res => res.json());

        // Prepare graph data
        const graphData = {
            nodes: response.nodes || [],
            edges: (response.edges || []).map(e => ({
                ...e,
                width: 3,            // apply your preferred thickness
                color: { color: "#999" },
                smooth: false,
                font: { align: "top" }
            }))
        };

        // Recreate the network and visGraph
        const networkContainer = document.getElementById("network");
        networkContainer.innerHTML = ""; // clear old network
        const { network: newNetwork, nodes: newNodes, edges: newEdges, lockPositions, exportNetworkData, setMode } = initNetwork("network", graphData);
        visGraph = new VisGraph(newNodes, newEdges, false);

        // Update background image
        const selectedMap = getMapById(mapId);
        if (selectedMap && selectedMap.ImagePath) {
            const img = new Image();
            img.src = selectedMap.ImagePath;
            img.onload = () => {
                newNetwork.on("beforeDrawing", (ctx) => {
                    ctx.save();
                    ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height);
                    ctx.restore();
                });
                lockPositions();

                newNetwork.redraw();
            };
        }

        
    });



    $("#search").on("click", function () {
        let from = $("#from").val();
        let to = $("#to").val();

        const path = visGraph.findShortestPath(from, to);
        if (path) {
            console.log("Shortest path:", path);
            visGraph.highlightPath(path);
        } else {
            console.log("No path found");
        }


    });
});
