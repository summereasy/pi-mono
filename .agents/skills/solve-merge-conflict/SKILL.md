---
name: solve-merge-conflict
description: >-
  Resolve git merge conflicts when syncing a fork with upstream. Use when merge
  fails, conflict markers appear, sync-upstream.sh stops, or the user asks to
  solve merge conflicts. Analyze before editing; never silently patch.
---

# Solve Merge Conflict

处理 fork 与 upstream 合并时的 git 冲突。本 skill 适用于任意 fork 仓库; 在 pi-mono fork 中额外参考 `FORK_DELTA.md`。

## 硬约束

- **先分析, 后改代码** — 不得看到 `<<<<<<<` 就直接 patch 并宣布完成。
- **类型 2 禁止先改代码** — 若冲突涉及 fork 自研功能与 upstream 新功能的语义交叉, 只输出分析报告和可选方案, **等用户决定**后再动代码。
- **不自动 commit** — 除非用户明确要求。
- **不动 upstream 维护的文件来存规则** — 例如 pi-mono 的 `AGENTS.md` 由 upstream 团队维护, 不要往里加 fork 专用段落。

## 触发场景

- `git merge` / `git pull` / `rebase` 报 `CONFLICT`
- `./scripts/sync-upstream.sh` 失败
- 用户说 solve merge conflict / 解决合并冲突

## 流程

### 1. 摸清状态

```bash
git status
git diff --name-only --diff-filter=U    # 未合并文件
git log --oneline -5 HEAD
git log --oneline -5 MERGE_HEAD 2>/dev/null || git log --oneline -5 upstream/main
```

若有 fork 追踪文档, 先读:
- `FORK_DELTA.md` (pi-mono fork)
- 类似 `FORK.md` / `docs/fork-delta.md` (其他 fork)

列出 fork 独有 commit (相对 upstream):

```bash
git log --oneline upstream/main..HEAD --no-merges
```

### 2. 逐文件分析

对每个冲突文件:

```bash
git show HEAD:<path>          # fork 侧 (合并前)
git show MERGE_HEAD:<path>    # upstream 侧; 或 upstream/main:<path>
```

说明:
- **fork 改了什么** (是否属于 fork 独有功能)
- **upstream 改了什么**
- **冲突原因** (同一行竞争 vs 重构导致位置变化)

### 3. 分类 (必须明确标注)

#### 类型 1 — upstream 已提供同等功能

upstream 已实现与 fork 自研相同或更好的能力。

**做法**: 删除 fork 自研实现, 采用 upstream 版本。合并后确认无 duplicate 逻辑残留。

#### 类型 2 — 功能语义冲突或需要取舍

fork 自研功能与 upstream 新功能在同一区域有交叉, 或无法同时保留而不做设计决策。

**做法**:
1. **不要编辑冲突文件**
2. 向用户报告:
   - 两边各做什么
   - 冲突点在哪
   - 2–3 个可行方案 (例如: 保留 fork / 采用 upstream / 组合集成)
   - 各方案的 trade-off
3. **等用户选择**后再 resolve

#### 类型 3 — 纯位置/重构冲突

两边功能正交, 只是 upstream 重构 (函数拆分, 文件移动, 代码块换位置) 导致 fork 的改动落在被替换的区域。

**做法**:
1. 向用户简要说明: 「这是类型 3, 两边功能不冲突」
2. 采用 upstream 的结构, 把 fork 独有逻辑**重挂**到 upstream 新结构中的正确位置
3. 说明保留了什么 (fork) 和什么 (upstream)

### 4. 实施与验证 (类型 1 和 3, 或用户已决定的类型 2)

- 清除所有 conflict markers
- 运行项目常规检查 (pi-mono: `npm run check`; 其他仓库按现有惯例)
- 跑与冲突区域相关的测试
- `git status` 确认无遗漏的 unmerged paths
- 汇报: 每个文件的分类, 做了什么, 测了什么 — **不要只说「搞定了」**

## pi-mono fork 备忘

| 项 | 说明 |
|----|------|
| 同步脚本 | `./scripts/sync-upstream.sh` |
| fork 独有追踪 | `FORK_DELTA.md` |
| 检查 | `npm run check` |
| tui 测试 | `cd packages/tui && npm test` |
| lockfile commit | pre-commit 可能需要 `PI_ALLOW_LOCKFILE_CHANGE=1` |

## 报告模板

```markdown
## Merge 冲突分析

### 冲突文件
- `path/to/file` — **类型 N**

### Fork 独有功能 (相关)
- `commit` — 简述

### 逐文件
#### `path/to/file` (类型 3)
- Fork: ...
- Upstream: ...
- 计划: 保留 upstream 结构, 将 fork 的 X 移入 Y

### 需要你决定 (类型 2 才有)
- 选项 A: ...
- 选项 B: ...

### 下一步
- [ ] 等你确认 / [ ] 我可以直接 resolve 类型 3
```

## 调用方式

- **pi**: `/skill:solve-merge-conflict`
- **Cursor / Codex**: 提及 merge conflict 或 @ 本 skill; agent 应读取本文件并按流程执行
