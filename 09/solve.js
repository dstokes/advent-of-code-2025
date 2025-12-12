"use strict";

const { loadInput } = require("../util/input");

function parseRedTiles(raw) {
    return raw
        .trimEnd()
        .split(/\r?\n/)
        .filter(Boolean)
        .map((line) => {
            const [x, y] = line.split(",").map(Number);
            return { x, y };
        });
}

function buildPolygonEdges(tiles) {
    const edges = [];
    for (let i = 0; i < tiles.length; i++) {
        const a = tiles[i];
        const b = tiles[(i + 1) % tiles.length];
        edges.push([a, b]);
    }
    return edges;
}

function onSegment(a, b, p) {
    return (
        Math.min(a.x, b.x) <= p.x &&
        p.x <= Math.max(a.x, b.x) &&
        Math.min(a.y, b.y) <= p.y &&
        p.y <= Math.max(a.y, b.y) &&
        (b.x - a.x) * (p.y - a.y) === (b.y - a.y) * (p.x - a.x)
    );
}

function pointInPolygon(point, edges) {
    // Inclusive: points on boundary are considered inside.
    let crossings = 0;
    for (const [a, b] of edges) {
        if (onSegment(a, b, point)) return true;
        const minY = Math.min(a.y, b.y);
        const maxY = Math.max(a.y, b.y);
        if (point.y < minY || point.y >= maxY) continue;
        const xIntersect = a.x + ((point.y - a.y) * (b.x - a.x)) / (b.y - a.y);
        if (xIntersect > point.x) crossings++;
    }
    return crossings % 2 === 1;
}

function segmentsProperlyCross(a, b, c, d) {
    const orient = (p, q, r) => (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
    const o1 = orient(a, b, c);
    const o2 = orient(a, b, d);
    const o3 = orient(c, d, a);
    const o4 = orient(c, d, b);
    if (o1 === 0 && onSegment(a, b, c)) return false;
    if (o2 === 0 && onSegment(a, b, d)) return false;
    if (o3 === 0 && onSegment(c, d, a)) return false;
    if (o4 === 0 && onSegment(c, d, b)) return false;
    return o1 * o2 < 0 && o3 * o4 < 0;
}

/**
 * Determine whether an axis-aligned rectangle with corners p1 (x1,y1) and p2 (x2,y2)
 * lies entirely within (or on the boundary of) the polygon defined by edges.
 */
function rectangleInsidePolygon(p1, p2, edges) {
    const x1 = Math.min(p1.x, p2.x);
    const x2 = Math.max(p1.x, p2.x);
    const y1 = Math.min(p1.y, p2.y);
    const y2 = Math.max(p1.y, p2.y);
    const corners = [
        { x: x1, y: y1 },
        { x: x1, y: y2 },
        { x: x2, y: y1 },
        { x: x2, y: y2 },
    ];

    if (!corners.every((c) => pointInPolygon(c, edges))) return false;

    // Check rectangle edges for proper crossings with polygon edges (excluding shared boundaries).
    const rectEdges = [
        [corners[0], corners[1]],
        [corners[0], corners[2]],
        [corners[1], corners[3]],
        [corners[2], corners[3]],
    ];
    for (const [r1, r2] of rectEdges) {
        for (const [p, q] of edges) {
            if (segmentsProperlyCross(r1, r2, p, q)) return false;
        }
    }
    return true;
}

/**
 * Compute the largest rectangle area formed by choosing any two red tiles
 * as opposite corners of an axis-aligned rectangle.
 */
function largestRectangleArea(tiles) {
    let maxArea = 0;
    for (let i = 0; i < tiles.length; i++) {
        for (let j = i + 1; j < tiles.length; j++) {
            const a = tiles[i];
            const b = tiles[j];
            if (a.x === b.x || a.y === b.y) continue; // need opposite corners
            const area = (Math.abs(a.x - b.x) + 1) * (Math.abs(a.y - b.y) + 1);
            if (area > maxArea) maxArea = area;
        }
    }
    return maxArea;
}

/**
 * Part 2: Only red/green tiles are allowed. Green tiles form the rectilinear polygon
 * traced by connecting consecutive red tiles (wrapping) and filling its interior.
 * Compute the largest rectangle using red opposite corners and only red/green tiles.
 */
function largestRectangleAreaWithGreens(tiles) {
    const edges = buildPolygonEdges(tiles);
    let maxArea = 0;
    for (let i = 0; i < tiles.length; i++) {
        for (let j = i + 1; j < tiles.length; j++) {
            const a = tiles[i];
            const b = tiles[j];
            if (a.x === b.x || a.y === b.y) continue;
            const c = { x: a.x, y: b.y };
            const d = { x: b.x, y: a.y };
            if (!rectangleInsidePolygon(a, b, edges)) continue;
            const area = (Math.abs(a.x - b.x) + 1) * (Math.abs(a.y - b.y) + 1);
            if (area > maxArea) maxArea = area;
        }
    }
    return maxArea;
}

if (require.main === module) {
    const input = loadInput(process.argv[2]);
    const tiles = parseRedTiles(input);
    const area = largestRectangleArea(tiles);
    const greenArea = largestRectangleAreaWithGreens(tiles);
    console.log(`Largest rectangle area: ${area}`);
    console.log(`Largest rectangle area with greens: ${greenArea}`);
}

module.exports = {
    parseRedTiles,
    largestRectangleArea,
    largestRectangleAreaWithGreens,
};
