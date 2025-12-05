"use strict";

const { loadInput } = require("../util/input");

/**
 * Parse the raw database text into range tuples and ingredient ID integers.
 * Splits on the first blank line; ranges are inclusive start-end pairs.
 */
function parseDatabase(raw) {
    const [rangesPart = "", idsPart = ""] = raw.split(/\r?\n\r?\n/, 2);

    const parseRange = (line) => {
        const [startStr, endStr] = line.split("-");
        const start = Number(startStr);
        const end = Number(endStr);
        if (!Number.isFinite(start) || !Number.isFinite(end)) {
            throw new Error(`Invalid range line: ${line}`);
        }
        if (end < start) {
            throw new Error(`Range end before start: ${line}`);
        }
        return [start, end];
    };

    const parseId = (line) => {
        const value = Number(line);
        if (!Number.isFinite(value)) {
            throw new Error(`Invalid ingredient ID: ${line}`);
        }
        return value;
    };

    const ranges = rangesPart
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .map(parseRange);

    const ingredientIds = idsPart
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .map(parseId);

    return { ranges, ingredientIds };
}

/**
 * Merge overlapping or adjacent inclusive ranges after sorting by start.
 */
function mergeRanges(ranges) {
    const sorted = [...ranges].sort((a, b) => a[0] - b[0]);
    const merged = [];

    for (const [start, end] of sorted) {
        const last = merged[merged.length - 1];
        if (last && start <= last[1] + 1) {
            last[1] = Math.max(last[1], end);
        } else {
            merged.push([start, end]);
        }
    }

    return merged;
}

/**
 * Determine if a value falls within any merged, sorted inclusive ranges.
 */
function isFresh(mergedRanges, value) {
    for (const [start, end] of mergedRanges) {
        if (value < start) {
            return false;
        }
        if (value <= end) {
            return true;
        }
    }
    return false;
}

/**
 * Count how many ingredient IDs are fresh using merged ranges and a simple scan.
 */
function countFreshIngredients(mergedRanges, ingredientIds) {
    let count = 0;
    for (const id of ingredientIds) {
        if (isFresh(mergedRanges, id)) {
            count += 1;
        }
    }
    return count;
}

/**
 * Count the total number of integer IDs covered by merged, inclusive ranges.
 */
function countIdsInRanges(mergedRanges) {
    let total = 0;
    for (const [start, end] of mergedRanges) {
        total += end - start + 1;
    }
    return total;
}

if (require.main === module) {
    const raw = loadInput(process.argv[2], { baseDir: __dirname });
    const { ranges, ingredientIds } = parseDatabase(raw);
    const merged = mergeRanges(ranges);
    const freshCount = countFreshIngredients(merged, ingredientIds);
    const rangeFreshCount = countIdsInRanges(merged);

    console.log(`Fresh ingredient IDs: ${freshCount}`);
    console.log(`IDs considered fresh by ranges: ${rangeFreshCount}`);
}

module.exports = {
    parseDatabase,
    mergeRanges,
    countFreshIngredients,
    countIdsInRanges,
};
