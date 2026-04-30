#!/usr/bin/env node
"use strict";

// Explicitly require ESM-only packages that pkg might miss
// These are transitive dependencies that pkg's scanner doesn't detect
require("@csstools/css-calc");
require("@csstools/css-color-parser");
require("@asamuzakjp/css-color");
require("cssstyle");
require("path-data-parser");
require("points-on-curve");
require("points-on-path");

// Load the main bundled code
require("./dist-cli/index.cjs");
