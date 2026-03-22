import type { Sql } from "postgres";

import { release1FixtureStore } from "../../data/release-1/fixture-store";

export async function seedRelease1Catalog(sql: Sql) {
  await sql.begin(async (transaction) => {
    await transaction.unsafe(`
      truncate table
        gig_sheet_entries,
        gig_sheets,
        set_entries,
        sets,
        charts,
        tune_aliases,
        tunes
      cascade
    `);

    for (const tune of release1FixtureStore.tunes) {
      await transaction.unsafe(
        `
          insert into tunes (id, slug, name, tune_type, summary)
          values ($1, $2, $3, $4, $5)
        `,
        [tune.id, tune.slug, tune.name, tune.tuneType, tune.summary],
      );
    }

    for (const alias of release1FixtureStore.tuneAliases) {
      await transaction.unsafe(
        `
          insert into tune_aliases (id, tune_id, name, normalized_name)
          values ($1, $2, $3, $4)
        `,
        [alias.id, alias.tuneId, alias.name, alias.normalizedName],
      );
    }

    for (const chart of release1FixtureStore.charts) {
      await transaction.unsafe(
        `
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
          values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `,
        [
          chart.id,
          chart.slug,
          chart.tuneId,
          chart.title,
          chart.key,
          chart.mode,
          chart.meter,
          chart.contentMarkdown,
          chart.visibility,
        ],
      );
    }

    for (const setRecord of release1FixtureStore.sets) {
      await transaction.unsafe(
        `
          insert into sets (id, slug, name, summary, visibility)
          values ($1, $2, $3, $4, $5)
        `,
        [
          setRecord.id,
          setRecord.slug,
          setRecord.name,
          setRecord.summary,
          setRecord.visibility,
        ],
      );

      for (const entry of setRecord.entries) {
        await transaction.unsafe(
          `
            insert into set_entries (set_id, position, tune_id, chart_id)
            values ($1, $2, $3, $4)
          `,
          [setRecord.id, entry.position, entry.tuneId, entry.chartId],
        );
      }
    }

    for (const gigSheet of release1FixtureStore.gigSheets) {
      await transaction.unsafe(
        `
          insert into gig_sheets (id, slug, name, summary, visibility)
          values ($1, $2, $3, $4, $5)
        `,
        [
          gigSheet.id,
          gigSheet.slug,
          gigSheet.name,
          gigSheet.summary,
          gigSheet.visibility,
        ],
      );

      for (const entry of gigSheet.entries) {
        await transaction.unsafe(
          `
            insert into gig_sheet_entries (gig_sheet_id, position, set_id, transition_notes)
            values ($1, $2, $3, $4)
          `,
          [gigSheet.id, entry.position, entry.setId, entry.transitionNotes ?? null],
        );
      }
    }
  });
}
