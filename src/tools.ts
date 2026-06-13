import { z } from "zod";

import {

  configFromEnv,

  fetchKnowledgeChunk,

  searchKnowledge,

  type SourceType,

} from "@quantumaudio/qa-knowledge";

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { chunkOutputSchema, searchOutputSchema } from "./output-schemas.js";

import { toChunkResult, toSearchResult } from "./tool-result.js";



const sourceTypeSchema = z.enum([

  "skill",

  "skill_reference",

  "repo_doc",

  "external_manual",

  "sdk_reference",

  "plugin_doc",

  "user_note",

]);



const searchShape = {

  query: z.string().min(1).describe("Natural-language search query"),

  limit: z.number().int().min(1).max(20).optional().describe("Max results (default 5)"),

  source_type: z

    .array(sourceTypeSchema)

    .optional()

    .describe("Filter by source categories"),

  skill_name: z

    .string()

    .optional()

    .describe("Filter to a skill subdirectory, e.g. ableton-midi"),

};



const getChunkShape = {

  chunk_id: z.string().min(1).describe("chunk_id from search_knowledge results"),

};



export function registerTools(server: McpServer): void {

  const config = configFromEnv();



  server.registerTool(

    "search_knowledge",

    {

      title: "Search QuantumAudio documentation",

      description:

        "Semantic search over indexed skills, MCP resources, and repo docs in Qdrant. " +

        "Use before file_editor when looking for technique, device, or workflow reference material. " +

        "Returns excerpts; call get_knowledge_chunk for full text.",

      inputSchema: searchShape,

      outputSchema: searchOutputSchema,

      annotations: {

        readOnlyHint: true,

        destructiveHint: false,

        idempotentHint: true,

        openWorldHint: false,

      },

    },

    async (args) => {

      try {

        const results = await searchKnowledge(config, args.query, {

          limit: args.limit,

          sourceTypes: args.source_type as SourceType[] | undefined,

          skillName: args.skill_name,

        });

        return toSearchResult(results, args.query);

      } catch (err) {

        const message = err instanceof Error ? err.message : String(err);

        const filtered = Boolean(args.skill_name || args.source_type?.length);

        return {

          content: [

            {

              type: "text" as const,

              text: JSON.stringify({

                error: message,

                hint: filtered

                  ? "Search failed with filters. Retry the same query WITHOUT `skill_name`/`source_type` (the collection may lack payload indexes). If it still fails, ensure Qdrant is running and re-run `npm run knowledge:index`."

                  : "Ensure Qdrant is running and run `npm run knowledge:index`.",

              }),

            },

          ],

          isError: true,

        };

      }

    },

  );



  server.registerTool(

    "get_knowledge_chunk",

    {

      title: "Fetch full knowledge chunk",

      description: "Return the full markdown/text for a chunk_id from search_knowledge.",

      inputSchema: getChunkShape,

      outputSchema: chunkOutputSchema,

      annotations: {

        readOnlyHint: true,

        destructiveHint: false,

        idempotentHint: true,

        openWorldHint: false,

      },

    },

    async (args) => {

      try {

        const chunk = await fetchKnowledgeChunk(config, args.chunk_id);

        if (!chunk) {

          return {

            content: [{ type: "text" as const, text: JSON.stringify({ error: "Chunk not found" }) }],

            isError: true,

          };

        }

        return toChunkResult(chunk);

      } catch (err) {

        const message = err instanceof Error ? err.message : String(err);

        return {

          content: [{ type: "text" as const, text: JSON.stringify({ error: message }) }],

          isError: true,

        };

      }

    },

  );

}

