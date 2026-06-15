#!/usr/bin/env node

/**
 * qa-knowledge-mcp — semantic search over QuantumAudio docs via Qdrant.
 * stdio rule: NEVER write to stdout (MCP channel). Log via console.error.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { configFromEnv, ensureEmbeddedQdrant } from "@quantumaudio/qa-knowledge";
import { registerTools } from "./tools.js";

export const INSTRUCTIONS = `Semantic documentation search for QuantumAudio (Ableton Extensions SDK, skills, repo docs).

Use search_knowledge for technique/device/workflow/SDK-API questions before guessing file_editor paths.
Use get_knowledge_chunk after search_knowledge when you need the full section text.

The Ableton Extensions SDK guides, API reference, examples, and type surface are indexed here
(docs/knowledge/ableton-sdk) — search_knowledge is the single retrieval path for them.
search_knowledge returns relevant sections from the reference corpus; use get_knowledge_chunk for
full text. (Inside QuantumAgent, the built-in invoke_skill tool returns full skill bodies.)

Index must exist: npm run knowledge:sync (or knowledge:embedding then knowledge:index). Requires embedded Qdrant for index step.
Prepare Qdrant binary once: npm run qdrant:prepare`;

const server = new McpServer(
  { name: "qa-knowledge-mcp", version: "0.0.1" },
  { instructions: INSTRUCTIONS },
);

registerTools(server);

async function main() {
  await ensureEmbeddedQdrant();
  const config = configFromEnv();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(
    `[qa-knowledge-mcp] running on stdio; qdrant=${config.qdrant.url} collection=${config.qdrant.collection}`,
  );
}

main().catch((e) => {
  console.error("[qa-knowledge-mcp] fatal:", e);
  process.exit(1);
});
