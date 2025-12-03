"use strict";

const { loadInput } = require("../util/input");

const DIAL_SIZE = 100; // numbers 0-99
// Load inputs once so solution modules can reuse them.
const input = loadInput(process.argv[2]);

/**
 * Parse rotations like "L68" or "R14" into direction and distance parts.
 * Returns an array of { dir: "L" | "R", steps: number }.
 */
function parseRotations(raw) {
    return raw
        .split(/\r?\n/)
        .filter(Boolean)
        .map((line) => {
            const match = line.match(/^([LR])(\d+)$/);
            if (!match) {
                throw new Error(`Invalid rotation line: ${line}`);
            }
            const [, dir, steps] = match;
            return { dir, steps: Number(steps) };
        });
}

/**
 * Apply rotations to the dial, starting at 50 and wrapping on a 0-99 dial.
 * Returns the final pointer and the count of times it landed on zero.
 */
function runDial(rotations, start = 50, modulo = DIAL_SIZE) {
    let pointer = ((start % modulo) + modulo) % modulo;
    let zeroCount = 0;

    for (const { dir, steps } of rotations) {
        const delta = dir === "L" ? -steps : steps;
        pointer = ((pointer + delta) % modulo + modulo) % modulo; // wrap into 0-99 even when delta is negative
        if (pointer === 0) {
            zeroCount += 1;
        }
    }

    return { pointer, zeroCount };
}

/**
 * Count clicks landing on zero during each rotation (method 0x434C49434B).
 * Returns the final pointer and total zero-clicks encountered.
 */
function runDialWithClicks(rotations, start = 50, modulo = DIAL_SIZE) {
    let pointer = ((start % modulo) + modulo) % modulo;
    let zeroClicks = 0;

    for (const { dir, steps } of rotations) {
        if (steps === 0) continue;

        const sign = dir === "R" ? 1 : -1;
        const stepToZero =
            dir === "R" ? (pointer === 0 ? modulo : modulo - pointer) : pointer || modulo;

        if (steps >= stepToZero) {
            zeroClicks += 1 + Math.floor((steps - stepToZero) / modulo); // count first hit plus full wraps
        }

        pointer = ((pointer + sign * steps) % modulo + modulo) % modulo; // wrap into 0-99 after applying signed steps
    }

    return { pointer, zeroClicks };
}

if (require.main === module) {
    const rotations1 = parseRotations(input);
    const part1 = runDial(rotations1);
    console.log(`Part 1: ${rotations1.length} rotations`);
    console.log(`  Final pointer: ${part1.pointer}`);
    console.log(`  Times at zero (end of rotation): ${part1.zeroCount}`);

    const part2 = runDialWithClicks(rotations1);
    console.log(`Part 2 (method 0x434C49434B):`);
    console.log(`  Final pointer: ${part2.pointer}`);
    console.log(`  Zero clicks (during any rotation): ${part2.zeroClicks}`);
}
