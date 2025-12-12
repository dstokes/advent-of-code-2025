# Day 08: Playground

## Problem
Given 3D coordinates for junction boxes, repeatedly connect the pair with the smallest Euclidean distance (straight-line). Perform this for the first *k* pairs (10 in the example, 1000 for the puzzle input). Treat connected boxes as part of the same circuit. After all connections, multiply the sizes of the three largest circuits.

## Approach
- Parse each line into `{x,y,z}` points.
- Precompute all pairwise squared distances (no need for square roots), keep edges as `(dist, a, b)`.
- Sort edges ascending and iterate through the first *k* edges.
- Maintain connectivity with a disjoint-set (union-find) to merge circuits as edges are processed.
- After processing, collect component sizes, sort descending, pad with `1` if fewer than three circuits, and multiply the top three.

### Part Two
- Continue processing edges in ascending distance order until all junction boxes are connected.
- Track the number of components; when a union reduces components to 1, record that edge.
- Multiply the X coordinates of the two junction boxes joined by that final, circuit-completing edge.

## Functions
- `parseJunctions(raw)`: parse input into an array of points.
- `largestCircuitProduct(junctions, k=1000)`: perform the greedy connections and return the product of the three largest circuit sizes.
- `finalConnectionProduct(junctions)`: return the X-product of the final edge that connects the graph into one circuit.

## Usage
```sh
node 08/solve.js 08/input.txt
```
