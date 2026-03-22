# Release 1 Seed Import Spec

## Overview

Replace the demo Release 1 fixture catalog with imported SessionBook content sourced from the canonical `Sessions` materials. The imported output must continue to satisfy the current Release 1 schema, repository invariants, and Postgres seed path without introducing runtime file reads into the app.

## In scope

- Copy the canonical source assets from `/Users/rob/proj/music/Sessions` into this repository as reproducible inputs.
- Import public tunes and charts into a valid `Release1Store`.
- Import public set structure from the canonical source markdown.
- Import a private St. Paddy's Day gig sheet from the checked-in source assets.
- Replace the demo `release1FixtureStore` with imported Release 1 data.
- Keep `npm run db:setup`, fixture fallback loading, and database-backed loading working with the new imported data.
- Add tests that verify the imported catalog shape and importer normalization behavior.

## Source decisions

- `Sessions/chyunes_mbys.md` is the canonical source for public tune, chart, and set structure.
- `Sessions/2026-01_first_friday_jam.md` is the first fallback source for overlapping tunes that the canonical source names without fenced chart content.
- `Sessions/2025-12_first_friday_jam.md` is the second fallback source for overlapping tunes that still need recoverable chart content after the 2026 source is checked.
- `Sessions/StPaddyDayJam-2026-chords.pdf` is copied into the repo for provenance, but normal builds consume a small checked-in derived gig metadata representation rather than parsing the PDF directly.

## Functional requirements

1. The repo contains the source assets needed to reproduce the imported Release 1 catalog.
2. The importer emits a `Release1Store` that passes the current schema and repository invariant checks.
3. Imported tunes have one public chart each, with deterministic IDs/slugs and alias normalization that works with the current repository search rules.
4. Tune IDs/slugs are derived deterministically from the canonical imported tune title by lowercasing, ASCII-normalizing, removing apostrophes and other punctuation, collapsing non-alphanumeric runs to hyphens, and trimming duplicate or edge hyphens. Chart IDs use `<tune-id>-chart`. Set IDs derive from the ordered imported tune IDs in that set, with a section/index fallback only when the joined slug would collide.
5. Imported public sets derive from `---`-separated tune groups in `chyunes_mbys.md`. When a surviving imported group is preceded by `[drop]`, the importer preserves that signal in the set summary rather than changing the Release 1 schema.
6. The importer uses the fallback chain `chyunes_mbys.md` -> `2026-01_first_friday_jam.md` -> `2025-12_first_friday_jam.md` when recovering chart content for overlapping tunes.
7. Tune type and meter are inferred from source section headings, with per-tune annotations overriding mixed headings such as `STRATHSPEYS → REELS`, and the final family in a mixed heading acting as the fallback default when no per-tune override is present.
8. Title-only tunes with no recoverable chart from any checked-in source are excluded from the imported catalog. If they appear inside a canonical public set group, the importer removes those entries from the imported set as part of the same deterministic rule, and fully empty groups do not become sets.
9. If two candidate aliases for different tunes normalize to the same search term under the current repository rules, the importer fails with a diagnostic instead of emitting an ambiguous catalog.
10. Imported private gig data produces a `st-paddys-day` gig sheet by consuming a checked-in derived gig metadata representation whose provenance is the checked-in PDF source asset.
11. The existing fixture-backed and database-backed repository loaders continue to consume the same `Release1Store` contract.

## Non-goals

- Building runtime markdown import, upload, or editing workflows.
- Expanding the Release 1 schema to support tune placeholders with no chart.
- Building a generalized PDF ingestion subsystem.
- Solving broader chart revision, auth, or live runtime data-loading issues from later Release 1 issues.

## Acceptance criteria

- Checked-in source assets exist in the repo and are used by the import path.
- `release1FixtureStore` contains imported real Release 1 content instead of the current demo fixtures.
- The imported store exposes real public sets and a private `st-paddys-day` gig sheet.
- The import path records any source titles that were excluded because no recoverable chart content exists in the checked-in source chain in a checked-in import metadata artifact that tests can assert against.
- `npm run lint`, `npm run test`, `npm run typecheck`, and `npm run build` pass after the change.

## Constraints

- The app remains in static-export mode.
- The Release 1 repository still requires exactly one chart per imported tune.
- The implementation must not silently fabricate chart data for titles that have no recoverable source content.
- The implementation must not introduce a build-time dependency on external PDF tooling for normal repository builds.
