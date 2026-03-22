import type { Sql } from "postgres";

import { release1FixtureStore } from "../../data/release-1/fixture-store";

export async function seedRelease1Catalog(sql: Sql) {
  for (const gigSheet of release1FixtureStore.gigSheets) {
    await sql`delete from gig_sheet_entries where gig_sheet_id = ${gigSheet.id}`;
    await sql`delete from gig_sheets where id = ${gigSheet.id}`;
  }

  for (const setRecord of release1FixtureStore.sets) {
    await sql`delete from set_entries where set_id = ${setRecord.id}`;
    await sql`delete from sets where id = ${setRecord.id}`;
  }

  for (const chart of release1FixtureStore.charts) {
    await sql`delete from charts where id = ${chart.id}`;
  }

  for (const alias of release1FixtureStore.tuneAliases) {
    await sql`delete from tune_aliases where id = ${alias.id}`;
  }

  for (const tune of release1FixtureStore.tunes) {
    await sql`delete from tunes where id = ${tune.id}`;
  }

  for (const tune of release1FixtureStore.tunes) {
    await sql`
      insert into tunes (id, slug, name, tune_type, summary)
      values (${tune.id}, ${tune.slug}, ${tune.name}, ${tune.tuneType}, ${tune.summary})
    `;
  }

  for (const alias of release1FixtureStore.tuneAliases) {
    await sql`
      insert into tune_aliases (id, tune_id, name, normalized_name)
      values (${alias.id}, ${alias.tuneId}, ${alias.name}, ${alias.normalizedName})
    `;
  }

  for (const chart of release1FixtureStore.charts) {
    await sql`
      insert into charts (
        id,
        slug,
        tune_id,
        title,
        chart_key,
        mode,
        meter,
        content_markdown,
        visibility
      )
      values (
        ${chart.id},
        ${chart.slug},
        ${chart.tuneId},
        ${chart.title},
        ${chart.key},
        ${chart.mode},
        ${chart.meter},
        ${chart.contentMarkdown},
        ${chart.visibility}
      )
    `;
  }

  for (const setRecord of release1FixtureStore.sets) {
    await sql`
      insert into sets (id, slug, name, summary, visibility)
      values (
        ${setRecord.id},
        ${setRecord.slug},
        ${setRecord.name},
        ${setRecord.summary},
        ${setRecord.visibility}
      )
    `;

    for (const entry of setRecord.entries) {
      await sql`
        insert into set_entries (set_id, position, tune_id, chart_id)
        values (${setRecord.id}, ${entry.position}, ${entry.tuneId}, ${entry.chartId})
      `;
    }
  }

  for (const gigSheet of release1FixtureStore.gigSheets) {
    await sql`
      insert into gig_sheets (id, slug, name, summary, visibility)
      values (
        ${gigSheet.id},
        ${gigSheet.slug},
        ${gigSheet.name},
        ${gigSheet.summary},
        ${gigSheet.visibility}
      )
    `;

    for (const entry of gigSheet.entries) {
      await sql`
        insert into gig_sheet_entries (gig_sheet_id, position, set_id, transition_notes)
        values (
          ${gigSheet.id},
          ${entry.position},
          ${entry.setId},
          ${entry.transitionNotes ?? null}
        )
      `;
    }
  }
}
