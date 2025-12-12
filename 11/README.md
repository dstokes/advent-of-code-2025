# Day 11: Reactor

## Problem
Each line names a device and the devices its outputs feed. Starting at `you`, count the number of distinct directed paths that eventually reach `out`.

## Approach
- Parse the lines into an adjacency list (`Map<string, string[]>`).
- Use depth-first search with memoization:
  - If the current node is `out`, return 1.
  - Sum the counts from each outgoing edge.
  - Cache results to reuse shared subpaths.
- Guard against accidental cycles by tracking the recursion stack; if a cycle appears, throw (the puzzle input behaves as a DAG).

### Part Two
- Require that each counted path visit specific devices (`dac` and `fft`).
- Track a bitmask of visited required nodes during DFS; memoize on `(node, mask)`.
- Only paths that reach `out` with all required bits set contribute to the count.
- Cycle detection still applies to avoid infinite recursion in unexpected inputs.

## Functions
- `parseNetwork(raw)`: build the adjacency map.
- `countPaths(graph, start, end)`: return the number of distinct paths from `start` to `end`.
- `countPathsVisiting(graph, start, end, required)`: part two, count paths that visit all required nodes.

## Usage
```sh
node 11/solve.js 11/input.txt
```
