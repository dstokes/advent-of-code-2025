"use strict";

const { loadInput } = require("../util/input");

// Parse comma-separated ranges like "11-22" into {start, end} BigInt objects.
function parseRanges(raw) {
    return raw
        .split(",")
        .filter(Boolean)
        .map((part) => {
            const [start, end] = part.split("-");
            return { start: BigInt(start), end: BigInt(end) };
        });
}

// Merge overlapping or adjacent ranges to simplify membership checks.
function mergeRanges(ranges) {
    const sorted = [...ranges].sort((a, b) => (a.start < b.start ? -1 : a.start > b.start ? 1 : 0));
    const merged = [];
    for (const range of sorted) {
        const last = merged[merged.length - 1];
        if (last && range.start <= last.end + 1n) {
            last.end = range.end > last.end ? range.end : last.end;
        } else {
            merged.push({ ...range });
        }
    }
    return merged;
}

// Find the maximum digit length among all range endpoints.
function getMaxDigits(ranges) {
    let max = 0;
    for (const { end } of ranges) {
        const len = end.toString().length;
        if (len > max) max = len;
    }
    return max;
}

// Sum all IDs that consist of a substring repeated twice and fall within the merged ranges.
// Approach:
//   1) Merge ranges so membership checks are linear and ordered.
//   2) Iterate over even digit lengths; construct candidates by string-doubling a prefix (e.g., "123" -> "123123").
//      Skip lengths that are entirely below/above the merged bounds to avoid wasted work.
//   3) Advance a single pointer through merged ranges as candidates grow; add a candidate when it falls inside
//      the current range, and exit early once candidates exceed the final range.
function sumRepeatedIds(ranges) {
    const merged = mergeRanges(ranges);
    if (merged.length === 0) return 0n;

    const maxDigits = getMaxDigits(merged);
    const maxEnd = merged[merged.length - 1].end;
    const minStart = merged[0].start;

    let rangeIndex = 0;
    let total = 0n;

    for (let totalDigits = 2; totalDigits <= maxDigits; totalDigits += 2) {
        const halfDigits = totalDigits / 2;
        const prefixStart = 10 ** (halfDigits - 1);
        const prefixEnd = 10 ** halfDigits - 1;

        const minCandidate = BigInt(String(prefixStart) + String(prefixStart));
        if (minCandidate > maxEnd) break; // all larger lengths will exceed the max end

        const maxCandidate = BigInt(String(prefixEnd) + String(prefixEnd));
        if (maxCandidate < minStart) continue; // all numbers of this length are before our ranges

        for (let prefix = prefixStart; prefix <= prefixEnd; prefix++) {
            const candidate = BigInt(String(prefix) + String(prefix));

            while (rangeIndex < merged.length && candidate > merged[rangeIndex].end) {
                rangeIndex += 1;
            }
            if (rangeIndex >= merged.length) {
                return total; // no more ranges to check
            }

            const current = merged[rangeIndex];
            if (candidate < current.start) {
                continue;
            }
            total += candidate;
        }
    }

    return total;
}

// Sum IDs formed by repeating any non-empty substring at least twice (length is a multiple of the base substring).
// Strategy:
//   - Merge ranges for ordered membership checks.
//   - Walk digit lengths up to the max endpoint; for each divisor baseLen, repeat prefixes to build candidates.
//   - Use a seen-set per digit length to avoid duplicate numbers that have multiple factorizations.
//   - Binary-search merged ranges for membership, breaking early when candidates exceed all ranges.
function sumRepeatedIdsAtLeastTwice(ranges) {
    const merged = mergeRanges(ranges);
    if (merged.length === 0) return 0n;

    const maxDigits = getMaxDigits(merged);
    const minStart = merged[0].start;
    const maxEnd = merged[merged.length - 1].end;

    let total = 0n;

    const inRanges = (value) => {
        let lo = 0;
        let hi = merged.length - 1;
        while (lo <= hi) {
            const mid = (lo + hi) >> 1;
            const range = merged[mid];
            if (value < range.start) {
                hi = mid - 1;
            } else if (value > range.end) {
                lo = mid + 1;
            } else {
                return true;
            }
        }
        return false;
    };

    for (let totalDigits = 2; totalDigits <= maxDigits; totalDigits++) {
        const minCandidate = BigInt("1".repeat(totalDigits));
        if (minCandidate > maxEnd) break; // all longer lengths will exceed the max end

        const maxCandidate = BigInt("9".repeat(totalDigits));
        if (maxCandidate < minStart) continue; // this length is entirely below our ranges

        const seen = new Set();
        for (let baseLen = 1; baseLen <= totalDigits / 2; baseLen++) {
            if (totalDigits % baseLen !== 0) continue;
            const repeats = totalDigits / baseLen;
            const startPrefix = 10 ** (baseLen - 1);
            const endPrefix = 10 ** baseLen - 1;

            for (let prefix = startPrefix; prefix <= endPrefix; prefix++) {
                const candidate = BigInt(String(prefix).repeat(repeats));
                if (candidate > maxEnd) break; // further prefixes only increase
                if (candidate < minStart) continue;
                if (seen.has(candidate)) continue;
                if (inRanges(candidate)) {
                    total += candidate;
                    seen.add(candidate);
                }
            }
        }
    }

    return total;
}

function main() {
    const raw = loadInput(process.argv[2]);
    const ranges = parseRanges(raw);
    const part1 = sumRepeatedIds(ranges);
    const part2 = sumRepeatedIdsAtLeastTwice(ranges);
    console.log(`Part 1: ${part1.toString()}`);
    console.log(`Part 2: ${part2.toString()}`);
}

if (require.main === module) {
    main();
}
