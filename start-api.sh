#!/bin/bash
set -e

cd "$(dirname "$0")"
echo "Building web application..."
pnpm --dir apps/web build

echo "Syncing web build to CLI..."
mkdir -p packages/md-cli/dist
cp -R apps/web/dist/. packages/md-cli/dist/

echo "Starting md-to-html-api service..."
cd packages/md-cli
pnpm dev
