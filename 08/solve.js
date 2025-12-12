"use strict";

const { loadInput } = require("../util/input");

function parseJunctions(raw) {
    return raw
        .trimEnd()
        .split(/\r?\n/)
        .filter(Boolean)
        .map((line) => {
            const [x, y, z] = line.split(",").map(Number);
            return { x, y, z };
        });
}

class DisjointSet {
    constructor(size) {
        this.parent = Array.from({ length: size }, (_, i) => i);
        this.size = Array(size).fill(1);
    }
    find(x) {
        if (this.parent[x] !== x) this.parent[x] = this.find(this.parent[x]);
        return this.parent[x];
    }
    union(a, b) {
        const ra = this.find(a);
        const rb = this.find(b);
        if (ra === rb) return false;
        if (this.size[ra] < this.size[rb]) {
            this.parent[ra] = rb;
            this.size[rb] += this.size[ra];
        } else {
            this.parent[rb] = ra;
            this.size[ra] += this.size[rb];
        }
        return true;
    }
    componentSizes() {
        const sizes = new Map();
        for (let i = 0; i < this.parent.length; i++) {
            const r = this.find(i);
            sizes.set(r, (sizes.get(r) || 0) + 1);
        }
        return Array.from(sizes.values());
    }
}

function squaredDistance(a, b) {
    return (
        (a.x - b.x) * (a.x - b.x) +
        (a.y - b.y) * (a.y - b.y) +
        (a.z - b.z) * (a.z - b.z)
    );
}

/**
 * Connect the k closest distinct pairs of junctions (ties broken by sorted order)
 * and return the product of the three largest resulting circuit sizes.
 */
function largestCircuitProduct(junctions, k = 1000) {
    const n = junctions.length;
    const edges = [];
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            edges.push({ dist: squaredDistance(junctions[i], junctions[j]), a: i, b: j });
        }
    }
    edges.sort((p, q) => p.dist - q.dist);

    const dsu = new DisjointSet(n);
    for (let i = 0; i < Math.min(k, edges.length); i++) {
        const { a, b } = edges[i];
        dsu.union(a, b);
    }

    const sizes = dsu.componentSizes().sort((a, b) => b - a);
    while (sizes.length < 3) sizes.push(1);
    return sizes[0] * sizes[1] * sizes[2];
}

/**
 * Keep connecting closest pairs until all junctions are connected; return the
 * product of the X coordinates of the last pair actually connected.
 */
function finalConnectionProduct(junctions) {
    const n = junctions.length;
    const edges = [];
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            edges.push({ dist: squaredDistance(junctions[i], junctions[j]), a: i, b: j });
        }
    }
    edges.sort((p, q) => p.dist - q.dist);

    const dsu = new DisjointSet(n);
    let components = n;
    for (const { a, b } of edges) {
        if (dsu.union(a, b)) {
            components -= 1;
            if (components === 1) {
                return junctions[a].x * junctions[b].x;
            }
        }
    }
    throw new Error("Graph never fully connected");
}

if (require.main === module) {
    const input = loadInput(process.argv[2]);
    const junctions = parseJunctions(input);
    const product = largestCircuitProduct(junctions);
    const lastProduct = finalConnectionProduct(junctions);
    console.log(`Circuit product: ${product}`);
    console.log(`Final connection X-product: ${lastProduct}`);
}

module.exports = {
    parseJunctions,
    largestCircuitProduct,
    finalConnectionProduct,
};
