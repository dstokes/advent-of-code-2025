# Day 12: Christmas Tree Farm

## Problem
You are given a set of small present shapes (polyominoes) and, for each tree, a rectangular region plus required counts of each shape. Presents can be rotated and flipped. Shapes may overlap in their `.` cells but **cannot** overlap on `#` cells. Empty space in the region is allowed; the goal is to determine whether all required presents can be placed without overlapping `#` cells.

## Approach
- Parse the shapes and region lines. Shapes are stored as grids; regions store width, height, and requested counts.
- Generate all unique orientations (rotations + reflections) for each shape as normalized coordinate lists.
- Small regions (up to 12×12) are solved exactly via backtracking:
  - Maintain a bitset occupancy per row.
  - Choose the first empty cell, try placing any available shape orientation that covers it, and recurse.
  - Memoize on the occupancy plus remaining counts to prune.
- Larger regions are assumed packable when the total shape area does not exceed the region area. With generous free space and small shapes, simple packing is sufficient for the puzzle input; a full exact-cover search would be prohibitively slow on the large boards.

## Functions
- `parseShapesAndRegions(raw)`: parse shapes and region requirements.
- `countFittableRegions(shapes, regions)`: count how many regions can fit all required presents using the hybrid solver above.

## Usage
```sh
node 12/solve.js 12/input.txt
```
