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

        console.log(map);
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

    getShortestDistance(startLabel, endLabel) {
        const path = this.findShortestPath(startLabel, endLabel); // pass labels directly
        if (!path) return Infinity;

        let total = 0;
        for (let i = 0; i < path.length - 1; i++) {
            total += this.adjMap[path[i]][path[i + 1]];
        }
        return total;
    }

    // Generate permutations (helper)
    permute(arr) {
        if (arr.length === 0) return [[]];
        return arr.flatMap((item, i) =>
            this.permute([...arr.slice(0, i), ...arr.slice(i + 1)]).map(p => [item, ...p])
        );
    }


    ////////////// TSP //////////////

    // Solve TSP for a given set of node labels (fixed)
    bruteForceTSP(labels, returnToStart = true) {
        if (!Array.isArray(labels) || labels.length === 0) {
            return { path: [], tour: [], cost: 0 };
        }
        if (labels.length === 1) {
            const singleId = this.labelToId[labels[0]] || labels[0];
            return { path: [singleId], tour: [labels[0]], cost: 0 };
        }

        const start = labels[0];
        const rest = labels.slice(1);
        const permutations = this.permute(rest);

        let bestTour = null;      // e.g. ['A','B','C','A']
        let bestFullPath = null;  // e.g. ['idA','idX','idB','idY','idC','idA']
        let bestCost = Infinity;

        permutations.forEach(perm => {
            const tour = [start, ...perm];
            if (returnToStart) tour.push(start);

            let totalCost = 0;
            let fullPath = [];
            let invalid = false;

            // For each consecutive pair in the tour, get the shortest path (as node IDs)
            for (let i = 0; i < tour.length - 1; i++) {
                const segStart = tour[i];
                const segEnd = tour[i + 1];

                // findShortestPath accepts labels or ids; returns array of node IDs or null
                const segPath = this.findShortestPath(segStart, segEnd);
                if (!segPath || segPath.length === 0) {
                    invalid = true;
                    break;
                }

                // sum weights along segPath using adjMap
                for (let j = 0; j < segPath.length - 1; j++) {
                    const u = segPath[j];
                    const v = segPath[j + 1];
                    const w = (this.adjMap[u] && this.adjMap[u][v]);
                    if (typeof w !== "number") { // missing edge weight (shouldn't happen if findShortestPath returned path)
                        invalid = true;
                        break;
                    }
                    totalCost += w;
                }
                if (invalid) break;

                // concatenate segPath but avoid duplicating the connecting node
                if (fullPath.length === 0) fullPath = segPath.slice();
                else fullPath = fullPath.concat(segPath.slice(1));
            }

            if (invalid) return; // skip this permutation

            if (totalCost < bestCost) {
                bestCost = totalCost;
                bestTour = tour.slice();
                bestFullPath = fullPath.slice();
            }
        });

        return { path: bestFullPath, tour: bestTour, cost: bestCost };
    }

    // Heuristic TSP (Nearest Neighbor + 2-opt)
    heuristicTSP(labels, returnToStart = true) {
        if (labels.length < 2) {
            return { path: labels, tour: labels, cost: 0 };
        }

        const idToLabel = {};
        this.nodes.forEach(n => idToLabel[n.id] = n.label);

        // Ensure we work with IDs internally
        const allNodes = labels.map(l => this.labelToId[l] || l);
        const start = allNodes[0];
        const unvisited = new Set(allNodes.slice(1));

        // --- Step 1: Nearest Neighbor initial tour ---
        let tour = [start];
        let current = start;
        while (unvisited.size > 0) {
            let nearest = null;
            let nearestDist = Infinity;
            unvisited.forEach(n => {
                const d = this.getShortestDistance(current, n);
                if (d < nearestDist) {
                    nearest = n;
                    nearestDist = d;
                }
            });
            if (!nearest) break;
            tour.push(nearest);
            unvisited.delete(nearest);
            current = nearest;
        }
        if (returnToStart) tour.push(start);

        // --- Step 2: 2-opt local improvement ---
        let improved = true;
        while (improved) {
            improved = false;
            for (let i = 1; i < tour.length - 2; i++) {
                for (let j = i + 1; j < tour.length - 1; j++) {
                    const a = tour[i - 1], b = tour[i];
                    const c = tour[j], d = tour[j + 1];

                    const distAB = this.getShortestDistance(a, b);
                    const distCD = this.getShortestDistance(c, d);
                    const distAC = this.getShortestDistance(a, c);
                    const distBD = this.getShortestDistance(b, d);

                    if (distAB + distCD > distAC + distBD) {
                        // Reverse tour[i..j]
                        tour = [
                            ...tour.slice(0, i),
                            ...tour.slice(i, j + 1).reverse(),
                            ...tour.slice(j + 1)
                        ];
                        improved = true;
                    }
                }
            }
        }

        // --- Build full path (concatenate shortest subpaths) ---
        let fullPath = [];
        let cost = 0;
        for (let i = 0; i < tour.length - 1; i++) {
            const segPath = this.findShortestPath(tour[i], tour[i + 1]);
            if (!segPath) continue;
            if (fullPath.length === 0) fullPath = segPath;
            else fullPath = fullPath.concat(segPath.slice(1));

            for (let j = 0; j < segPath.length - 1; j++) {
                cost += this.adjMap[segPath[j]][segPath[j + 1]];
            }
        }

        // Convert IDs back to labels for readability
        const labelTour = tour.map(id => idToLabel[id] || id);
        const labelPath = fullPath.map(id => idToLabel[id] || id);

        return { path: fullPath, tour: labelTour, labels: labelPath, cost };
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


    highlightTSP(labels, tspType = "heuristicTSP", returnToStart = true) {
        if (typeof this[tspType] !== "function") {
            throw new Error(`Unknown TSP type: ${tspType}`);
        }

        const result = this[tspType](labels, returnToStart);
        if (!result || !result.path) return result;

        // Normalize to IDs (if not already)
        const pathIds = result.path.map(x => this.labelToId[x] || x);

        // Highlight path in vis.js
        this.highlightPath(pathIds);

        // Build label mapping for easier debugging/UI
        const idToLabel = {};
        this.nodes.forEach(n => { idToLabel[n.id] = n.label; });

        result.labels = pathIds.map(id => idToLabel[id] || id);

        return result;
    }


}
