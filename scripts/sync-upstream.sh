#!/bin/bash
# 同步 upstream 并重新 build
set -e
cd "$(git rev-parse --show-toplevel)"

echo "⬇️  Fetching upstream..."
git fetch upstream

echo "🔀 Merging upstream/main..."
git merge upstream/main --no-edit

echo "🔨 Building..."
npm run build

echo "✅ Done! Fork is up to date and rebuilt."
