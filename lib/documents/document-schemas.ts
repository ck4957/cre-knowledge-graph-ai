import { z } from "zod";

export const documentChunkInputSchema = z.object({
  id: z.string().min(1),
  content: z.string().min(1),
  entityRefs: z.array(z.string()).default([])
});

export const createDocumentSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  sourceType: z.string().min(1),
  sourceUri: z.string().url().nullable().optional(),
  chunks: z.array(documentChunkInputSchema).min(1)
});

export const updateDocumentSchema = z.object({
  title: z.string().min(1).optional(),
  sourceType: z.string().min(1).optional(),
  sourceUri: z.string().url().nullable().optional()
});

