"use strict";

const { spawnSync } = require("node:child_process");
const path = require("node:path");
const { performance } = require("node:perf_hooks");

/**
 * Execute a Node solution script, capturing stdout/stderr, exit code, and elapsed time.
 * Accepts an optional working directory and extra CLI arguments.
 */
function runSolution(scriptPath, { cwd = path.dirname(scriptPath), args = [] } = {}) {
    const start = performance.now();
    const result = spawnSync("node", [scriptPath, ...args], {
        cwd,
        encoding: "utf8",
        env: { ...process.env },
    });
    const durationMs = performance.now() - start;

    return {
        durationMs,
        exitCode: result.status,
        stdout: result.stdout ?? "",
        stderr: result.stderr ?? "",
    };
}

module.exports = { runSolution };
