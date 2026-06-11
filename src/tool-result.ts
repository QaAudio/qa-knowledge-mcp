import type { SearchHit } from "@quantumaudio/qa-knowledge";
import { CHARACTER_LIMIT } from "./constants.js";
import { chunkOutputSchema, searchOutputSchema } from "./output-schemas.js";

export type ToolResult = {
  content: { type: "text"; text: string }[];
  structuredContent?: Record<string, unknown>;
};

export type ChunkRecord = {
  chunk_id: string;
  content: string;
  source_id: string;
  title: string;
};

function formatHit(index: number, hit: SearchHit): string {
  const lines = [
    `### ${index}. [${hit.score.toFixed(2)}] ${hit.title}`,
    `chunk_id: ${hit.chunk_id}`,
    `source_id: ${hit.source_id}`,
    `source_type: ${hit.source_type}${hit.skill_name ? ` | skill: ${hit.skill_name}` : ""}`,
  ];
  if (hit.heading_path) lines.push(`heading_path: ${hit.heading_path}`);
  if (hit.origin) lines.push(`origin: ${hit.origin}`);
  if (hit.source) lines.push(`source: ${hit.source}`);
  if (hit.source_url) lines.push(`source_url: ${hit.source_url}`);
  if (hit.license) lines.push(`license: ${hit.license}`);
  lines.push("", hit.excerpt);
  return lines.join("\n");
}

/** Human-readable search hits for MCP `content[].text`. */
export function formatSearchResultsText(results: SearchHit[], query?: string): string {
  if (results.length === 0) {
    return query ? `No results for query: ${query}` : "No results.";
  }
  const header = `${results.length} result${results.length === 1 ? "" : "s"} (relevance order):`;
  const body = results.map((hit, i) => formatHit(i + 1, hit)).join("\n\n");
  return `${header}\n\n${body}`;
}

function truncateContent(content: string): { content: string; truncated: boolean } {
  if (content.length <= CHARACTER_LIMIT) return { content, truncated: false };
  return { content: content.slice(0, CHARACTER_LIMIT), truncated: true };
}

/** Human-readable chunk body for MCP `content[].text`. */
export function formatChunkText(chunk: ChunkRecord): {
  text: string;
  content: string;
  truncated: boolean;
} {
  const { content, truncated } = truncateContent(chunk.content);
  const header = [
    `chunk_id: ${chunk.chunk_id}`,
    `title: ${chunk.title}`,
    `source_id: ${chunk.source_id}`,
    "",
    "---",
    "",
  ].join("\n") + "\n";
  const note = truncated ? `\n\n[truncated — content exceeded ${CHARACTER_LIMIT} chars]` : "";
  return { text: header + content + note, content, truncated };
}

export function toSearchResult(results: SearchHit[], query?: string): ToolResult {
  const structuredContent = { results };
  searchOutputSchema.parse(structuredContent);
  return {
    content: [{ type: "text", text: formatSearchResultsText(results, query) }],
    structuredContent,
  };
}

export function toChunkResult(chunk: ChunkRecord): ToolResult {
  const { text, content } = formatChunkText(chunk);
  const structuredContent = { ...chunk, content };
  chunkOutputSchema.parse(structuredContent);
  return {
    content: [{ type: "text", text }],
    structuredContent,
  };
}
