"use strict";

const test = require("node:test");
const assert = require("node:assert");
const path = require("node:path");
const { runSolution } = require("../util/runSolution");

test("Day 02 solves with expected answers", () => {
    const scriptPath = path.join(__dirname, "solve.js");
    const { stdout, stderr, exitCode, durationMs } = runSolution(scriptPath, { cwd: __dirname });

    assert.strictEqual(exitCode, 0, `solve.js exited with code ${exitCode}\n${stderr}`);

    const part1Match = stdout.match(/Part 1:\s+(\d+)/);
    const part2Match = stdout.match(/Part 2:\s+(\d+)/);

    assert.ok(part1Match, `Part 1 output missing\n${stdout}`);
    assert.ok(part2Match, `Part 2 output missing\n${stdout}`);

    const part1 = BigInt(part1Match[1]);
    const part2 = BigInt(part2Match[1]);

    assert.strictEqual(part1, 24043483400n);
    assert.strictEqual(part2, 38262920235n);

    console.log(`Day 02 solved in ${durationMs.toFixed(2)}ms`);
});
