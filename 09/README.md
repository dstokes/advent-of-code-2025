# Day 09: Movie Theater

## Problem
Given coordinates of red tiles, choose any two tiles as opposite corners of an axis-aligned rectangle. Compute the maximum possible area.

## Approach
- Parse coordinates into `{x, y}` pairs.
- Iterate over all unordered pairs of tiles:
  - Skip pairs sharing an x or y (not opposite corners).
  - Compute area as `abs(dx) * abs(dy)`.
  - Track the maximum.
- The brute-force `O(n^2)` scan is sufficient for the input sizes.

### Part Two
- Connecting successive red tiles (wrapping) yields a rectilinear loop; its boundary and interior are green.
- Build polygon edges from the red tiles and use point-in-polygon to treat boundary as inside.
- For each red-corner rectangle candidate, ensure all four corners are inside the polygon and that rectangle edges do not properly cross polygon edges (boundary overlaps allowed).
- Among valid rectangles, keep the largest area (still using inclusive cell area `(dx+1)*(dy+1)`).

## Functions
- `parseRedTiles(raw)`: parse lines into points.
- `largestRectangleArea(tiles)`: return the maximum rectangle area from any valid tile pair.
- `largestRectangleAreaWithGreens(tiles)`: part two constrained by the red/green polygon.

## Usage
```sh
node 09/solve.js 09/input.txt
```
