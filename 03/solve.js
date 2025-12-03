"use strict";

const { loadInput } = require("../util/input");

/**
 * Split raw multiline input into battery banks, skipping blank lines.
 * Each bank is returned as its digit string.
 */
function parseBanks(raw) {
    return raw.split(/\r?\n/).filter((line) => line.trim() !== "");
}

/**
 * Choose the lexicographically largest subsequence of `pick` digits from the bank.
 * Uses a monotonic stack: pop smaller digits while there's room to skip them and
 * still fill the required length.
 */
function maxBankJoltage(bank, pick = 2) {
    if (pick <= 0 || pick > bank.length) {
        throw new Error(`Bank length ${bank.length} cannot satisfy pick=${pick}`);
    }

    const stack = [];
    for (let i = 0; i < bank.length; i++) {
        const ch = bank[i];
        const digit = Number(ch);
        if (!Number.isInteger(digit) || digit < 0 || digit > 9) {
            throw new Error(`Invalid digit in bank: ${ch}`);
        }

        while (
            stack.length > 0 &&
            stack[stack.length - 1] < ch &&
            stack.length - 1 + (bank.length - i) >= pick
        ) {
            stack.pop();
        }

        if (stack.length < pick) {
            stack.push(ch);
        }
    }

    const valueStr = stack.slice(0, pick).join("");
    return BigInt(valueStr);
}

/**
 * Sum the maximum joltage of each bank to produce the total output.
 */
function totalOutputJoltage(banks, pick = 2) {
    return banks.reduce((acc, bank) => acc + maxBankJoltage(bank, pick), 0n);
}

function main() {
    const raw = loadInput(process.argv[2]);
    const banks = parseBanks(raw);
    const part1 = totalOutputJoltage(banks, 2);
    const part2 = totalOutputJoltage(banks, 12);
    console.log(`Part 1 total output joltage: ${part1.toString()}`);
    console.log(`Part 2 total output joltage: ${part2.toString()}`);
}

if (require.main === module) {
    main();
}

module.exports = {
    parseBanks,
    maxBankJoltage,
    totalOutputJoltage,
};
