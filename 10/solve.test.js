"use strict";

const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const {
    parseMachines,
    minPressesForMachine,
    totalMinPresses,
    minCounterPresses,
    totalMinCounterPresses,
} = require("./solve");
const { runSolution } = require("../util/runSolution");

test("sample machines require the expected minimum button presses", () => {
    const raw = fs.readFileSync(path.join(__dirname, "sample.txt"), "utf8").trimEnd();
    const machines = parseMachines(raw);

    const perMachine = machines.map(minPressesForMachine);
    assert.deepStrictEqual(perMachine, [2, 3, 2]);
    assert.strictEqual(totalMinPresses(machines), 7);
});

test("Day 10 solution reports the expected total presses for the puzzle input", () => {
    const scriptPath = path.join(__dirname, "solve.js");
    const { exitCode, stdout, stderr } = runSolution(scriptPath, { cwd: __dirname });
    assert.strictEqual(exitCode, 0, `solve.js exited with code ${exitCode}\n${stderr}`);

    const match = stdout.match(/Fewest button presses across all machines:\s+(\d+)/);
    assert.ok(match, `Output missing total press count\n${stdout}`);
    assert.strictEqual(Number(match[1]), 401);
});

test("sample machines require expected minimum presses in joltage mode", () => {
    const raw = fs.readFileSync(path.join(__dirname, "sample.txt"), "utf8").trimEnd();
    const machines = parseMachines(raw);

    const perMachine = machines.map(minCounterPresses);
    assert.deepStrictEqual(perMachine, [10, 12, 11]);
    assert.strictEqual(totalMinCounterPresses(machines), 33);
});
