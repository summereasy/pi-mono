#!/bin/bash
# 同步 upstream, 按 lockfile 对齐依赖, 并基于已提交源码进行确定性 build
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

require_clean_worktree() {
	if ! git diff --quiet || ! git diff --cached --quiet; then
		echo "❌ Working tree is not clean."
		git status --short
		echo "Please commit or discard local changes first."
		exit 1
	fi
}

build_committed_sources() {
	echo "🔨 Building committed sources..."
	(
		cd packages/tui
		npm run build
	)
	(
		cd packages/ai
		npx tsgo -p tsconfig.build.json
	)
	(
		cd packages/agent
		npm run build
	)
	(
		cd packages/coding-agent
		npm run build
	)
	(
		cd packages/web-ui
		npm run build
	)
}

require_clean_worktree

echo "⬇️  Fetching upstream..."
git fetch upstream

echo "🔀 Merging upstream/main..."
git merge upstream/main --no-edit

echo "📦 Syncing dependencies from package-lock.json..."
npm ci

build_committed_sources

if ! git diff --quiet || ! git diff --cached --quiet; then
	echo "❌ Build produced tracked file changes."
	git status --short
	echo "This usually means a build step is not reproducible from committed sources."
	exit 1
fi

echo "✅ Done! Fork is up to date and built from committed sources."
