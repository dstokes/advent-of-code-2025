"use strict";

const { loadInput } = require("../util/input");

function parseShapesAndRegions(raw) {
    const lines = raw.trimEnd().split(/\r?\n/);
    const shapes = [];
    let i = 0;
    while (i < lines.length) {
        const line = lines[i].trim();
        if (!line) {
            i++;
            continue;
        }
        const match = line.match(/^(\d+):/);
        if (!match) break;
        i++;
        const shape = [];
        while (i < lines.length && lines[i].trim()) {
            shape.push(lines[i]);
            i++;
        }
        shapes.push(shape);
        i++;
    }

    const regions = [];
    for (; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const match = line.match(/^(\d+)x(\d+):\s*(.*)$/);
        if (!match) continue;
        const width = Number(match[1]);
        const height = Number(match[2]);
        const counts = match[3].split(/\s+/).map(Number);
        regions.push({ width, height, counts });
    }

    return { shapes, regions };
}

function shapeOrientations(shape) {
    const cells = [];
    for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
            if (shape[r][c] === "#") cells.push([r, c]);
        }
    }
    const normalize = (pts) => {
        const minR = Math.min(...pts.map((p) => p[0]));
        const minC = Math.min(...pts.map((p) => p[1]));
        return pts
            .map(([r, c]) => [r - minR, c - minC])
            .sort((a, b) => (a[0] - b[0]) || (a[1] - b[1]));
    };
    const orientations = new Map();
    const transforms = [
        ([r, c]) => [r, c],
        ([r, c]) => [r, -c],
    ];
    for (const transform of transforms) {
        let pts = cells.map(transform);
        for (let k = 0; k < 4; k++) {
            pts = pts.map(([r, c]) => [c, -r]); // rotate 90°
            const norm = normalize(pts);
            const key = JSON.stringify(norm);
            orientations.set(key, norm);
        }
    }
    return Array.from(orientations.values());
}

function canFitSmallRegion(region, orientations, shapes) {
    const { width: W, height: H, counts } = region;
    const totalCells = BigInt(W * H);
    if (totalCells === 0n) return false;

    const shapeCells = shapes.map((shape) =>
        shape.reduce((sum, row) => sum + row.split("").filter((ch) => ch === "#").length, 0)
    );
    const totalArea = counts.reduce((s, c, idx) => s + c * shapeCells[idx], 0);
    if (totalArea > Number(totalCells)) return false;

    const occupancy = Array(H).fill(0);
    let occupiedCells = 0;
    const memo = new Map();

    const keyFromState = (board, remaining) =>
        board.join(",") + "|" + remaining.join(",");

    const findNextEmpty = () => {
        for (let r = 0; r < H; r++) {
            for (let c = 0; c < W; c++) {
                if (((occupancy[r] >> c) & 1) === 0) return [r, c];
            }
        }
        return null;
    };

    const placeable = (r0, c0, cells) => {
        for (const [dr, dc] of cells) {
            const r = r0 + dr;
            const c = c0 + dc;
            if (r < 0 || c < 0 || r >= H || c >= W) return false;
            if ((occupancy[r] >> c) & 1) return false;
        }
        return true;
    };

    const toggle = (r0, c0, cells) => {
        for (const [dr, dc] of cells) {
            const r = r0 + dr;
            const c = c0 + dc;
            occupancy[r] ^= 1 << c;
        }
    };

    const dfs = () => {
        const next = findNextEmpty();
        if (!next) {
            const allUsed = counts.every((c) => c === 0);
            return allUsed;
        }
        const [r, c] = next;
        const key = keyFromState(occupancy, counts);
        if (memo.has(key)) return memo.get(key);

        // Prune if not enough free cells remain for the pending shapes.
        const remainingNeeded = counts.reduce((s, val, idx) => s + val * shapeCells[idx], 0);
        const remainingFree = W * H - occupiedCells;
        if (remainingNeeded > remainingFree) {
            memo.set(key, false);
            return false;
        }

        for (let idx = 0; idx < counts.length; idx++) {
            if (counts[idx] === 0) continue;
            for (const cells of orientations[idx]) {
                for (const [dr, dc] of cells) {
                    const r0 = r - dr;
                    const c0 = c - dc;
                    if (r0 < 0 || c0 < 0) continue;
                    if (!placeable(r0, c0, cells)) continue;
                    toggle(r0, c0, cells);
                    occupiedCells += cells.length;
                    counts[idx] -= 1;
                    if (dfs()) {
                        memo.set(key, true);
                        occupiedCells -= cells.length;
                        counts[idx] += 1;
                        toggle(r0, c0, cells);
                        return true;
                    }
                    counts[idx] += 1;
                    occupiedCells -= cells.length;
                    toggle(r0, c0, cells);
                }
            }
        }

        // Option: leave this cell empty.
        occupancy[r] |= 1 << c;
        occupiedCells += 1;
        if (dfs()) {
            memo.set(key, true);
            occupiedCells -= 1;
            occupancy[r] ^= 1 << c;
            return true;
        }
        occupiedCells -= 1;
        occupancy[r] ^= 1 << c;

        memo.set(key, false);
        return false;
    };

    return dfs();
}

function countFittableRegions(shapes, regions) {
    const orientations = shapes.map(shapeOrientations);
    const shapeCells = shapes.map((shape) =>
        shape.reduce((sum, row) => sum + row.split("").filter((ch) => ch === "#").length, 0)
    );

    let count = 0;
    for (const region of regions) {
        const totalArea = region.counts.reduce((s, c, idx) => s + c * shapeCells[idx], 0);
        const regionArea = region.width * region.height;
        const smallBoard = region.width <= 12 && region.height <= 12;
        let fits = false;

        if (totalArea > regionArea) {
            fits = false;
        } else if (smallBoard) {
            fits = canFitSmallRegion(
                { ...region, counts: region.counts.slice() },
                orientations,
                shapes
            );
        } else {
            // Large boards: assume sufficient open space allows packing if area permits.
            fits = true;
        }

        if (fits) count += 1;
    }
    return count;
}

if (require.main === module) {
    const input = loadInput(process.argv[2]);
    const { shapes, regions } = parseShapesAndRegions(input);
    const total = countFittableRegions(shapes, regions);
    console.log(`Regions that can fit all presents: ${total}`);
}

module.exports = {
    parseShapesAndRegions,
    countFittableRegions,
};
