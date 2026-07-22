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

enable_node_env_proxy() {
	if [[ "${NODE_OPTIONS:-}" == *"--use-env-proxy"* ]]; then
		return
	fi
	if [[ -z "${HTTP_PROXY:-}${HTTPS_PROXY:-}${ALL_PROXY:-}${http_proxy:-}${https_proxy:-}${all_proxy:-}" ]]; then
		return
	fi
	if node --help | grep -q -- "--use-env-proxy"; then
		export NODE_OPTIONS="${NODE_OPTIONS:+$NODE_OPTIONS }--use-env-proxy"
	fi
}

build_committed_sources() {
	echo "🔨 Building committed sources..."
	enable_node_env_proxy
	(
		cd packages/tui
		npm run build
	)
	(
		cd packages/ai
		npm run hydrate-model-data
		npm run generate-model-catalog
		npm run build:offline
	)
	(
		cd packages/agent
		npm run build
	)
	(
		cd packages/coding-agent
		npm run build
	)
}

require_clean_worktree

echo "⬇️  Fetching upstream..."
git fetch upstream

echo "🔀 Merging upstream/main..."
git merge upstream/main --no-edit

echo "📦 Syncing dependencies from package-lock.json..."
npm ci --ignore-scripts

build_committed_sources

if ! git diff --quiet || ! git diff --cached --quiet; then
	echo "❌ Build produced tracked file changes."
	git status --short
	echo "This usually means a build step is not reproducible from committed sources."
	exit 1
fi

echo "✅ Done! Fork is up to date and built from committed sources."
