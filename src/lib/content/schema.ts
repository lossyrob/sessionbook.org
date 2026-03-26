import { z } from "zod";

import { tuneLinkSchema } from "@/lib/content/tune-links";
import { tuneVersionSchema } from "@/lib/content/tune-versions";
import { contentVisibilitySchema } from "@/lib/release-1/schema";

export const contentSlugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const tuneDocumentSchema = z.object({
  slug: contentSlugSchema,
  title: z.string().min(1),
  aliases: z.array(z.string().min(1)),
  tuneType: z.string().min(1),
  key: z.string().min(1),
  mode: z.string().min(1),
  meter: z.string().regex(/^\d+\/\d+$/).optional(),
  visibility: contentVisibilitySchema,
  chart: z.string(),
  versions: z.array(tuneVersionSchema).min(1),
  notes: z.string(),
  links: z.array(tuneLinkSchema),
  workingNotes: z.string(),
  sourcePath: z.string().min(1),
});

export const setDocumentSchema = z.object({
  slug: contentSlugSchema,
  title: z.string().min(1),
  tuneType: z.string().min(1).optional(),
  visibility: contentVisibilitySchema,
  tuneSlugs: z.array(contentSlugSchema).min(1),
  notes: z.string(),
  sourcePath: z.string().min(1),
});

export const sessionSectionSchema = z.object({
  heading: z.string().min(1),
  setSlugs: z.array(contentSlugSchema).min(1),
});

export const sessionDocumentSchema = z.object({
  slug: contentSlugSchema,
  title: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  visibility: contentVisibilitySchema,
  notes: z.string(),
  sections: z.array(sessionSectionSchema).min(1),
  sourcePath: z.string().min(1),
});

export const sessionbookCorpusSchema = z.object({
  tunes: z.array(tuneDocumentSchema),
  sets: z.array(setDocumentSchema),
  sessions: z.array(sessionDocumentSchema),
});

export type TuneDocument = z.infer<typeof tuneDocumentSchema>;
export type SetDocument = z.infer<typeof setDocumentSchema>;
export type SessionSection = z.infer<typeof sessionSectionSchema>;
export type SessionDocument = z.infer<typeof sessionDocumentSchema>;
export type SessionbookCorpus = z.infer<typeof sessionbookCorpusSchema>;
