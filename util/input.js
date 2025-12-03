"use strict";

const fs = require("fs");
const path = require("path");

const getDefaultBaseDir = () =>
    path.dirname(module.parent?.filename || require.main?.filename || process.cwd());

/**
 * Resolve the input path given an optional CLI argument and a base directory.
 * Prefers an explicit argument; otherwise falls back to a file inside the baseDir
 * (defaults to "input.txt").
 */
function resolveInputPath(cliArg, baseDir, fallback = "input.txt") {
    if (cliArg) {
        return path.resolve(cliArg);
    }
    return path.join(baseDir, fallback);
}

/**
 * Read a UTF-8 input file. The inputPath argument is optional; when omitted it
 * falls back to "<baseDir>/<fallback>" where baseDir defaults to the importing
 * module's directory (or the main script). Trims trailing whitespace/newlines
 * by default to match AoC input expectations; pass { trimEnd: false } to keep
 * exact contents.
 */
function loadInput(inputPath, { trimEnd = true, baseDir = getDefaultBaseDir(), fallback = "input.txt" } = {}) {
    const resolvedPath = resolveInputPath(inputPath, baseDir, fallback);
    const raw = fs.readFileSync(resolvedPath, "utf8");
    return trimEnd ? raw.trimEnd() : raw;
}

module.exports = {
    loadInput,
    resolveInputPath,
};
