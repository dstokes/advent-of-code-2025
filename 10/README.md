# Day 10: Factory

## Problem
Each line describes a machine: an indicator pattern of `.`/`#`, a list of buttons (each toggles some lights), and irrelevant joltage data. Starting with all lights off, choose how many times to press each button (pressing twice cancels) so the lights match the target. Find the minimum total button presses for each machine and sum them.

## Approach
- Model each machine as a linear system over GF(2). Each button column toggles certain lights. The target pattern is the right-hand side.
- Build a lights×buttons matrix of 0/1 values with a bitmask per row.
- Use Gaussian elimination to reach reduced row echelon form and detect infeasible rows.
- Free variables generate a nullspace. Compute one particular solution (free vars set to 0), then build a basis vector per free variable.
- Enumerate all combinations of the basis when small (≤20 free vars) to find the solution with the fewest pressed buttons (minimum Hamming weight). If the basis is larger, fall back to a greedy descent that flips basis vectors when they lower the count.
- Sum the per-machine minima.

### Part Two
- Ignore the indicator lights; instead, each line’s curly-brace values are counter targets, all starting at 0.
- Each button now increments listed counters by 1. We need non-negative integer button counts minimizing the total presses while matching all targets.
- Use a branch-and-bound depth-first search over the residual counter needs:
  - Choose the counter with the largest remaining value.
  - Try pressing any button that affects it between 1 and the maximum times that won’t overshoot any affected counter.
  - Memoize on the residual vector and prune with an optimistic lower bound (sum of residuals).
- Sum the minimal press counts across all machines.

## Functions
- `parseMachines(raw)`: parse lines into `{lights, targetMask, buttonMasks}`.
- `minPressesForMachine(machine)`: solve the system and return the minimum presses for that machine.
- `totalMinPresses(machines)`: sum minima across all machines.
- `minCounterPresses(machine)`: part two, minimal presses for the counter targets.
- `totalMinCounterPresses(machines)`: sum counter-mode minima.

## Usage
```sh
node 10/solve.js 10/input.txt
```
