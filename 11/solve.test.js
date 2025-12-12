"use strict";

const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const { parseNetwork, countPaths, countPathsVisiting } = require("./solve");
const { runSolution } = require("../util/runSolution");

test("sample network lists five distinct paths from you to out", () => {
    const raw = fs.readFileSync(path.join(__dirname, "sample.txt"), "utf8").trimEnd();
    const graph = parseNetwork(raw);
    const paths = countPaths(graph, "you", "out");
    assert.strictEqual(paths, 5);
});

test("Day 11 solution reports the expected path count for the puzzle input", () => {
    const scriptPath = path.join(__dirname, "solve.js");
    const { exitCode, stdout, stderr } = runSolution(scriptPath, { cwd: __dirname });
    assert.strictEqual(exitCode, 0, `solve.js exited with code ${exitCode}\n${stderr}`);

    const match = stdout.match(/Paths from you to out:\s+(\d+)/);
    assert.ok(match, `Output missing path count\n${stdout}`);
    assert.strictEqual(Number(match[1]), 662);
});

test("part two sample counts only paths that visit dac and fft", () => {
    const raw = fs.readFileSync(path.join(__dirname, "sample2.txt"), "utf8").trimEnd();
    const graph = parseNetwork(raw);
    const paths = countPathsVisiting(graph, "svr", "out", ["dac", "fft"]);
    assert.strictEqual(paths, 2);
});
