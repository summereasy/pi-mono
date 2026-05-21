import { homedir } from "os";
import { describe, expect, it } from "vitest";
import { normalizeHtmlExportPath } from "../src/core/export-html/index.ts";

describe("HTML export path normalization", () => {
	it("appends .html when the output path has no extension", () => {
		expect(normalizeHtmlExportPath("out")).toBe("out.html");
		expect(normalizeHtmlExportPath("notes/out")).toBe("notes/out.html");
	});

	it("keeps explicit extensions unchanged", () => {
		expect(normalizeHtmlExportPath("out.html")).toBe("out.html");
		expect(normalizeHtmlExportPath("out.htm")).toBe("out.htm");
	});

	it("expands home directory shorthand", () => {
		expect(normalizeHtmlExportPath("~/notes/out")).toBe(`${homedir()}/notes/out.html`);
	});

	it("expands bare and braced environment variables", () => {
		const previous = process.env.PI_EXPORT_TEST_DIR;
		process.env.PI_EXPORT_TEST_DIR = "/tmp/pi-export-test";
		try {
			expect(normalizeHtmlExportPath("$PI_EXPORT_TEST_DIR/out")).toBe("/tmp/pi-export-test/out.html");
			expect(normalizeHtmlExportPath(`\${PI_EXPORT_TEST_DIR}/out.html`)).toBe("/tmp/pi-export-test/out.html");
		} finally {
			if (previous === undefined) {
				delete process.env.PI_EXPORT_TEST_DIR;
			} else {
				process.env.PI_EXPORT_TEST_DIR = previous;
			}
		}
	});
});
