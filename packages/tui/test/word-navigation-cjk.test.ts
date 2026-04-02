import assert from "node:assert";
import { describe, it } from "node:test";
import { Editor } from "../src/components/editor.js";
import { Input } from "../src/components/input.js";
import { TUI } from "../src/tui.js";
import { backwardWordLength, forwardWordLength } from "../src/utils.js";
import { defaultEditorTheme } from "./test-themes.js";
import { VirtualTerminal } from "./virtual-terminal.js";

function getInputCursor(input: Input): number {
	return (input as unknown as { cursor: number }).cursor;
}

function createEditor(): Editor {
	return new Editor(new TUI(new VirtualTerminal(80, 24)), defaultEditorTheme);
}

describe("CJK-aware word navigation", () => {
	describe("segment helpers", () => {
		it("returns the leading segment length instead of landing inside the next word", () => {
			assert.strictEqual(forwardWordLength("😀abc"), 2);
			assert.strictEqual(forwardWordLength("😀😀abc"), 4);
			assert.strictEqual(forwardWordLength("中文abc"), 2);
			assert.strictEqual(forwardWordLength("abc中文"), 3);
		});

		it("returns the trailing segment length instead of merging symbols with the previous word", () => {
			assert.strictEqual(backwardWordLength("abc😀"), 2);
			assert.strictEqual(backwardWordLength("abc😀😀"), 4);
			assert.strictEqual(backwardWordLength("abc中文"), 2);
			assert.strictEqual(backwardWordLength("😀abc"), 3);
		});
	});

	describe("Input", () => {
		it("moves forward across punctuation, CJK, and Latin segments without landing inside a word", () => {
			const input = new Input();
			input.setValue("，中文abc");

			input.handleInput("\x1bf");
			assert.strictEqual(getInputCursor(input), 1);

			input.handleInput("\x1bf");
			assert.strictEqual(getInputCursor(input), 3);

			input.handleInput("\x1bf");
			assert.strictEqual(getInputCursor(input), 6);
		});

		it("moves backward across emoji and CJK segments without merging them", () => {
			const input = new Input();
			input.setValue("abc😀中文");
			input.handleInput("\x05");

			input.handleInput("\x1bb");
			assert.strictEqual(getInputCursor(input), 5);

			input.handleInput("\x1bb");
			assert.strictEqual(getInputCursor(input), 3);

			input.handleInput("\x1bb");
			assert.strictEqual(getInputCursor(input), 0);
		});

		it("deletes a whole CJK word after punctuation instead of deleting one character", () => {
			const input = new Input();
			input.setValue("，中文abc");
			input.handleInput("\x1b[C");

			input.handleInput("\x1bd");
			assert.strictEqual(input.getValue(), "，abc");
		});
	});

	describe("Editor", () => {
		it("moves forward across punctuation, CJK, and Latin segments without landing inside a word", () => {
			const editor = createEditor();
			editor.setText("，中文abc");
			editor.handleInput("\x01");

			editor.handleInput("\x1bf");
			assert.deepStrictEqual(editor.getCursor(), { line: 0, col: 1 });

			editor.handleInput("\x1bf");
			assert.deepStrictEqual(editor.getCursor(), { line: 0, col: 3 });

			editor.handleInput("\x1bf");
			assert.deepStrictEqual(editor.getCursor(), { line: 0, col: 6 });
		});

		it("moves backward across emoji and CJK segments without merging them", () => {
			const editor = createEditor();
			editor.setText("abc😀中文");
			editor.handleInput("\x05");

			editor.handleInput("\x1bb");
			assert.deepStrictEqual(editor.getCursor(), { line: 0, col: 5 });

			editor.handleInput("\x1bb");
			assert.deepStrictEqual(editor.getCursor(), { line: 0, col: 3 });

			editor.handleInput("\x1bb");
			assert.deepStrictEqual(editor.getCursor(), { line: 0, col: 0 });
		});

		it("deletes a whole CJK word after punctuation instead of deleting one character", () => {
			const editor = createEditor();
			editor.setText("，中文abc");
			editor.handleInput("\x01");
			editor.handleInput("\x1b[C");

			editor.handleInput("\x1bd");
			assert.strictEqual(editor.getText(), "，abc");
		});
	});
});
