import assert from "node:assert";
import { describe, it } from "node:test";
import { AltScreenSearchComponent } from "../src/alt-screen-search.ts";
import { Editor } from "../src/components/editor.ts";
import { Input } from "../src/components/input.ts";
import { TuiMainScreen } from "../src/tui-main-screen.ts";
import { defaultEditorTheme } from "./test-themes.ts";
import { VirtualTerminal } from "./virtual-terminal.ts";

describe("TUI terminal focus cursor handling", () => {
	it("syncs terminal focus state when setFocus is called while the terminal is unfocused", () => {
		const terminal = new VirtualTerminal(40, 10);
		const tui = new TuiMainScreen(terminal);
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

	it("hides the transcript search placeholder cursor when the terminal loses focus", () => {
		const terminal = new VirtualTerminal(40, 10);
		const tui = new TuiMainScreen(terminal);
		const search = new AltScreenSearchComponent(() => {});

		tui.addChild(search);
		tui.setFocus(search);
		tui.start();

		try {
			assert.ok(search.render(40).join("\n").includes("\x1b[7m"));

			terminal.sendFocus(false);
			assert.strictEqual(search.terminalFocused, false);
			assert.ok(!search.render(40).join("\n").includes("\x1b[7m"));

			terminal.sendFocus(true);
			assert.strictEqual(search.terminalFocused, true);
			assert.ok(search.render(40).join("\n").includes("\x1b[7m"));
		} finally {
			tui.stop();
		}
	});
});
