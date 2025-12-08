"use strict";

const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const { parseWorksheet, evaluateProblem, grandTotal } = require("./solve");
const { runSolution } = require("../util/runSolution");

test("parses the sample worksheet into four columnar problems", () => {
    const raw = fs.readFileSync(path.join(__dirname, "sample.txt"), "utf8");
    const problems = parseWorksheet(raw);

    assert.deepStrictEqual(problems, [
        { operator: "*", operands: [123, 45, 6] },
        { operator: "+", operands: [328, 64, 98] },
        { operator: "*", operands: [51, 387, 215] },
        { operator: "+", operands: [64, 23, 314] },
    ]);
});

test("sums the sample worksheet answers to match the puzzle example", () => {
    const raw = fs.readFileSync(path.join(__dirname, "sample.txt"), "utf8");
    const problems = parseWorksheet(raw);

    const answers = problems.map(evaluateProblem);
    assert.deepStrictEqual(answers, [33210, 490, 4243455, 401]);
    assert.strictEqual(grandTotal(problems), 4277556);
});

test("part two sample recalculates grand total right-to-left", () => {
    const raw = fs.readFileSync(path.join(__dirname, "sample.txt"), "utf8");
    const problems = parseWorksheet(raw, { mode: "rtl" });

    const answers = problems.map(evaluateProblem);
    assert.deepStrictEqual(answers, [1058, 3253600, 625, 8544]);
    assert.strictEqual(grandTotal(problems), 3263827);
});

test("Day 06 solution reports the expected grand totals for the puzzle input", () => {
    const scriptPath = path.join(__dirname, "solve.js");
    const { exitCode, stdout, stderr } = runSolution(scriptPath, { cwd: __dirname });
    assert.strictEqual(exitCode, 0, `solve.js exited with code ${exitCode}\n${stderr}`);

    const match1 = stdout.match(/Grand total \(part 1\):\s+(\d+)/);
    const match2 = stdout.match(/Grand total \(part 2\):\s+(\d+)/);
    assert.ok(match1, `Output missing part 1 grand total\n${stdout}`);
    assert.ok(match2, `Output missing part 2 grand total\n${stdout}`);
    assert.strictEqual(Number(match1[1]), 6371789547734);
    assert.strictEqual(Number(match2[1]), 11419862653216);
});
