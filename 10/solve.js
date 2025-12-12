"use strict";

const { loadInput } = require("../util/input");

function parseMachines(raw) {
    return raw
        .trimEnd()
        .split(/\r?\n/)
        .filter(Boolean)
        .map((line) => {
            const [diagramPart, rest] = line.split("]");
            const diagram = diagramPart.slice(1);
            const buttons = [];
            for (const match of rest.matchAll(/\(([^)]*)\)/g)) {
                const cells = match[1]
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean)
                    .map(Number);
                buttons.push(cells);
            }
            const countersMatch = line.match(/\{([^}]*)\}/);
            const counters = countersMatch ? countersMatch[1].split(",").map((n) => Number(n.trim())) : [];
            const targetMask = diagram
                .split("")
                .reduce((mask, ch, idx) => (ch === "#" ? mask | (1n << BigInt(idx)) : mask), 0n);
            const buttonMasks = buttons.map((cells) =>
                cells.reduce((mask, c) => mask | (1n << BigInt(c)), 0n)
            );
            return { lights: diagram.length, targetMask, buttonMasks, buttons, counters };
        });
}

function bitCount(n) {
    let count = 0;
    while (n) {
        n &= n - 1n;
        count++;
    }
    return count;
}

/**
 * Solve the linear system over GF(2) to find the minimum number of button presses.
 */
function minPressesForMachine(machine) {
    const { lights, targetMask, buttonMasks } = machine;
    const buttons = buttonMasks.length;

    if (buttons === 0) return bitCount(targetMask); // no buttons: only works if target all off

    // Build matrix: one row per light, one column per button.
    const rows = Array.from({ length: lights }, () => 0n);
    const targets = Array(lights).fill(0);
    for (let light = 0; light < lights; light++) {
        let mask = 0n;
        for (let b = 0; b < buttons; b++) {
            if (buttonMasks[b] & (1n << BigInt(light))) {
                mask |= 1n << BigInt(b);
            }
        }
        rows[light] = mask;
        targets[light] = Number((targetMask >> BigInt(light)) & 1n);
    }

    // Gaussian elimination to reduced row echelon form.
    const pivotForRow = Array(lights).fill(-1);
    let r = 0;
    for (let col = 0; col < buttons && r < lights; col++) {
        let pivot = r;
        while (pivot < lights && ((rows[pivot] >> BigInt(col)) & 1n) === 0n) {
            pivot++;
        }
        if (pivot === lights) continue;
        // swap
        [rows[r], rows[pivot]] = [rows[pivot], rows[r]];
        [targets[r], targets[pivot]] = [targets[pivot], targets[r]];
        pivotForRow[r] = col;

        // eliminate other rows in this column
        for (let rr = 0; rr < lights; rr++) {
            if (rr === r) continue;
            if ((rows[rr] >> BigInt(col)) & 1n) {
                rows[rr] ^= rows[r];
                targets[rr] ^= targets[r];
            }
        }
        r++;
    }
    const rank = r;

    // Check for inconsistency (0 = 1).
    for (let i = rank; i < lights; i++) {
        if (rows[i] === 0n && targets[i] === 1) {
            throw new Error("Machine has no solution");
        }
    }

    // Identify free variables.
    const pivotCols = new Set(pivotForRow.filter((c) => c !== -1));
    const freeCols = [];
    for (let c = 0; c < buttons; c++) {
        if (!pivotCols.has(c)) freeCols.push(c);
    }

    // Particular solution: set all free variables to 0.
    let solution = 0n;
    for (let i = 0; i < rank; i++) {
        const pivotCol = pivotForRow[i];
        const otherMask = rows[i] & ~(1n << BigInt(pivotCol));
        const parity = bitCount(otherMask & solution) % 2;
        const value = targets[i] ^ parity;
        if (value) solution |= 1n << BigInt(pivotCol);
    }

    // Nullspace basis vectors, one per free variable.
    const basis = [];
    for (const free of freeCols) {
        let vec = 0n;
        vec |= 1n << BigInt(free);
        for (let i = 0; i < rank; i++) {
            const pivotCol = pivotForRow[i];
            const rowMask = rows[i];
            const otherMask = rowMask & ~(1n << BigInt(pivotCol));
            const parity = bitCount(otherMask & vec) % 2;
            if (parity) vec |= 1n << BigInt(pivotCol);
        }
        basis.push(vec);
    }

    // Enumerate combinations if the basis is small; otherwise, use a greedy descent.
    let minPresses = bitCount(solution);
    const freeCount = basis.length;
    if (freeCount <= 20) {
        const total = 1 << freeCount;
        for (let mask = 1; mask < total; mask++) {
            let combo = solution;
            for (let i = 0; i < freeCount; i++) {
                if (mask & (1 << i)) {
                    combo ^= basis[i];
                }
            }
            const presses = bitCount(combo);
            if (presses < minPresses) minPresses = presses;
        }
    } else {
        // Greedy: flip basis vectors if they reduce press count.
        let current = solution;
        let improved = true;
        while (improved) {
            improved = false;
            for (const vec of basis) {
                const candidate = current ^ vec;
                if (bitCount(candidate) < bitCount(current)) {
                    current = candidate;
                    improved = true;
                }
            }
        }
        minPresses = bitCount(current);
    }

    return minPresses;
}

function totalMinPresses(machines) {
    return machines.reduce((sum, machine) => sum + minPressesForMachine(machine), 0);
}

/**
 * Part 2: minimum presses to reach exact counter targets with +1 increments.
 * Uses rational Gaussian elimination to find a particular rational solution and
 * an integer nullspace basis, then searches integer combinations that yield a
 * non-negative integer solution with minimal L1 norm.
 */
function minCounterPresses(machine) {
    const { counters, buttons } = machine;
    if (!counters.length) return 0;

    const m = counters.length;
    const n = buttons.length;

    // Build A matrix (m x n) over rationals
    const A = Array.from({ length: m }, () => Array(n).fill(0));
    buttons.forEach((cells, j) => {
        cells.forEach((i) => {
            if (i < m) A[i][j] = 1;
        });
    });
    const b = counters.slice();

    // Rational type as [numerator, denominator], always reduced with positive denom.
    const gcd = (a, c) => {
        a = Math.abs(a);
        c = Math.abs(c);
        while (c) [a, c] = [c, a % c];
        return a;
    };
    const normFrac = ([p, q]) => {
        if (q < 0) [p, q] = [-p, -q];
        const g = gcd(p, q);
        return [p / g, q / g];
    };
    const addF = ([a, b], [c, d]) => normFrac([a * d + c * b, b * d]);
    const subF = ([a, b], [c, d]) => normFrac([a * d - c * b, b * d]);
    const mulF = ([a, b], [c, d]) => normFrac([a * c, b * d]);
    const divF = ([a, b], [c, d]) => {
        if (c === 0) throw new Error("division by zero");
        return normFrac([a * d, b * c]);
    };

    // Build augmented matrix with b
    const M = Array.from({ length: m }, (_, i) =>
        Array.from({ length: n + 1 }, (__unused, j) => (j === n ? [b[i], 1] : [A[i][j], 1]))
    );

    const pivotCols = [];
    let row = 0;
    for (let col = 0; col < n && row < m; col++) {
        // find pivot
        let pivot = row;
        for (let r = row; r < m; r++) {
            if (M[r][col][0] !== 0) {
                pivot = r;
                break;
            }
        }
        if (M[pivot][col][0] === 0) continue;
        [M[row], M[pivot]] = [M[pivot], M[row]];
        const inv = divF([1, 1], M[row][col]);
        for (let c = col; c <= n; c++) {
            M[row][c] = mulF(M[row][c], inv);
        }
        for (let r = 0; r < m; r++) {
            if (r === row) continue;
            if (M[r][col][0] === 0) continue;
            const factor = M[r][col];
            for (let c = col; c <= n; c++) {
                M[r][c] = subF(M[r][c], mulF(factor, M[row][c]));
            }
        }
        pivotCols.push(col);
        row++;
    }
    const rank = pivotCols.length;

    // Check inconsistency (0 = nonzero)
    for (let r = rank; r < m; r++) {
        if (M[r].slice(0, n).every(([p]) => p === 0) && M[r][n][0] !== 0) {
            throw new Error("No solution found for machine in counter mode");
        }
    }

    // particular solution with free vars = 0
    const x0 = Array(n).fill([0, 1]);
    for (let r = 0; r < rank; r++) {
        const col = pivotCols[r];
        x0[col] = M[r][n];
    }

    // Nullspace basis vectors (one per free variable)
    const pivotSet = new Set(pivotCols);
    const freeCols = [];
    for (let c = 0; c < n; c++) if (!pivotSet.has(c)) freeCols.push(c);
    const basis = [];
    for (const free of freeCols) {
        const vec = Array(n).fill([0, 1]);
        vec[free] = [1, 1];
        for (let r = 0; r < rank; r++) {
            const col = pivotCols[r];
            const coeff = M[r][free];
            if (coeff[0] !== 0) {
                vec[col] = mulF(coeff, [-1, 1]);
            }
        }
        basis.push(vec);
    }

    // Convert fractions to a common integer basis
    const lcm = (a, b) => (a * b) / gcd(a, b);
    let denomLCM = 1;
    x0.forEach(([_, d]) => (denomLCM = lcm(denomLCM, d)));
    basis.forEach((vec) =>
        vec.forEach(([_, d]) => {
            denomLCM = lcm(denomLCM, d);
        })
    );

    const x0Int = x0.map(([p, q]) => (p * (denomLCM / q)) | 0);
    const basisInt = basis.map((vec) => vec.map(([p, q]) => (p * (denomLCM / q)) | 0));

    if (basisInt.length === 0) {
        if (x0Int.some((v) => v < 0)) {
            throw new Error("No solution found for machine in counter mode");
        }
        return x0Int.reduce((s, v) => s + v, 0) / denomLCM;
    }

    const freeCount = basisInt.length;
    let bestSum = Number.POSITIVE_INFINITY;
    const maxNeed = counters.reduce((s, v) => s + v, 0);
    const initRanges = Array.from({ length: freeCount }, () => [-maxNeed, maxNeed]);

    const coeffMatrix = Array.from({ length: n }, () => Array(freeCount).fill(0));
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < freeCount; j++) {
            coeffMatrix[i][j] = basisInt[j][i];
        }
    }

    const dfs = (idx, ranges, coeffs) => {
        if (idx === freeCount) {
            // Evaluate candidate
            let sum = 0;
            for (let i = 0; i < n; i++) {
                let val = x0Int[i];
                for (let j = 0; j < freeCount; j++) {
                    val += coeffs[j] * coeffMatrix[i][j];
                }
                if (val < 0 || val % denomLCM !== 0) return;
                sum += val / denomLCM;
            }
            if (sum < bestSum) bestSum = sum;
            return;
        }

        // Tighten bounds for coeffs[idx] using remaining ranges
        let lo = ranges[idx][0];
        let hi = ranges[idx][1];
        const remaining = [];
        for (let j = idx + 1; j < freeCount; j++) remaining.push([ranges[j][0], ranges[j][1]]);

        for (let i = 0; i < n; i++) {
            const coeff = coeffMatrix[i][idx];
            if (coeff === 0) continue;
            let partial = x0Int[i];
            for (let j = 0; j < idx; j++) {
                partial += coeffs[j] * coeffMatrix[i][j];
            }
            let restMax = 0;
            for (let j = idx + 1; j < freeCount; j++) {
                const c = coeffMatrix[i][j];
                const [rlo, rhi] = ranges[j];
                if (c >= 0) restMax += c * rhi;
                else restMax += c * rlo;
            }
            // Need existence of remaining vars => partial + coeff*t + restMax >= 0
            if (coeff > 0) {
                lo = Math.max(lo, Math.ceil((-partial - restMax) / coeff));
            } else {
                hi = Math.min(hi, Math.floor((-partial - restMax) / coeff));
            }
            if (lo > hi) return; // infeasible
        }

        for (let k = lo; k <= hi; k++) {
            coeffs[idx] = k;
            dfs(idx + 1, ranges, coeffs);
        }
    };

    dfs(0, initRanges, Array(freeCount).fill(0));

    if (!Number.isFinite(bestSum)) {
        throw new Error("No solution found for machine in counter mode");
    }
    return bestSum;
}

function totalMinCounterPresses(machines) {
    return machines.reduce((sum, machine) => sum + minCounterPresses(machine), 0);
}

if (require.main === module) {
    const input = loadInput(process.argv[2]);
    const machines = parseMachines(input);
    const total = totalMinPresses(machines);
    const counterTotal = totalMinCounterPresses(machines);
    console.log(`Fewest button presses across all machines: ${total}`);
    console.log(`Fewest button presses for counters: ${counterTotal}`);
}

module.exports = {
    parseMachines,
    minPressesForMachine,
    totalMinPresses,
    minCounterPresses,
    totalMinCounterPresses,
};
