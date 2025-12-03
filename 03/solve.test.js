"use strict";

const test = require("node:test");
const assert = require("node:assert");
const path = require("node:path");
const fs = require("node:fs");
const { parseBanks, maxBankJoltage, totalOutputJoltage } = require("./solve");
const { runSolution } = require("../util/runSolution");

test("example banks produce the expected maximum joltage for parts 1 and 2", () => {
    const samplePath = path.join(__dirname, "sample.txt");
    const sample = fs.readFileSync(samplePath, "utf8").trimEnd();
    const banks = parseBanks(sample);

    const perBankPart1 = banks.map((b) => maxBankJoltage(b, 2));
    assert.deepStrictEqual(perBankPart1, [98n, 89n, 78n, 92n]);
    assert.strictEqual(totalOutputJoltage(banks, 2), 357n);

    const perBankPart2 = banks.map((b) => maxBankJoltage(b, 12));
    assert.deepStrictEqual(perBankPart2, [
        987654321111n,
        811111111119n,
        434234234278n,
        888911112111n,
    ]);
    assert.strictEqual(totalOutputJoltage(banks, 12), 3121910778619n);
});

test("Day 03 solve.js reports the correct totals", () => {
    const scriptPath = path.join(__dirname, "solve.js");
    const { stdout, stderr, exitCode, durationMs } = runSolution(scriptPath, { cwd: __dirname });

    assert.strictEqual(exitCode, 0, `solve.js exited with code ${exitCode}\n${stderr}`);

    const part1Match = stdout.match(/Part 1 total output joltage:\s+(\d+)/);
    const part2Match = stdout.match(/Part 2 total output joltage:\s+(\d+)/);
    assert.ok(part1Match, `Output missing part 1 total:\n${stdout}`);
    assert.ok(part2Match, `Output missing part 2 total:\n${stdout}`);

    assert.strictEqual(BigInt(part1Match[1]), 17196n);
    assert.strictEqual(BigInt(part2Match[1]), 171039099596062n);

    console.log(`Day 03 solved in ${durationMs.toFixed(2)}ms`);
});
