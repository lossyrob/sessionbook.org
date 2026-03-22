# Code Research

## Existing Release 1 data contract

- `src/lib/release-1/schema.ts:1-80` defines the `Release1Store` contract used across fixtures, repository loading, and Postgres seeding.
- `src/lib/release-1/repository.ts:154-222` enforces the current Release 1 invariants: imported charts must be public, sets must be public, gig sheets must be private, and every imported tune must have exactly one chart.
- `src/lib/release-1/load-repository.ts:10-31` keeps the app on a fixture-backed fallback path when `DATABASE_URL` is absent and uses Postgres only when seeded data is available.

## Existing ID and alias behavior

- `src/lib/release-1/schema.ts:3-5` constrains imported IDs and slugs to lowercase kebab-case.
- `src/lib/release-1/schema.ts:15-20` requires `TuneAliasRecord` entries to carry both the alias text and its normalized search term.
- `src/lib/release-1/repository.ts:75-82` defines the current search normalization contract: trim, lowercase, replace non-alphanumeric runs with spaces, collapse whitespace, trim again.
- `src/lib/release-1/repository.ts:121-152` rejects alias collisions when multiple tunes normalize to the same lookup term, so importer alias generation must reuse that contract rather than inventing a separate normalization rule.

## Existing seed and persistence path

- `src/lib/db/seed.ts:1-121` seeds Postgres directly from `release1FixtureStore`.
- `scripts/db-setup.ts:6-35` runs migrations and then calls the seed function during `npm run db:setup`.
- `src/lib/db/release-1-store.test.ts:12-34` currently verifies that the seeded catalog can round-trip from Postgres back into a `Release1Store`.

## Existing fixture data

- `src/data/release-1/fixture-store.ts:1-191` is currently a hand-authored demo catalog with four tunes, two sets, and one private gig sheet. Replacing this fixture store is the lowest-friction integration path because the rest of the app already consumes it.

## Source asset observations

- `/Users/rob/proj/music/Sessions/chyunes_mbys.md:1-416` is the most structured public source: tune titles use `**Name** (Key)` syntax, sections are grouped by `##` headings, set-like groupings are separated by `---`, and standalone `[drop]` markers appear before some tune groups.
- `/Users/rob/proj/music/Sessions/2026-01_first_friday_jam.md:10-208` contains overlapping tunes in fenced-chart form but usually omits key annotations, making it a useful fallback source rather than the primary catalog definition.
- `/Users/rob/proj/music/Sessions/2025-12_first_friday_jam.md:2-143` uses compact inline chord notation and is even less canonical, but it still contains fallback material for a few overlapping tunes such as `Willie Coleman's`.

## Source-to-schema implications

- The Release 1 schema has no dedicated field for `[drop]` on set entries or sets, so any preserved drop signal must be encoded using existing fields such as set summaries rather than via schema change.
- The source markdown exposes tune family/type primarily through section headings like `## JIGS`, `## REELS`, `## HORNPIPES`, and `## WALTZES`, not through a dedicated metadata field. Meter therefore also needs to be inferred from those section families.
- `chyunes_mbys.md` includes a mixed heading `## STRATHSPEYS → REELS`, and some tune titles in that section include `strathspey` inside the key/mode annotation. That means the importer needs an explicit rule for tune type and meter inference in mixed sections instead of assuming one section heading maps one-to-one to one tune type.
- Some source titles are present without fenced chart content. Because the schema cannot represent a tune without a chart, the importer needs a deterministic fallback chain and an explicit exclusion path for unrecoverable titles.

## Import implications

- The importer should preserve the existing `Release1Store` boundary so `db:setup`, fixture fallback loading, and repository rendering stay unchanged.
- The implementation needs an explicit policy for title-only source entries because the current schema cannot represent a tune without a chart.
- The fallback source order should be explicit: canonical `chyunes_mbys.md`, then `2026-01_first_friday_jam.md`, then `2025-12_first_friday_jam.md`.
- If the St. Paddy PDF remains the only available gig source, derive a checked-in representation from it instead of adding a fragile build-time external dependency.
