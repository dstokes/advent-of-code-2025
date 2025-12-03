"use strict";

const test = require("node:test");
const assert = require("node:assert");
const path = require("node:path");
const { runSolution } = require("../util/runSolution");

test("Day 01 solves with expected answers", () => {
    const scriptPath = path.join(__dirname, "solve.js");
    const { stdout, stderr, exitCode, durationMs } = runSolution(scriptPath, { cwd: __dirname });

    assert.strictEqual(exitCode, 0, `solve.js exited with code ${exitCode}\n${stderr}`);

    const zeroMatch = stdout.match(/Times at zero \(end of rotation\):\s+(\d+)/);
    const clickMatch = stdout.match(/Zero clicks \(during any rotation\):\s+(\d+)/);

    assert.ok(zeroMatch, `Part 1 output missing\n${stdout}`);
    assert.ok(clickMatch, `Part 2 output missing\n${stdout}`);

    const part1 = Number(zeroMatch[1]);
    const part2 = Number(clickMatch[1]);

    assert.strictEqual(part1, 1158);
    assert.strictEqual(part2, 6860);

    console.log(`Day 01 solved in ${durationMs.toFixed(2)}ms`);
});
