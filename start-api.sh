#!/bin/bash
echo "Starting md-to-html-api service..."
cd "$(dirname "$0")/packages/md-cli"
pnpm dev
