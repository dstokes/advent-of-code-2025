"use strict";

const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const { parseManifold, countSplits, countTimelines } = require("./solve");
const { runSolution } = require("../util/runSolution");

test("sample manifold splits the tachyon beam 21 times", () => {
    const raw = fs.readFileSync(path.join(__dirname, "sample.txt"), "utf8").trimEnd();
    const manifold = parseManifold(raw);
    const splits = countSplits(manifold);
    assert.strictEqual(splits, 21);
});

test("Day 07 solution reports the expected split count for the puzzle input", () => {
    const scriptPath = path.join(__dirname, "solve.js");
    const { exitCode, stdout, stderr } = runSolution(scriptPath, { cwd: __dirname });
    assert.strictEqual(exitCode, 0, `solve.js exited with code ${exitCode}\n${stderr}`);

    const match = stdout.match(/Beam splits:\s+(\d+)/);
    assert.ok(match, `Output missing beam split count\n${stdout}`);
    assert.strictEqual(Number(match[1]), 1516);
});

test("sample manifold creates 40 timelines in quantum mode", () => {
    const raw = fs.readFileSync(path.join(__dirname, "sample.txt"), "utf8").trimEnd();
    const manifold = parseManifold(raw);
    const timelines = countTimelines(manifold);
    assert.strictEqual(Number(timelines), 40);
});
