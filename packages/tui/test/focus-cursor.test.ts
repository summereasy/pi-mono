import assert from "node:assert";
import { describe, it } from "node:test";
import { AltScreenSearchComponent } from "../src/alt-screen-search.ts";
import { Editor } from "../src/components/editor.ts";
import { Input } from "../src/components/input.ts";
import { FAKE_CURSOR_START } from "../src/tui.ts";
import { TuiAltScreen } from "../src/tui-alt-screen.ts";
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
			assert.ok(!input.render(20).join("\n").includes(FAKE_CURSOR_START));

			tui.setFocus(editor);
			assert.strictEqual(editor.focused, true);
			assert.strictEqual(editor.terminalFocused, false);
			assert.ok(!editor.render(20).join("\n").includes(FAKE_CURSOR_START));

			terminal.sendFocus(true);
			assert.strictEqual(editor.terminalFocused, true);
			assert.ok(editor.render(20).join("\n").includes(FAKE_CURSOR_START));
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
			assert.ok(search.render(40).join("\n").includes(FAKE_CURSOR_START));

			terminal.sendFocus(false);
			assert.strictEqual(search.terminalFocused, false);
			assert.ok(!search.render(40).join("\n").includes(FAKE_CURSOR_START));

			terminal.sendFocus(true);
			assert.strictEqual(search.terminalFocused, true);
			assert.ok(search.render(40).join("\n").includes(FAKE_CURSOR_START));
		} finally {
			tui.stop();
		}
	});

	for (const Screen of [TuiMainScreen, TuiAltScreen]) {
		for (const showHardwareCursor of [false, true]) {
			for (const componentKind of ["input", "editor", "search"] as const) {
				it(`${Screen.name} restores ${componentKind} cursors after focus returns (hardware=${showHardwareCursor})`, async () => {
					const terminal = new VirtualTerminal(40, 10);
					let writes = "";
					let hardwareCursorVisible = false;
					const originalWrite = terminal.write.bind(terminal);
					terminal.write = (data) => {
						writes += data;
						for (const match of data.matchAll(/\x1b\[\?25([hl])/g)) hardwareCursorVisible = match[1] === "h";
						originalWrite(data);
					};
					const originalShowCursor = terminal.showCursor.bind(terminal);
					terminal.showCursor = () => {
						hardwareCursorVisible = true;
						originalShowCursor();
					};
					const originalHideCursor = terminal.hideCursor.bind(terminal);
					terminal.hideCursor = () => {
						hardwareCursorVisible = false;
						originalHideCursor();
					};
					const tui = new Screen(terminal, showHardwareCursor);
					const component =
						componentKind === "editor"
							? new Editor(tui, defaultEditorTheme)
							: componentKind === "search"
								? new AltScreenSearchComponent(() => {})
								: new Input();
					if (component instanceof Editor) component.setText("编辑器");
					if (component instanceof Input) component.setValue("input");
					tui.addChild(component);
					tui.setFocus(component);
					tui.start();
					try {
						await terminal.waitForRender();
						assert.strictEqual(writes.includes("\x1b[7m"), !showHardwareCursor);
						assert.strictEqual(hardwareCursorVisible, showHardwareCursor);
						writes = "";
						terminal.sendFocus(false);
						await terminal.waitForRender();
						assert.ok(!writes.includes("\x1b[7m"));
						assert.strictEqual(hardwareCursorVisible, false);
						writes = "";
						terminal.sendFocus(true);
						await terminal.waitForRender();
						assert.strictEqual(writes.includes("\x1b[7m"), !showHardwareCursor);
						assert.strictEqual(hardwareCursorVisible, showHardwareCursor);
					} finally {
						tui.stop();
					}
				});
			}
		}
	}
});
