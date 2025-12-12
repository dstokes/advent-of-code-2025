"use strict";

const { loadInput } = require("../util/input");

/**
 * Parse the manifold diagram into a 2D array of characters.
 */
function parseManifold(raw) {
    return raw
        .trimEnd()
        .split(/\r?\n/)
        .map((line) => line.split(""));
}

/**
 * Count how many times downward-moving tachyon beams are split by splitters (^).
 * Beams always move downward; when a beam hits a splitter, it stops and two new
 * beams are emitted from the immediate left and right of the splitter and continue
 * downward. Each encounter with a splitter counts as one split event.
 */
function countSplits(grid) {
    const height = grid.length;
    const width = grid[0].length;

    let startRow = -1;
    let startCol = -1;
    for (let r = 0; r < height && startCol === -1; r++) {
        const c = grid[r].indexOf("S");
        if (c !== -1) {
            startRow = r;
            startCol = c;
            break;
        }
    }
    if (startCol === -1 || startRow === -1) {
        throw new Error("No starting position S found");
    }

    let splitCount = 0;
    const queue = [{ row: startRow, col: startCol }];
    const seenStarts = new Set();
    const seenSplitters = new Set();

    while (queue.length) {
        const { row: startRow, col } = queue.shift();
        const startKey = `${startRow},${col}`;
        if (seenStarts.has(startKey)) continue;
        seenStarts.add(startKey);

        for (let r = startRow + 1; r < height; r++) {
            const cell = grid[r][col];
            if (cell === "^") {
                const splitKey = `${r},${col}`;
                if (!seenSplitters.has(splitKey)) {
                    splitCount += 1;
                    seenSplitters.add(splitKey);
                }

                if (col - 1 >= 0) queue.push({ row: r, col: col - 1 });
                if (col + 1 < width) queue.push({ row: r, col: col + 1 });
                break; // the current beam stops here
            }
        }
    }

    return splitCount;
}

/**
 * Quantum mode: count the number of distinct timelines a single tachyon particle
 * can take as it follows both branches at every splitter. This is equivalent to
 * counting the number of beams that eventually exit the manifold when beams split
 * left/right at each splitter without merging their timeline counts.
 */
function countTimelines(grid) {
    const height = grid.length;
    const width = grid[0].length;

    let startRow = -1;
    let startCol = -1;
    for (let r = 0; r < height && startCol === -1; r++) {
        const c = grid[r].indexOf("S");
        if (c !== -1) {
            startRow = r;
            startCol = c;
            break;
        }
    }
    if (startCol === -1 || startRow === -1) {
        throw new Error("No starting position S found");
    }

    const memo = new Map(); // key "row,col" -> BigInt timelines exiting

    const timelinesFrom = (row, col) => {
        const key = `${row},${col}`;
        if (memo.has(key)) return memo.get(key);

        let nextSplitter = -1;
        for (let r = row + 1; r < height; r++) {
            if (grid[r][col] === "^") {
                nextSplitter = r;
                break;
            }
        }

        if (nextSplitter === -1) {
            memo.set(key, 1n);
            return 1n;
        }

        let total = 0n;
        const leftCol = col - 1;
        const rightCol = col + 1;

        if (leftCol >= 0) {
            total += timelinesFrom(nextSplitter, leftCol);
        } else {
            total += 1n;
        }

        if (rightCol < width) {
            total += timelinesFrom(nextSplitter, rightCol);
        } else {
            total += 1n;
        }

        memo.set(key, total);
        return total;
    };

    return timelinesFrom(startRow, startCol);
}

if (require.main === module) {
    const input = loadInput(process.argv[2]);
    const grid = parseManifold(input);
    const splits = countSplits(grid);
    const timelines = countTimelines(grid);
    console.log(`Beam splits: ${splits}`);
    console.log(`Timelines: ${timelines}`);
}

module.exports = {
    parseManifold,
    countSplits,
    countTimelines,
};
