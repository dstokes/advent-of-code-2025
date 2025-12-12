# Day 07: Laboratories

## Problem
Trace a downward-moving tachyon beam through a grid. The beam starts at `S` and moves straight down. When it hits a splitter (`^`), that beam stops; two new beams continue downward from the cells immediately left and right of the splitter. Count how many times any beam encounters a splitter.

## Approach
- Parse the grid into a 2D char array.
- Locate the `S` start column (scan top row first, then fall back to a full scan).
- Simulate beams with a queue. Each item holds the starting row/col of a downward beam.
- March the beam downward until it leaves the grid or hits a splitter.
  - On a splitter, increment the split counter and enqueue new beams from the left/right neighbor columns starting below that splitter.
  - Stop the current beam after the splitter; otherwise continue.
- Sum all split encounters.

### Part Two
- A single tachyon particle splits timelines at each splitter. Count how many distinct timelines exit the bottom of the manifold.
- Simulate with a queue carrying a `count` of parallel timelines for each beam.
- When a beam exits the grid without hitting another splitter, add its timeline count to the total.
- Splitting duplicates the count to the left/right beams; counts never merge, they just accumulate.

## Functions
- `parseManifold(raw)`: returns the 2D grid.
- `countSplits(grid)`: returns the total number of splitter encounters across all beams.

## Usage
```sh
node 07/solve.js 07/input.txt
```
