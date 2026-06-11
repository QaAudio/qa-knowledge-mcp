# @quantumaudio/knowledge-mcp

[MCP](https://modelcontextprotocol.io/) stdio server for **semantic search** over the [qa-knowledge](https://github.com/QaAudio/qa-knowledge) corpus (Ableton Extensions SDK docs, music-production skills, community notes). Uses Qdrant + embeddings via `@quantumaudio/qa-knowledge`.

License: [Apache-2.0](LICENSE).

## Tools

| Tool | Description |
|------|-------------|
| `search_knowledge` | Vector search — returns matching chunks with `source_id`, score, provenance |
| `get_knowledge_chunk` | Full text for a `source_id` from the index |

Use these before guessing SDK APIs when working with [qa-ableton-mcp](https://github.com/QaAudio/qa-ableton-mcp).

## Prerequisites

1. **Clone [qa-knowledge](https://github.com/QaAudio/qa-knowledge)** (or install `@quantumaudio/qa-knowledge` and point `KNOWLEDGE_ROOT` at a corpus checkout).
2. **Qdrant** running (default `http://127.0.0.1:6333`).
3. **Embedding provider** — Ollama or OpenRouter (see env table below).
4. **Indexed corpus** — from the qa-knowledge repo:

   ```bash
   cd /path/to/qa-knowledge
   npm ci && npm run build
   npx qa-knowledge-index
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
| `QDRANT_URL` | `http://127.0.0.1:6333` | Qdrant |
| `KNOWLEDGE_COLLECTION` | `qa-core` | Collection |
| `KNOWLEDGE_ROOT` | `docs/knowledge` | Corpus (relative to qa-knowledge repo root when run from there) |
| `EMBEDDING_PROVIDER` | `openrouter` | `ollama` \| `openrouter` |
| `EMBEDDING_MODEL` | `openai/text-embedding-3-small` | Embedding model |
| `OPENROUTER_API_KEY` | — | Required for default provider |
| `OLLAMA_HOST` | `http://127.0.0.1:11434` | Local embeddings |

When only this repo is cloned, set `KNOWLEDGE_ROOT` to your qa-knowledge checkout, e.g. `../qa-knowledge/docs/knowledge`, and run the indexer from that repo first.

## Cursor configuration

Add to `.cursor/mcp.json` (paths adjusted to your machine):

```json
{
  "mcpServers": {
    "qa-knowledge-mcp": {
      "command": "node",
      "args": ["/path/to/qa-knowledge-mcp/dist/index.js"],
      "env": {
        "QDRANT_URL": "http://127.0.0.1:6333",
        "EMBEDDING_PROVIDER": "openrouter",
        "EMBEDDING_MODEL": "openai/text-embedding-3-small",
        "EMBEDDING_DIMENSIONS": "1536",
        "KNOWLEDGE_ROOT": "/path/to/qa-knowledge/docs/knowledge"
      }
    }
  }
}
```

Pair with **qa-ableton-mcp** for Live control + SDK retrieval.

## Development

```bash
npm run typecheck
npm run build
npm test
```

## Related repos

| Repo | Role |
|------|------|
| [qa-knowledge](https://github.com/QaAudio/qa-knowledge) | Corpus + indexer library |
| [qa-ableton-mcp](https://github.com/QaAudio/qa-ableton-mcp) | Ableton Live MCP stack |

## Contributing

See [AGENTS.md](AGENTS.md).
