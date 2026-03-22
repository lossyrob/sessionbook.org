# Work Shaping

## Problem statement

Issue `#4` needs to replace the hand-authored demo Release 1 fixtures with real SessionBook content. The codebase already has a validated `Release1Store` schema, repository invariants, and Postgres seeding path, but the issue text was stale: it assumed the canonical source markdown already lived in this repo and did not define how the private St. Paddy's Day gig should be sourced.

The user clarified the missing source contract during shaping: the canonical input lives at `/Users/rob/proj/music/Sessions`, and the repo should copy in the needed source assets before implementing the importer.

## Core functionality

- Copy the canonical source assets into the repository so the import path is reproducible.
- Import real public tune and chart data into `Release1Store`.
- Import public set structure from the canonical source markdown.
- Import a private St. Paddy's Day gig sheet from the available source assets.
- Preserve the current `release1FixtureStore` -> `db:setup` -> repository load flow so the app keeps working in both fixture and database modes.

## Supporting functionality

- Normalize duplicate tune names across source files into a single Release 1 tune identity.
- Backfill missing charts from secondary source files when the primary source names a tune but omits fenced chart content.
- Preserve source-specific annotations that the current schema can represent directly in chart markdown or set summaries.
- Add tests that pin the imported catalog shape so future source edits fail loudly.

## Edge cases

- `chyunes_mbys.md` includes title-only entries without fenced chart content. Because Release 1 enforces exactly one chart per imported tune, those entries must either be backfilled from secondary sources or excluded from the imported store.
- `[drop]` markers appear between public tune groups. The current schema has no dedicated drop flag, so the importer must preserve that signal in a schema-compatible form, most likely via set summaries or separate set grouping.
- Duplicate tune names use slightly different wording across files, such as “Swinging on the Gate” vs. “Swinging on a Gate”. Normalization must collapse these to a single imported tune instead of creating ambiguous aliases.
- The St. Paddy's Day gig appears to exist only as a PDF. Its text is extractable, but the repo should avoid a brittle build-time dependency on external PDF tooling if a checked-in derived representation is enough.

## Rough architecture

1. Checked-in source assets under `Sessions/` become the reproducible import inputs.
2. A Release 1 source importer parses and normalizes those inputs into a `Release1Store`.
3. The importer output replaces the demo `release1FixtureStore`.
4. Existing seed and repository modules continue to consume the same `Release1Store` shape without runtime architectural changes.

## Critical analysis

The safest fit is a deterministic importer that produces checked-in Release 1 fixture data rather than teaching the app to read markdown or PDFs at runtime. That keeps the existing static-export build model intact, avoids Node-only file reads inside app code, and reuses the current database seeding and repository invariant checks as the final validation layer.

Using `chyunes_mbys.md` as the canonical public source is lower risk than merging all three markdown files equally. The jam markdown files are still valuable, but primarily as fallback sources for overlapping tunes or missing chord content.

## Codebase fit

- `src/lib/release-1/schema.ts` already defines the import target shape.
- `src/lib/release-1/repository.ts` already validates the imported store with the Release 1 invariants.
- `src/lib/db/seed.ts` and `scripts/db-setup.ts` already seed Postgres from the checked-in fixture store.
- The current app already renders whatever `release1FixtureStore` contains, so replacing the demo data is the lowest-friction integration path.

## Risks

- Parser bugs could create duplicate IDs, invalid aliases, or tunes without charts, which the repository will reject.
- The source files contain inconsistent notation styles and partial charts, so fallback behavior must be explicit and test-covered.
- A build-time dependency on `pdftotext` would be fragile in CI unless deliberately handled.

## Open questions for downstream stages

- If the St. Paddy gig PDF does not encode enough structure to recover set ordering cleanly, the implementation should introduce a small checked-in derived metadata file rather than silently inventing a gig order.

## Session notes

- The issue spec gap was resolved by user input: copy source assets from `/Users/rob/proj/music/Sessions` into this repo.
- The current implementation target is to keep the static Release 1 data contract and seed path unchanged while swapping in real imported content.
