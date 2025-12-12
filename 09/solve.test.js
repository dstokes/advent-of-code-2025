"use strict";

const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const { parseRedTiles, largestRectangleArea, largestRectangleAreaWithGreens } = require("./solve");
const { runSolution } = require("../util/runSolution");

test("sample red tiles form a largest rectangle of area 50", () => {
    const raw = fs.readFileSync(path.join(__dirname, "sample.txt"), "utf8").trimEnd();
    const tiles = parseRedTiles(raw);
    const area = largestRectangleArea(tiles);
    assert.strictEqual(area, 50);
});

test("Day 09 solution reports the expected largest rectangle area for the puzzle input", () => {
    const scriptPath = path.join(__dirname, "solve.js");
    const { exitCode, stdout, stderr } = runSolution(scriptPath, { cwd: __dirname });
    assert.strictEqual(exitCode, 0, `solve.js exited with code ${exitCode}\n${stderr}`);

    const match = stdout.match(/Largest rectangle area:\s+(\d+)/);
    assert.ok(match, `Output missing rectangle area\n${stdout}`);
    assert.strictEqual(Number(match[1]), 4774877510);
});

test("sample red+green grid largest rectangle has area 24", () => {
    const raw = fs.readFileSync(path.join(__dirname, "sample.txt"), "utf8").trimEnd();
    const tiles = parseRedTiles(raw);
    const area = largestRectangleAreaWithGreens(tiles);
    assert.strictEqual(area, 24);
});
