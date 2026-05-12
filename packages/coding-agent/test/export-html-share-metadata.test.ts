import { readFileSync } from "fs";
import { describe, expect, it } from "vitest";

describe("export HTML share metadata rendering", () => {
	const templateJs = readFileSync(new URL("../src/core/export-html/template.js", import.meta.url), "utf-8");
	const templateCss = readFileSync(new URL("../src/core/export-html/template.css", import.meta.url), "utf-8");

	it("keeps session metadata collapsed behind a compact header by default", () => {
		expect(templateJs).toMatch(/<h1>Session Export<\/h1>/);
		expect(templateJs).toMatch(/class="header-summary"/);
		expect(templateJs).toMatch(/class="header-details expandable"/);
		expect(templateJs).toMatch(/Session details <span class="metadata-collapsed">/);
		expect(templateJs).toMatch(/<span class="metadata-expanded">· click to hide<\/span>/);
		expect(templateCss).toMatch(/\.header-details-content\s*\{[\s\S]*?display:\s*none;/);
		expect(templateCss).toMatch(/\.header-details\.expanded \.header-details-content\s*\{[\s\S]*?display:\s*block;/);
	});

	it("collapses system prompt without rendering a multi-line preview", () => {
		expect(templateJs).not.toMatch(/previewLines\s*=\s*10/);
		expect(templateJs).not.toMatch(/system-prompt-preview/);
		expect(templateJs).toMatch(/System Prompt <span class="metadata-collapsed">/);
		expect(templateJs).toMatch(/<span class="metadata-expanded">\$\{lineLabel\} · click to hide<\/span>/);
		expect(templateCss).toMatch(/\.system-prompt-full\s*\{[\s\S]*?display:\s*none;/);
	});

	it("collapses available tools as one section before showing individual tools", () => {
		expect(templateJs).toMatch(/class="tools-list expandable"/);
		expect(templateJs).toMatch(/Available Tools <span class="metadata-collapsed">/);
		expect(templateJs).toMatch(/<span class="metadata-expanded">\$\{toolLabel\} · click to hide<\/span>/);
		expect(templateJs).toMatch(/class="tools-content" onclick="event\.stopPropagation\(\)"/);
		expect(templateCss).toMatch(/\.tools-content\s*\{[\s\S]*?display:\s*none;/);
		expect(templateCss).toMatch(/\.tools-list\.expanded \.tools-content\s*\{[\s\S]*?display:\s*block;/);
		expect(templateCss).toMatch(/\.metadata-expanded\s*\{[\s\S]*?display:\s*none;/);
		expect(templateCss).toMatch(/\.tools-list\.expanded \.metadata-expanded\s*\{[\s\S]*?display:\s*inline;/);
	});

	it("does not render model change entries as visible conversation blocks", () => {
		expect(templateJs).not.toMatch(/Switched to model:/);
		expect(templateJs).toMatch(/if \(entry\.type === 'model_change'\) \{\s*return '';\s*\}/);
	});
});
