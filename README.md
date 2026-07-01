# @quantumaudio/knowledge-mcp

> **Deprecated in QuantumAudio monorepo.** Documentation MCP tools (`search_knowledge`, `get_knowledge_chunk`) are now hosted by [`apps/qa-library-mcp`](../qa-library-mcp/). Indexing remains in [`packages/qa-knowledge`](../../packages/qa-knowledge).

This standalone package is retained for external consumers during transition. New integrations should use `qa-library-mcp` with the same tool names.

---

[MCP](https://modelcontextprotocol.io/) stdio server for **semantic search** over the [qa-knowledge](https://github.com/QaAudio/qa-knowledge) corpus (Ableton Extensions SDK docs, music-production skills, community notes). Uses Qdrant + embeddings via `@quantumaudio/qa-knowledge`.

License: [Apache-2.0](LICENSE).

## Tools

| Tool | Description |
|------|-------------|
| `search_knowledge` | Vector search — returns matching chunks with `source_id`, score, provenance |
| `get_knowledge_chunk` | Full text for a `source_id` from the index |

Use these before guessing SDK APIs when working with [qa-ableton-mcp](https://github.com/QaAudio/qa-ableton-mcp).

## Migration (QuantumAudio)

1. Register **`qa-library-mcp`** instead of this server in MCP config.
2. Keep `npm run knowledge:sync` for indexing — unchanged.
3. Tool names and payloads are unchanged; see [`apps/qa-library-mcp/docs/knowledge-mcp-contract.md`](../qa-library-mcp/docs/knowledge-mcp-contract.md).

## Prerequisites

1. **Clone [qa-knowledge](https://github.com/QaAudio/qa-knowledge)** (or install `@quantumaudio/qa-knowledge` and point `KNOWLEDGE_ROOT` at a corpus checkout).
2. **Embedded Qdrant** — managed locally on `http://127.0.0.1:6433`. Prepare once: `npm run qdrant:prepare` (from QuantumAudio monorepo root).
3. **Embedding provider** — Ollama or OpenRouter (see env table below).
4. **Indexed corpus** — from the qa-knowledge repo:

   ```bash
   cd /path/to/qa-knowledge
   npm ci && npm run build
   npx qa-knowledge-index sync
   ```

## Install & build

```bash
git clone https://github.com/QaAudio/qa-knowledge-mcp.git
cd qa-knowledge-mcp
npm ci
npm run build
```

Depends on `@quantumaudio/qa-knowledge` (npm or sibling checkout).

## Run

```bash
node dist/index.js
```

Stdio only — the process must not write logs to stdout (MCP channel). Diagnostics go to stderr.

## Environment

Inherited from `@quantumaudio/qa-knowledge` (`configFromEnv`):

| Variable | Default | Purpose |
|----------|---------|---------|
| `QA_QDRANT_DATA_DIR` | `{userData}/qdrant` | Embedded Qdrant data dir |
| `KNOWLEDGE_COLLECTION` | `qa-core` | Collection |
| `KNOWLEDGE_ROOT` | `docs/knowledge` | Corpus (relative to qa-knowledge repo root when run from there) |
| `EMBEDDING_PROVIDER` | `openrouter` | `ollama` \| `openrouter` |
| `EMBEDDING_MODEL` | `openai/text-embedding-3-small` | Embedding model |
| `OPENROUTER_API_KEY` | — | Required for default provider |
| `OLLAMA_HOST` | `http://127.0.0.1:11434` | Local embeddings |

When only this repo is cloned, set `KNOWLEDGE_ROOT` to your qa-knowledge checkout, e.g. `../qa-knowledge/docs/knowledge`, and run the indexer from that repo first.

## Related repos

| Repo | Role |
|------|------|
| [qa-knowledge](https://github.com/QaAudio/qa-knowledge) | Corpus + indexer library |
| [qa-ableton-mcp](https://github.com/QaAudio/qa-ableton-mcp) | Ableton Live MCP stack |

## Contributing

See [AGENTS.md](AGENTS.md).
