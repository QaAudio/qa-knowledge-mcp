import { z } from "zod";

const sourceTypeSchema = z.enum([
  "skill",
  "skill_reference",
  "repo_doc",
  "external_manual",
  "sdk_reference",
  "plugin_doc",
  "user_note",
]);

export const searchHitSchema = z.object({
  chunk_id: z.string(),
  score: z.number(),
  source_id: z.string(),
  source_type: sourceTypeSchema,
  title: z.string(),
  heading_path: z.string().optional(),
  skill_name: z.string().optional(),
  excerpt: z.string(),
  origin: z.string().optional(),
  source: z.string().optional(),
  source_url: z.string().optional(),
  license: z.string().optional(),
});

export const searchOutputSchema = z.object({
  results: z.array(searchHitSchema),
});

export const chunkOutputSchema = z.object({
  chunk_id: z.string(),
  title: z.string(),
  source_id: z.string(),
  content: z.string(),
});
