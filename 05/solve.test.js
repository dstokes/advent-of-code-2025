"use strict";

const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const {
    parseDatabase,
    mergeRanges,
    countFreshIngredients,
    countIdsInRanges,
} = require("./solve");

test("sample database counts three fresh ingredient IDs", () => {
    const raw = fs.readFileSync(path.join(__dirname, "sample.txt"), "utf8");
    const { ranges, ingredientIds } = parseDatabase(raw);
    const merged = mergeRanges(ranges);

    assert.deepStrictEqual(merged, [
        [3, 5],
        [10, 20],
    ]);

    const freshCount = countFreshIngredients(merged, ingredientIds);
    assert.strictEqual(freshCount, 3);

    const totalFreshIds = countIdsInRanges(merged);
    assert.strictEqual(totalFreshIds, 14);
});
