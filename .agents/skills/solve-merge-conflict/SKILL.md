---
name: solve-merge-conflict
description: >-
  Resolve git merge conflicts when syncing a fork with upstream. Use when merge
  fails, conflict markers appear, sync-upstream.sh stops, or the user asks to
  solve merge conflicts. Analyze read-only and obtain approval before resolving;
  then complete validation and the local merge commit.
---

# Solve Merge Conflict

处理 fork 与 upstream 合并时的 git 冲突。本 skill 适用于任意 fork 仓库; 在 pi-mono fork 中额外参考 `FORK_DELTA.md`。

## 硬约束

- **所有冲突先确认方案** — 先只读检查状态、两侧内容和 fork 定制, 报告冲突分类及建议, 等用户确认后再修改、stage 或安装依赖。类型 1 和 3 也必须确认; 用户已明确批准当前方案时不重复询问。
- **类型 2 禁止先改代码** — 若冲突涉及 fork 自研功能与 upstream 新功能的语义交叉, 只输出分析报告和可选方案, **等用户决定**后再动代码。
- **确认一次, 完成本地合并** — 用户确认冲突解决方案后, 即授权连续完成 resolve、依赖/生成步骤恢复、build、检查、相关测试和本地 merge commit。不再为 build 或 commit 单独询问, 不得停在仅 staged 且 `MERGE_HEAD` 仍存在的状态。若用户明确限定只分析或不提交, 遵守该限制。
- **验证失败继续修复** — 在已批准方案内修复依赖、生成数据、构建或测试问题, 重跑受影响的验证后继续提交。仅当出现新的功能语义取舍、需修改无关工作或超出授权范围时再询问; 无法继续时明确报告失败证据和未完成步骤。
- **不自动 push** — push、force-push 和 history rewrite 仍需用户明确授权。
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

**做法**: 建议采用 upstream 版本, 说明将移除哪些 fork 实现; 等用户确认后实施, 合并后确认无 duplicate 逻辑残留。同一生成数据或版本 pin 两侧更新时, 说明与当前源码兼容的选择依据。

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
2. 提出采用 upstream 结构并保留 fork 独有逻辑的方案, 等用户确认后再实施
3. 说明保留了什么 (fork) 和什么 (upstream)

### 4. 实施、验证并完成本地 merge (所有类型均须用户已确认方案)

- 清除所有 conflict markers
- 若 merge 中断了同步脚本, 从中断点恢复 lockfile 对应的依赖、生成数据和 build 步骤; 不要因为冲突已清除就跳过后半段 workflow
- 运行项目常规 build 和检查 (pi-mono: 恢复 `scripts/sync-upstream.sh` 的 `npm ci --ignore-scripts` 与 `build_committed_sources` 等价步骤, 再运行 `npm run check`; 其他仓库按现有惯例)
- 跑与冲突区域相关的测试
- `git status` 确认无遗漏的 unmerged paths
- 检查 index, 保留 Git 已暂存的目标分支改动, 显式 stage 本次解决和必要适配的路径; 排除其他会话的无关改动, 创建本地 merge commit。正常继承的 upstream lockfile 改动属于本次合并, 可使用 `PI_ALLOW_LOCKFILE_CHANGE=1`, 不跳过提交检查
- 确认 `MERGE_HEAD` 已消失、此次合入的 upstream commit 已成为 `HEAD` 的 ancestor、无本次遗留改动; 若原有无关改动存在, 保持原样并报告, 不为追求 worktree clean 清理它们
- 汇报: 每个文件的分类, 做了什么, 测了什么 — **不要只说「搞定了」**

## pi-mono fork 备忘

| 项 | 说明 |
|----|------|
| 同步脚本 | `./scripts/sync-upstream.sh` |
| fork 独有追踪 | `FORK_DELTA.md` |
| 冲突后恢复 | `npm ci --ignore-scripts`, 然后完成同步脚本中被跳过的 build/生成步骤 |
| 检查 | `npm run check` |
| tui 测试 | 按仓库规范运行相关的具体 Node test 文件 |
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

### 待确认方案 (所有类型)
- 建议: ...
- 类型 2 另列可行备选及取舍

### 下一步
- [ ] 等你确认方案; 确认后连续完成修复、依赖/生成恢复、build、检查、相关测试和本地 merge commit, 不 push
```

## 调用方式

- **pi**: `/skill:solve-merge-conflict`
- **Cursor / Codex**: 提及 merge conflict 或 @ 本 skill; agent 应读取本文件并按流程执行
