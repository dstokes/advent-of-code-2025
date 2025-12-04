"use strict";

const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const { parseGrid, findAccessibleRolls, markAccessibleRolls, totalRemovableRolls } = require("./solve");
const { runSolution } = require("../util/runSolution");

const stripBorder = (grid) => grid.slice(1, -1).map((row) => row.slice(1, -1));

test("sample grid marks expected accessible rolls", () => {
    const raw = fs.readFileSync(path.join(__dirname, "sample.txt"), "utf8").trimEnd();
    const grid = parseGrid(raw);
    const { count } = findAccessibleRolls(grid);
    const marked = markAccessibleRolls(grid);

    assert.strictEqual(count, 13);

    const stripped = stripBorder(marked)
        .map((row) => row.join(""))
        .join("\n");

    const expected = [
        "..xx.xx@x.",
        "x@@.@.@.@@",
        "@@@@@.x.@@",
        "@.@@@@..@.",
        "x@.@@@@.@x",
        ".@@@@@@@.@",
        ".@.@.@.@@@",
        "x.@@@.@@@@",
        ".@@@@@@@@.",
        "x.x.@@@.x.",
    ].join("\n");

    assert.strictEqual(stripped, expected);
});

test("sample grid removes 43 rolls when repeating accessibility", () => {
    const raw = fs.readFileSync(path.join(__dirname, "sample.txt"), "utf8").trimEnd();
    const grid = parseGrid(raw);
    const removed = totalRemovableRolls(grid);
    assert.strictEqual(removed, 43);
});

test("Day 04 solution produces a numeric answer", () => {
    const scriptPath = path.join(__dirname, "solve.js");
    const { exitCode, stdout, stderr } = runSolution(scriptPath, { cwd: __dirname });
    assert.strictEqual(exitCode, 0, `solve.js exited with code ${exitCode}\n${stderr}`);

    const match = stdout.match(/Accessible rolls:\s+(\d+)/);
    assert.ok(match, `Output missing accessible roll count\n${stdout}`);
    assert.ok(Number.isInteger(Number(match[1])));
});
