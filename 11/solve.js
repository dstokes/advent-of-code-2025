"use strict";

const { loadInput } = require("../util/input");

function parseNetwork(raw) {
    const graph = new Map();
    raw
        .trimEnd()
        .split(/\r?\n/)
        .filter(Boolean)
        .forEach((line) => {
            const [namePart, rest] = line.split(":");
            const from = namePart.trim();
            const targets = rest
                .trim()
                .split(/\s+/)
                .filter(Boolean);
            graph.set(from, targets);
        });
    return graph;
}

/**
 * Count all distinct paths from start to end in a directed graph using DFS + memo.
 */
function countPaths(graph, start, end) {
    const memo = new Map();
    const visiting = new Set();

    const dfs = (node) => {
        if (node === end) return 1;
        if (!graph.has(node)) return 0;
        if (memo.has(node)) return memo.get(node);
        if (visiting.has(node)) {
            throw new Error("Cycle detected in network; path count would be infinite");
        }
        visiting.add(node);
        let total = 0;
        for (const next of graph.get(node)) {
            total += dfs(next);
        }
        visiting.delete(node);
        memo.set(node, total);
        return total;
    };

    return dfs(start);
}

/**
 * Part 2: count paths that must visit all required nodes (any order).
 */
function countPathsVisiting(graph, start, end, required) {
    const reqIndex = new Map(required.map((name, idx) => [name, idx]));
    const fullMask = (1 << required.length) - 1;
    const memo = new Map();
    const visiting = new Set();

    const dfs = (node, mask) => {
        const key = `${node}|${mask}`;
        if (memo.has(key)) return memo.get(key);
        if (node === end) {
            const val = mask === fullMask ? 1 : 0;
            memo.set(key, val);
            return val;
        }
        if (!graph.has(node)) {
            memo.set(key, 0);
            return 0;
        }
        if (visiting.has(node)) throw new Error("Cycle detected in network");
        visiting.add(node);

        let nextMask = mask;
        if (reqIndex.has(node)) {
            nextMask |= 1 << reqIndex.get(node);
        }

        let total = 0;
        for (const nxt of graph.get(node)) {
            total += dfs(nxt, nextMask);
        }
        visiting.delete(node);
        memo.set(key, total);
        return total;
    };

    return dfs(start, 0);
}

if (require.main === module) {
    const input = loadInput(process.argv[2]);
    const graph = parseNetwork(input);
    const paths = countPaths(graph, "you", "out");
    const pathsReq = countPathsVisiting(graph, "svr", "out", ["dac", "fft"]);
    console.log(`Paths from you to out: ${paths}`);
    console.log(`Paths from svr to out visiting dac and fft: ${pathsReq}`);
}

module.exports = {
    parseNetwork,
    countPaths,
    countPathsVisiting,
};
