import { getDatabaseClient } from "./client";
import { release1StoreSchema, type Release1Store } from "../release-1/schema";

type SetEntryRow = {
  setId: string;
  position: number;
  tuneId: string;
  chartId: string;
};

type GigSheetEntryRow = {
  gigSheetId: string;
  position: number;
  setId: string;
  transitionNotes: string | null;
};

function assertRecordsHaveEntries(
  records: ReadonlyArray<{ id: string; entries: unknown[] }>,
  recordType: string,
) {
  for (const record of records) {
    if (record.entries.length === 0) {
      throw new Error(
        `Database ${recordType} "${record.id}" has no entries. Each ${recordType} must include at least one entry.`,
      );
    }
  }
}

async function hasRequiredTables(): Promise<boolean> {
  const sql = getDatabaseClient();
  const requiredTables = [
    "tunes",
    "tune_aliases",
    "charts",
    "sets",
    "set_entries",
    "gig_sheets",
    "gig_sheet_entries",
  ];

  for (const tableName of requiredTables) {
    const [row] = await sql`
      select to_regclass(${`public.${tableName}`}) as "relationName"
    `;

    if (!row?.relationName) {
      return false;
    }
  }

  return true;
}

export async function loadRelease1StoreFromDatabase(): Promise<Release1Store | null> {
  const sql = getDatabaseClient();

  if (!(await hasRequiredTables())) {
    return null;
  }

  const [tuneCountRow] = await sql`
    select count(*)::int as "count"
    from tunes
  `;

  if (!tuneCountRow || Number(tuneCountRow.count) === 0) {
    return null;
  }

  const tunes = await sql`
    select
      id,
      slug,
      name,
      tune_type as "tuneType",
      summary
    from tunes
    order by name
  `;

  const tuneAliases = await sql`
    select
      id,
      tune_id as "tuneId",
      name,
      normalized_name as "normalizedName"
    from tune_aliases
    order by normalized_name
  `;

  const charts = await sql`
    select
      id,
      slug,
      tune_id as "tuneId",
      title,
      chart_key as "key",
      mode,
      meter,
      content_markdown as "contentMarkdown",
      visibility
    from charts
    order by title
  `;

  const setEntryRows = (await sql`
    select
      set_id as "setId",
      position,
      tune_id as "tuneId",
      chart_id as "chartId"
    from set_entries
    order by set_id, position
  `) as SetEntryRow[];

  const setEntriesBySetId = new Map<
    string,
    Release1Store["sets"][number]["entries"]
  >();

  for (const entry of setEntryRows) {
    const entries = setEntriesBySetId.get(entry.setId) ?? [];
    entries.push({
      position: entry.position,
      tuneId: entry.tuneId,
      chartId: entry.chartId,
    });
    setEntriesBySetId.set(entry.setId, entries);
  }

  const sets = (
    await sql`
    select
      id,
      slug,
      name,
      summary,
      visibility
    from sets
    order by name
  `
  ).map((row) => ({
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    summary: String(row.summary),
    visibility: row.visibility,
    entries: setEntriesBySetId.get(String(row.id)) ?? [],
  }));
  assertRecordsHaveEntries(sets, "set");

  const gigSheetEntryRows = (await sql`
    select
      gig_sheet_id as "gigSheetId",
      position,
      set_id as "setId",
      transition_notes as "transitionNotes"
    from gig_sheet_entries
    order by gig_sheet_id, position
  `) as GigSheetEntryRow[];

  const gigSheetEntriesById = new Map<
    string,
    Release1Store["gigSheets"][number]["entries"]
  >();

  for (const entry of gigSheetEntryRows) {
    const entries = gigSheetEntriesById.get(entry.gigSheetId) ?? [];
    entries.push({
      position: entry.position,
      setId: entry.setId,
      transitionNotes: entry.transitionNotes ?? undefined,
    });
    gigSheetEntriesById.set(entry.gigSheetId, entries);
  }

  const gigSheets = (
    await sql`
    select
      id,
      slug,
      name,
      summary,
      visibility
    from gig_sheets
    order by name
  `
  ).map((row) => ({
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    summary: String(row.summary),
    visibility: row.visibility,
    entries: gigSheetEntriesById.get(String(row.id)) ?? [],
  }));
  assertRecordsHaveEntries(gigSheets, "gig sheet");

  return release1StoreSchema.parse({
    tunes,
    tuneAliases,
    charts,
    sets,
    gigSheets,
  });
}
