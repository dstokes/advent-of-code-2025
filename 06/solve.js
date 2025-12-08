"use strict";

const { loadInput } = require("../util/input");

/**
 * Parse a worksheet laid out in vertical columns into structured problems.
 * Pads all lines to equal width, slices the grid into column spans separated by
 * all-space columns, then reads operands above and the operator on the bottom row.
 */
function parseWorksheet(raw, { mode = "ltr" } = {}) {
    const lines = raw.split(/\r?\n/);
    // Drop trailing empty lines so the bottom-most content line holds the operators.
    while (lines.length > 0 && lines[lines.length - 1].trim() === "") {
        lines.pop();
    }
    if (lines.length === 0) {
        return [];
    }

    const operatorRow = lines.length - 1;
    const width = Math.max(...lines.map((line) => line.length));
    const padded = lines.map((line) => line.padEnd(width, " "));
    const operandRows = padded.slice(0, operatorRow);
    const operatorLine = padded[operatorRow];

    // Identify columns that are entirely spaces across all rows.
    const separators = new Set();
    for (let col = 0; col < width; col += 1) {
        const empty = padded.every((line) => line[col] === " ");
        if (empty) {
            separators.add(col);
        }
    }

    // Build spans of contiguous non-separator columns.
    const spans = [];
    let spanStart = null;
    for (let col = 0; col < width; col += 1) {
        const isSep = separators.has(col);
        if (!isSep && spanStart === null) {
            spanStart = col;
        } else if (isSep && spanStart !== null) {
            spans.push([spanStart, col - 1]);
            spanStart = null;
        }
    }
    if (spanStart !== null) {
        spans.push([spanStart, width - 1]);
    }

    const problems = spans.map(([start, end], index) => {
        const operatorSlice = operatorLine.slice(start, end + 1);
        const operator = operatorSlice.trim()[0];
        if (operator !== "+" && operator !== "*") {
            throw new Error(`Unknown operator in columns ${start}-${end}: ${operatorSlice}`);
        }

        let operands = [];
        if (mode === "ltr") {
            for (let row = 0; row < operatorRow; row += 1) {
                const cell = operandRows[row].slice(start, end + 1).trim();
                if (cell.length === 0) {
                    continue;
                }
                const value = Number(cell);
                if (!Number.isFinite(value)) {
                    throw new Error(`Invalid operand "${cell}" in columns ${start}-${end}`);
                }
                operands.push(value);
            }
        } else if (mode === "rtl") {
            for (let col = end; col >= start; col -= 1) {
                let digits = "";
                for (let row = 0; row < operatorRow; row += 1) {
                    const ch = operandRows[row][col];
                    if (ch !== " ") {
                        digits += ch;
                    }
                }
                if (digits.length === 0) {
                    continue;
                }
                const value = Number(digits);
                if (!Number.isFinite(value)) {
                    throw new Error(`Invalid operand digits "${digits}" at column ${col}`);
                }
                operands.push(value);
            }
        } else {
            throw new Error(`Unknown parse mode: ${mode}`);
        }

        if (operands.length === 0) {
            throw new Error(`No operands found for operator at columns ${start}-${end}`);
        }

        return { operator, operands, spanIndex: index };
    });

    if (mode === "rtl") {
        problems.sort((a, b) => b.spanIndex - a.spanIndex);
    }

    return problems.map(({ operator, operands }) => ({ operator, operands }));
}

/**
 * Evaluate a single parsed problem by applying the operator to all operands.
 */
function evaluateProblem(problem) {
    const { operator, operands } = problem;
    if (operator === "+") {
        return operands.reduce((sum, value) => sum + value, 0);
    }
    if (operator === "*") {
        return operands.reduce((product, value) => product * value, 1);
    }
    throw new Error(`Unsupported operator: ${operator}`);
}

/**
 * Sum the evaluated results of every problem on the worksheet.
 */
function grandTotal(problems) {
    return problems.reduce((total, problem) => total + evaluateProblem(problem), 0);
}

function main() {
    const raw = loadInput(undefined, { trimEnd: false, baseDir: __dirname });
    const problemsPart1 = parseWorksheet(raw, { mode: "ltr" });
    const problemsPart2 = parseWorksheet(raw, { mode: "rtl" });
    const total1 = grandTotal(problemsPart1);
    const total2 = grandTotal(problemsPart2);
    console.log(`Grand total (part 1): ${total1}`);
    console.log(`Grand total (part 2): ${total2}`);
}

if (require.main === module) {
    main();
}

module.exports = {
    parseWorksheet,
    evaluateProblem,
    grandTotal,
};
