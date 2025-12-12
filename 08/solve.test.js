"use strict";

const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const { parseJunctions, largestCircuitProduct, finalConnectionProduct } = require("./solve");
const { runSolution } = require("../util/runSolution");

test("sample junction boxes produce the expected circuit product after 10 connections", () => {
    const raw = fs.readFileSync(path.join(__dirname, "sample.txt"), "utf8").trimEnd();
    const junctions = parseJunctions(raw);
    const product = largestCircuitProduct(junctions, 10);
    assert.strictEqual(product, 40);
});

test("Day 08 solution reports the expected circuit product for the puzzle input", () => {
    const scriptPath = path.join(__dirname, "solve.js");
    const { exitCode, stdout, stderr } = runSolution(scriptPath, { cwd: __dirname });
    assert.strictEqual(exitCode, 0, `solve.js exited with code ${exitCode}\n${stderr}`);

    const match = stdout.match(/Circuit product:\s+(\d+)/);
    assert.ok(match, `Output missing circuit product\n${stdout}`);
    assert.strictEqual(Number(match[1]), 79056);
});

test("sample junction boxes last-connection product equals 25272", () => {
    const raw = fs.readFileSync(path.join(__dirname, "sample.txt"), "utf8").trimEnd();
    const junctions = parseJunctions(raw);
    const product = finalConnectionProduct(junctions);
    assert.strictEqual(product, 25272);
});
