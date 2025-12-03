# Repository Guidelines

## Project Structure & Module Organization
- Each puzzle day lives in its own two-digit folder (e.g., `01`, `02`), containing the solution, tests, and inputs for that day.
- Required files per day: `puzzle.txt` (problem text), `input.txt` (personal input). Add `sample.txt` for example inputs if useful.
- Place solutions alongside inputs with predictable names such as `solve.js`; put helpers in util/ in the project root.
- Keep tests next to solutions (`solve.test.js`) so fixtures and logic stay co-located.

## Build, Test, and Development Commands
- Write test files using node:test and node:assert within each day directory

## Coding Style & Naming Conventions
- Prefer clear, pure functions; keep I/O at the entry point (`if __name__ == "__main__":` in Python, `main()` in Rust, etc.).
- Use 4-space indentation for Python and idiomatic defaults for other languages.
- Name primary solution files predictably (`solve.<ext>` or `dayNN.<ext>`). Name helpers after their role (`parser.ts`, `dial.rs`).
- Keep inputs as data only—do not hard-code personal answers in source.
- Add comments to function definitions describing their logic and implementation.

## Testing Guidelines
- Derive tests from the examples in `puzzle.txt`; add `sample.txt` fixtures if they reduce noise.
- Favor fast, focused tests that assert intermediate states and final answers. Cover edge cases like wrap-around math or large/negative values.
- Keep tests per day and run them locally (`pytest -q`, `npm test`, `cargo test`) from the relevant folder before sharing changes.

## Commit & Pull Request Guidelines
- Write commit messages in present tense, imperative mood (e.g., `Add dial rotation parser`, `Refine day01 tests`).
- Keep diffs scoped to a day unless changes are tightly coupled; note any tooling added to that day.
- For PRs: include a short summary, the affected day(s), commands run (e.g., `pytest -q`, `node solve.mjs input.txt`), and any known gaps. Link to the AoC day description when useful.
