"use strict";

const { loadInput } = require("../util/input");

/**
 * Convert raw multiline text into an array of character arrays.
 */
function parseGrid(raw) {
    return raw
        .trimEnd()
        .split(/\r?\n/)
        .map((line) => line.split(""));
}

/**
 * Add a 1-cell border of the given fill character around the grid.
 */
function addBorder(grid, fill = ".") {
    const rows = grid.length;
    const cols = grid[0]?.length ?? 0;
    const bordered = Array.from({ length: rows + 2 }, () =>
        Array.from({ length: cols + 2 }, () => fill)
    );

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            bordered[r + 1][c + 1] = grid[r][c];
        }
    }

    return bordered;
}

/**
 * Count adjacent rolls in the eight neighbors around (r, c) within a bordered grid.
 */
function neighborRolls(bordered, r, c, rollChar = "@") {
    let count = 0;
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            if (bordered[r + dr][c + dc] === rollChar) {
                count += 1;
            }
        }
    }
    return count;
}

/**
 * Identify rolls accessible to forklifts (fewer than 4 adjacent rolls).
 */
function findAccessibleRolls(grid, rollChar = "@") {
    const bordered = addBorder(grid, ".");
    const rows = bordered.length;
    const cols = bordered[0]?.length ?? 0;

    let count = 0;

    for (let r = 1; r < rows - 1; r++) {
        for (let c = 1; c < cols - 1; c++) {
            if (bordered[r][c] !== rollChar) continue;
            const neighbors = neighborRolls(bordered, r, c, rollChar);
            if (neighbors < 4) {
                count += 1;
            }
        }
    }

    return { count };
}

/**
 * Create a marked grid showing accessible rolls as "x" for visualization/testing.
 */
function markAccessibleRolls(grid, rollChar = "@", markChar = "x") {
    const bordered = addBorder(grid, ".");
    const rows = bordered.length;
    const cols = bordered[0]?.length ?? 0;
    const marked = bordered.map((row) => row.slice());

    for (let r = 1; r < rows - 1; r++) {
        for (let c = 1; c < cols - 1; c++) {
            if (bordered[r][c] !== rollChar) continue;
            const neighbors = neighborRolls(bordered, r, c, rollChar);
            if (neighbors < 4) {
                marked[r][c] = markChar;
            }
        }
    }

    return marked;
}

/**
 * Repeatedly remove accessible rolls until none remain.
 * Returns the total number of rolls removed.
 */
function totalRemovableRolls(grid, rollChar = "@") {
    // Work on a bordered grid so neighbor checks skip bounds tests.
    const bordered = addBorder(grid, ".");
    const rows = bordered.length;
    const cols = bordered[0]?.length ?? 0;

    let removed = 0;
    let changed = true;

    while (changed) {
        changed = false;
        const toRemove = [];

        for (let r = 1; r < rows - 1; r++) {
            for (let c = 1; c < cols - 1; c++) {
                if (bordered[r][c] !== rollChar) continue;
                if (neighborRolls(bordered, r, c, rollChar) < 4) {
                    toRemove.push([r, c]);
                }
            }
        }

        if (toRemove.length === 0) {
            break;
        }

        for (const [r, c] of toRemove) {
            bordered[r][c] = ".";
        }

        removed += toRemove.length;
        changed = true;
    }

    return removed;
}

function main() {
    const raw = loadInput(process.argv[2], { baseDir: __dirname });
    const grid = parseGrid(raw);
    const { count } = findAccessibleRolls(grid);
    const removed = totalRemovableRolls(grid);
    console.log(`Accessible rolls: ${count}`);
    console.log(`Total removable rolls: ${removed}`);
}

if (require.main === module) {
    main();
}

module.exports = {
    parseGrid,
    addBorder,
    neighborRolls,
    findAccessibleRolls,
    markAccessibleRolls,
    totalRemovableRolls,
};
