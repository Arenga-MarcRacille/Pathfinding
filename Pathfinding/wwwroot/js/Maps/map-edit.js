import { initNetwork } from "../vis-render.js";

$(async function () {
    //INITIAZE
    let mapData = mapDataFromView;
    let mapId = mapDataFromView.Id;

    const buttons = document.querySelectorAll(".btn-group button");
    let currentMode = "neutral";
    changeMode();

    let graphData = {};

    const response = await fetch(`/MapDatas/Details/${mapId}`)
        .then(res => res.json());

    graphData = {
        nodes: response.nodes || [],
        edges: response.edges || []
    };


    //EVENTS
    
    const { network, nodes, edges, exportNetworkData, setMode } = initNetwork("network", graphData, currentMode);

    // Preload the map image
    const img = new Image();
    img.src = mapData.ImagePath;
    img.onload = () => {
        // Draw background image before network elements
        network.on("beforeDrawing", (ctx) => {
            // Fill background
            ctx.save();
            ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.restore();
        });
        network.redraw();
    };

    $("form").on("submit", function (e) {
        const exportData = exportNetworkData();

        document.getElementById("nodesJson").value = JSON.stringify(exportData.nodes);
        document.getElementById("edgesJson").value = JSON.stringify(exportData.edges);

        // e.preventDefault(); // optional for debugging

    });


    //FUNCTIONS
    function changeMode() {
        buttons.forEach(btn => {
            btn.addEventListener("click", () => {
                const isActive = btn.classList.contains("active");

                // Reset all buttons
                buttons.forEach(b => b.classList.remove("active"));

                if (isActive) {
                    // If clicked again while active → switch to neutral
                    currentMode = "neutral";
                } else {
                    // Otherwise activate the clicked button
                    btn.classList.add("active");

                    if (btn.id === "addNodeBtn") currentMode = "add";
                    else if (btn.id === "deleteNodeBtn") currentMode = "delete";
                    else if (btn.id === "editNodeBtn") currentMode = "edit";
                    else if (btn.id === "connectNodeBtn") currentMode = "connect";
                    else currentMode = "neutral";
                }

                // Apply the mode to the network
                setMode(currentMode);
            });
        });
    }
});