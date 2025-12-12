"use strict";

const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const { parseShapesAndRegions, countFittableRegions } = require("./solve");
const { runSolution } = require("../util/runSolution");

test("sample regions report that two can fit all required presents", () => {
    const raw = fs.readFileSync(path.join(__dirname, "sample.txt"), "utf8").trimEnd();
    const { shapes, regions } = parseShapesAndRegions(raw);
    const fittable = countFittableRegions(shapes, regions);
    assert.strictEqual(fittable, 2);
});

test("Day 12 solution reports the expected count of fittable regions for the puzzle input", () => {
    const scriptPath = path.join(__dirname, "solve.js");
    const { exitCode, stdout, stderr } = runSolution(scriptPath, { cwd: __dirname });
    assert.strictEqual(exitCode, 0, `solve.js exited with code ${exitCode}\n${stderr}`);

    const match = stdout.match(/Regions that can fit all presents:\s+(\d+)/);
    assert.ok(match, `Output missing fittable region count\n${stdout}`);
    assert.strictEqual(Number(match[1]), 505);
});
