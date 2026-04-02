import assert from "node:assert";
import { describe, it } from "node:test";
import { Editor } from "../src/components/editor.js";
import { Input } from "../src/components/input.js";
import { TUI } from "../src/tui.js";
import { defaultEditorTheme } from "./test-themes.js";
import { VirtualTerminal } from "./virtual-terminal.js";

describe("TUI terminal focus cursor handling", () => {
	it("syncs terminal focus state when setFocus is called while the terminal is unfocused", () => {
		const terminal = new VirtualTerminal(40, 10);
		const tui = new TUI(terminal);
		const input = new Input();
		const editor = new Editor(tui, defaultEditorTheme);

		input.setValue("input");
		editor.setText("编辑器");
		tui.addChild(input);
		tui.addChild(editor);
		tui.setFocus(input);
		tui.start();

		try {
			terminal.sendFocus(false);
			assert.strictEqual(input.terminalFocused, false);
			assert.ok(!input.render(20).join("\n").includes("\x1b[7m"));

			tui.setFocus(editor);
			assert.strictEqual(editor.focused, true);
			assert.strictEqual(editor.terminalFocused, false);
			assert.ok(!editor.render(20).join("\n").includes("\x1b[7m"));

			terminal.sendFocus(true);
			assert.strictEqual(editor.terminalFocused, true);
			assert.ok(editor.render(20).join("\n").includes("\x1b[7m"));
		} finally {
			tui.stop();
		}
	});
});
