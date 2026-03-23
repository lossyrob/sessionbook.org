import { z } from "zod";

const kebabCaseSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const contentVisibilitySchema = z.enum([
  "public",
  "unlisted",
  "private",
]);

export const tuneRecordSchema = z.object({
  id: kebabCaseSchema,
  slug: kebabCaseSchema,
  name: z.string().min(1),
  tuneType: z.string().min(1),
  summary: z.string().min(1),
});

export const tuneAliasRecordSchema = z.object({
  id: kebabCaseSchema,
  tuneId: kebabCaseSchema,
  name: z.string().min(1),
  normalizedName: z.string().min(1),
});

export const chartRecordSchema = z.object({
  id: kebabCaseSchema,
  slug: kebabCaseSchema,
  tuneId: kebabCaseSchema,
  title: z.string().min(1),
  key: z.string().min(1),
  mode: z.string().min(1),
  meter: z.string().regex(/^\d+\/\d+$/),
  contentMarkdown: z.string().min(1),
  visibility: contentVisibilitySchema,
});

export const setEntryRecordSchema = z.object({
  position: z.number().int().positive(),
  tuneId: kebabCaseSchema,
  chartId: kebabCaseSchema,
});

export const setRecordSchema = z.object({
  id: kebabCaseSchema,
  slug: kebabCaseSchema,
  name: z.string().min(1),
  summary: z.string().min(1),
  visibility: contentVisibilitySchema,
  entries: z.array(setEntryRecordSchema).min(1),
});

export const gigSheetEntryRecordSchema = z.object({
  position: z.number().int().positive(),
  setId: kebabCaseSchema,
  transitionNotes: z.string().min(1).optional(),
});

export const gigSheetRecordSchema = z.object({
  id: kebabCaseSchema,
  slug: kebabCaseSchema,
  name: z.string().min(1),
  summary: z.string().min(1),
  visibility: contentVisibilitySchema,
  entries: z.array(gigSheetEntryRecordSchema).min(1),
});

export const release1StoreSchema = z.object({
  tunes: z.array(tuneRecordSchema),
  tuneAliases: z.array(tuneAliasRecordSchema),
  charts: z.array(chartRecordSchema),
  sets: z.array(setRecordSchema),
  gigSheets: z.array(gigSheetRecordSchema),
});

export type ContentVisibility = z.infer<typeof contentVisibilitySchema>;
export type TuneRecord = z.infer<typeof tuneRecordSchema>;
export type TuneAliasRecord = z.infer<typeof tuneAliasRecordSchema>;
export type ChartRecord = z.infer<typeof chartRecordSchema>;
export type SetEntryRecord = z.infer<typeof setEntryRecordSchema>;
export type SetRecord = z.infer<typeof setRecordSchema>;
export type GigSheetEntryRecord = z.infer<typeof gigSheetEntryRecordSchema>;
export type GigSheetRecord = z.infer<typeof gigSheetRecordSchema>;
export type Release1Store = z.infer<typeof release1StoreSchema>;
