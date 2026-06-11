# qa-knowledge-mcp — Agent Guide

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
- Index must exist in Qdrant before tools return useful results (`qa-knowledge-index` in qa-knowledge repo).

## Local dev with corpus

Clone [qa-knowledge](https://github.com/QaAudio/qa-knowledge) alongside this repo. Set `KNOWLEDGE_ROOT` to that repo's `docs/knowledge`. Build qa-knowledge first (`npm run build`).

## Changing tools

1. Edit `src/tools.ts` + tests
2. Update README tool table
3. Keep Zod input schemas strict; return `source_id` paths agents can open

Security / publish: `.cursor/skills/security-guidelines/SKILL.md`.
