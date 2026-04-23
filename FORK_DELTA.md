# Fork Delta

本文件记录 fork (`summereasy/pi-mono`) 相对于上游 (`badlogic/pi-mono`) 的独有改动，方便追踪和后续合入上游。

最后更新: 2026-04-23

---

## main 分支

### CJK 文字导航与终端焦点光标隐藏

两个功能，均在 `packages/tui/` 下，涉及编辑器和输入组件的词移动逻辑。

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

#### `15c1e4d9` — feat(tui): improve CJK word navigation

- **日期**: 2026-04-03
- **变更**: 编辑器和输入框中的词级移动（Ctrl+Left/Right 等）正确处理 CJK 字符，不再把整个中文段落当成一个"词"
- **文件**:
  - `packages/tui/src/utils.ts` (+67) — CJK 分词工具函数
  - `packages/tui/src/components/editor.ts` (+41/-15) — 编辑器词移动逻辑
  - `packages/tui/src/components/input.ts` (+35/-8) — 输入框词移动逻辑
  - `packages/tui/test/word-navigation-cjk.test.ts` (+116) — 测试

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
- **变更**: 上述两个功能（CJK 分词 + 焦点光标隐藏）的初始版本，以 squash 形式提交
- **状态**: 已拆分为 `ec44959e` 和 `15c1e4d9` 合入 main，此分支可清理

---

## 同步记录

| 日期 | 操作 |
|---|---|
| 2026-04-23 | upstream 与 main 同步，无落后提交 |
