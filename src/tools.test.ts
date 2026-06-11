import test from "node:test";
import assert from "node:assert/strict";
import type { SearchHit } from "@quantumaudio/qa-knowledge";
import { CHARACTER_LIMIT } from "./constants.js";
import { chunkOutputSchema, searchOutputSchema } from "./output-schemas.js";
import {
  formatChunkText,
  formatSearchResultsText,
  toChunkResult,
  toSearchResult,
} from "./tool-result.js";

const sampleHit: SearchHit = {
  chunk_id: "skills/ableton-midi/reference/quantize-and-groove.md#2",
  score: 0.872,
  source_id: "skills/ableton-midi/reference/quantize-and-groove.md",
  source_type: "skill_reference",
  title: "Quantize and groove",
  skill_name: "ableton-midi",
  excerpt: "Use `clip.quantize()` with grid resolution.",
};

const markdownExcerptHit: SearchHit = {
  ...sampleHit,
  excerpt: "## Notes\n\nkey: value\n---\nUse colon and hr safely.",
};

test("formatSearchResultsText: multiple hits with metadata and excerpt", () => {
  const text = formatSearchResultsText([sampleHit, { ...sampleHit, title: "Groove pool", score: 0.71 }]);
  assert.match(text, /^2 results \(relevance order\):/);
  assert.match(text, /### 1\. \[0\.87\] Quantize and groove/);
  assert.match(text, /chunk_id: skills\/ableton-midi\/reference\/quantize-and-groove\.md#2/);
  assert.match(text, /source_type: skill_reference \| skill: ableton-midi/);
  assert.match(text, /Use `clip\.quantize\(\)` with grid resolution\./);
  assert.match(text, /### 2\. \[0\.71\] Groove pool/);
});

test("formatSearchResultsText: omits optional fields when absent", () => {
  const hit: SearchHit = {
    chunk_id: "doc#0",
    score: 0.5,
    source_id: "repo.md",
    source_type: "repo_doc",
    title: "Readme",
    excerpt: "Hello",
  };
  const text = formatSearchResultsText([hit]);
  assert.doesNotMatch(text, /heading_path:/);
  assert.doesNotMatch(text, /skill:/);
  assert.doesNotMatch(text, /origin:/);
});

test("formatSearchResultsText: markdown special chars in excerpt are verbatim", () => {
  const text = formatSearchResultsText([markdownExcerptHit]);
  assert.match(text, /## Notes/);
  assert.match(text, /key: value/);
  assert.match(text, /---/);
});

test("formatSearchResultsText: empty results", () => {
  assert.equal(formatSearchResultsText([], "warp mode"), "No results for query: warp mode");
  assert.equal(formatSearchResultsText([]), "No results.");
});

test("formatChunkText: header separated from markdown body", () => {
  const { text } = formatChunkText({
    chunk_id: "doc#1",
    title: "Quantize and groove",
    source_id: "skills/ableton-midi/reference/quantize-and-groove.md",
    content: "# Quantize and groove\n\nUse `clip.quantize()`.",
  });
  assert.match(text, /^chunk_id: doc#1\n/);
  assert.match(text, /title: Quantize and groove\n/);
  assert.match(text, /source_id: skills\/ableton-midi\/reference\/quantize-and-groove\.md\n\n---\n\n/);
  assert.match(text, /# Quantize and groove\n\nUse `clip\.quantize\(\)`\./);
});

test("formatChunkText: truncates long content", () => {
  const body = "x".repeat(CHARACTER_LIMIT + 500);
  const { text, content, truncated } = formatChunkText({
    chunk_id: "big#0",
    title: "Big",
    source_id: "big.md",
    content: body,
  });
  assert.equal(truncated, true);
  assert.equal(content.length, CHARACTER_LIMIT);
  assert.match(text, new RegExp(`\\[truncated — content exceeded ${CHARACTER_LIMIT} chars\\]$`));
});

test("toSearchResult: structuredContent validates and matches prose", () => {
  const out = toSearchResult([sampleHit], "quantize");
  assert.equal(out.content[0]?.type, "text");
  assert.match(out.content[0]!.text, /1 result \(relevance order\)/);
  searchOutputSchema.parse(out.structuredContent);
  assert.deepEqual(out.structuredContent?.results, [sampleHit]);
});

test("toSearchResult: empty results", () => {
  const out = toSearchResult([], "missing");
  assert.equal(out.content[0]!.text, "No results for query: missing");
  searchOutputSchema.parse(out.structuredContent);
  assert.deepEqual(out.structuredContent?.results, []);
});

test("toChunkResult: structuredContent content matches truncated text body", () => {
  const body = "y".repeat(CHARACTER_LIMIT + 100);
  const chunk = { chunk_id: "c#0", title: "T", source_id: "s.md", content: body };
  const out = toChunkResult(chunk);
  const parsed = chunkOutputSchema.parse(out.structuredContent);
  assert.equal(parsed.content.length, CHARACTER_LIMIT);
  assert.match(out.content[0]!.text, /\[truncated — content exceeded 25000 chars\]/);
});
