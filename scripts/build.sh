#!/bin/sh
set -e

# Assembles the deployable directory: just what the site actually serves.
# Not a bundler — no transforms, no transpiling, nothing minified — this
# exists solely because `wrangler pages deploy` has no ignore-file
# mechanism of its own, so deploying the repo root directly publishes
# dev/CI files (tests/, playwright.config.js, .github/, README.md, ...)
# as live static assets.
rm -rf build
mkdir -p build
cp index.html manifest.json build/
cp -r images src build/
