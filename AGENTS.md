# qa-knowledge-mcp — Agent Guide

> **Deprecated in QuantumAudio monorepo.** Use `apps/qa-library-mcp` for `search_knowledge` / `get_knowledge_chunk`. Keep `@quantumaudio/qa-knowledge` for indexing.

MCP stdio server: `search_knowledge`, `get_knowledge_chunk`. Depends on `@quantumaudio/qa-knowledge`.

## Layout

```
qa-knowledge-mcp/
├── src/
│   ├── index.ts       # MCP server entry (stdio — no stdout logs)
│   ├── tools.ts       # tool registration
│   └── tool-result.ts
└── package.json
```

## Commands

```bash
npm run typecheck
npm run build
npm test
```

## Runtime rules

- **Never** `console.log` to stdout — breaks MCP stdio.
- Use `console.error` for diagnostics.
- Index must exist in Qdrant before tools return useful results (`qa-knowledge-index sync` in qa-knowledge repo).

## Local dev with corpus

Clone [qa-knowledge](https://github.com/QaAudio/qa-knowledge) alongside this repo. Set `KNOWLEDGE_ROOT` to that repo's `docs/knowledge`. Build qa-knowledge first (`npm run build`).

## Changing tools

Prefer changing [`apps/qa-library-mcp/docs/knowledge-mcp-contract.md`](../qa-library-mcp/docs/knowledge-mcp-contract.md) and the bridge in `qa-library-mcp` for monorepo consumers.

Security / publish: `.cursor/skills/security-guidelines/SKILL.md`.
