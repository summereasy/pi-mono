# Fork Delta

本文件记录 fork (`summereasy/pi-mono`) 相对于上游 (`badlogic/pi-mono`) 的独有改动，方便追踪和后续合入上游。

最后更新: 2026-05-28

---

## main 分支

### 终端焦点光标隐藏

#### `ec44959e` — feat(tui): hide cursor when terminal loses focus

- **日期**: 2026-04-03
- **变更**: 终端失去焦点时自动隐藏光标，获得焦点时恢复显示
- **文件**:
  - `packages/tui/src/terminal.ts` (+30) — 新增焦点事件监听
  - `packages/tui/src/tui.ts` (+35/-2) — TUI 层对接焦点状态
  - `packages/tui/src/components/editor.ts` (+14/-3) — 编辑器光标显隐
  - `packages/tui/src/components/input.ts` (+13/-4) — 输入框光标显隐
  - `packages/tui/test/focus-cursor.test.ts` (+40) — 测试
  - `packages/tui/test/virtual-terminal.ts` (+12) — 测试辅助
  - `packages/tui/test/edit-tool-no-full-redraw.test.ts` (+1) — 适配

#### 已合入上游，fork 侧已移除

- **`15c1e4d9` — CJK 词导航**: upstream #5068 已提供 `word-navigation.ts` 与相关测试，fork 不再维护独立实现

---

### 同步上游脚本

#### `e01a3568` — chore(scripts): add sync-upstream helper

- **日期**: 2026-04-03
- **变更**: 新增 `scripts/sync-upstream.sh`，用于从上游拉取并合并到 fork

#### `d0b63291` — M: update the up-stream script

- **日期**: 2026-04-17
- **变更**: 完善 `scripts/sync-upstream.sh`，增加冲突处理等逻辑 (+58/-5)

---

## 其他分支

### `feat/omlx-support`

#### `beb68489` — feat(web-ui): add omlx auto-discovery provider

- **日期**: 2026-03-19
- **变更**: web-ui 新增 omlx 模型自动发现 provider，用户添加自定义 provider 时可自动拉取模型列表
- **文件**:
  - `packages/web-ui/src/utils/model-discovery.ts` (+80/-1) — 发现逻辑
  - `packages/web-ui/src/dialogs/CustomProviderDialog.ts` (+15/-1) — UI 集成
  - `packages/web-ui/src/dialogs/ModelSelector.ts` (+3/-1)
  - `packages/web-ui/src/dialogs/ProvidersModelsTab.ts` (+6/-1)
  - `packages/web-ui/src/storage/stores/custom-providers-store.ts` (+2/-1)
- **说明**: 为 Chrome 扩展 [Sitegeist](https://github.com/summereasy/sitegeist) 做的改动，omlx 自动发现方便用户快速配置本地模型源。暂不合入 main，待功能稳定后再决定
- **状态**: 未合并到 main，保留分支

### `fix/cjk-word-segmentation`

#### `d1c79171` — feat(tui): CJK word segmentation and terminal focus cursor hiding

- **日期**: 2026-04-03
- **变更**: CJK 分词与焦点光标隐藏的初始 squash 提交
- **状态**: CJK 分词已由 upstream #5068 覆盖；焦点光标隐藏保留在 `ec44959e`。此分支可清理

---

## 同步记录

| 日期 | 操作 |
|---|---|
| 2026-04-23 | upstream 与 main 同步，无落后提交 |
| 2026-05-28 | 合并 upstream v0.76.0；移除 fork 侧 CJK 词导航，改用 upstream `word-navigation.ts` |
