# Release 1 Seed Import

## Overview

Issue `#4` replaces the demo Release 1 catalog with real imported SessionBook content. The implementation copies the canonical `Sessions/*` source assets into the repository, parses them into the existing `Release1Store` shape, and keeps the current fixture-backed and Postgres-backed repository flows intact.

The result is a checked-in imported catalog with real public tunes, public sets, and a private `st-paddys-day` gig sheet. The app still behaves like the earlier scaffold at runtime, but the data behind that scaffold now comes from real source material instead of hand-authored demo fixtures.

## Architecture and Design

### High-Level Architecture

The import path is intentionally offline and deterministic:

1. Checked-in source assets live under `Sessions/`.
2. `buildRelease1Import()` in `src/lib/release-1/import-source.ts` parses those assets into a validated `Release1Store`.
3. `npm run generate:release-1-data` rewrites `src/data/release-1/fixture-store.ts` from that normalized store.
4. The existing repository loader and `db:setup` path continue to read from `release1FixtureStore`, so the runtime architecture does not change.

The private gig import uses checked-in metadata rather than PDF parsing at build time. `src/data/release-1/import-metadata.ts` records the St. Paddy's Day selection rule and the expected list of excluded source titles, and the importer validates those expectations while generating the catalog.

### Design Decisions

- **Canonical public source**: `Sessions/chyunes_mbys.md` defines tune, chart, and set structure. The fallback jam markdown files are used only to rescue overlapping titles when the canonical file names a tune without fenced chart content.
- **Fallback precedence**: The importer checks `chyunes_mbys.md`, then `2026-01_first_friday_jam.md`, then `2025-12_first_friday_jam.md`.
- **Generated fixture store instead of runtime file reads**: The app keeps using a checked-in `release1FixtureStore` so static export, tests, and seeding stay simple and deterministic.
- **`[drop]` handling**: The schema has no dedicated drop field, so surviving `[drop]` groups preserve that signal in set summaries. The private St. Paddy's Day gig excludes drop-marked source groups based on the checked-in metadata contract.
- **Title-only source entries**: Tunes with no recoverable chart content are excluded from the imported catalog, removed from their set entries, and listed in checked-in import metadata. Entirely empty groups do not become sets.
- **Alias collision policy**: Alternate names from fallback sources are only imported if they do not collide with another tune under the existing `normalizeSearchTerm()` contract. Collisions fail the import instead of silently picking a winner.

### Integration Points

- `src/lib/release-1/repository.ts` now shares `normalizeSearchTerm()` with the importer so alias behavior matches repository lookup behavior exactly.
- `scripts/generate-release-1-data.ts` is the regeneration entry point for source-driven catalog updates.
- `src/lib/db/seed.ts` and `scripts/db-setup.ts` are unchanged in shape; they still seed Postgres from `release1FixtureStore`.
- `README.md` and the route copy for tunes, sets, gigs, and the home page were updated so the project now describes imported data rather than demo fixtures.

## User Guide

### Prerequisites

- Run from the repository root or the issue worktree root.
- Install dependencies with `npm ci` or `npm install`.
- Make sure the checked-in `Sessions/*` assets and `src/data/release-1/import-metadata.ts` reflect the desired source state before regenerating the catalog.

### Basic Usage

1. Update the checked-in source files under `Sessions/` as needed.
2. If the St. Paddy's Day selection rule or expected exclusions change, update `src/data/release-1/import-metadata.ts`.
3. Regenerate the imported fixture store:

   ```bash
   npm run generate:release-1-data
   ```

4. Verify the catalog:

   ```bash
   npm run lint
   npm run test
   npm run typecheck
   npm run build
   ```

5. If `DATABASE_URL` is configured, run `npm run db:setup` or `npm run build` to seed Postgres with the generated catalog.

### Advanced Usage

- **Adding a new fallback rescue**: If a canonical tune title still lacks chart content, add the overlapping chart to one of the fallback markdown files instead of hand-editing the generated fixture store.
- **Changing exclusion behavior**: The importer will fail if the actual excluded-title set drifts from `expectedExcludedSourceTitles`. Update the source files and metadata together so the exclusion manifest stays deliberate.
- **Changing gig selection**: The St. Paddy's Day gig currently reuses non-drop public source groups in source order. If the gig source contract changes, update `stPaddysDayGigMetadata` rather than special-casing the generated fixture store.

## API Reference

### Key Components

- **`buildRelease1Import()`** (`src/lib/release-1/import-source.ts`)
  - Reads the checked-in `Sessions/*` assets
  - Normalizes tunes, charts, sets, aliases, and the private gig
  - Returns a validated `Release1Store` plus the computed excluded-title list

- **`src/data/release-1/import-metadata.ts`**
  - Records the St. Paddy's Day gig selection rule
  - Records the expected excluded-title manifest
  - Acts as the checked-in contract for source omissions and private gig derivation

- **`npm run generate:release-1-data`**
  - Rebuilds `src/data/release-1/fixture-store.ts`
  - Should be rerun whenever checked-in source assets or import metadata change

### Configuration Options

- **Fallback source order** is hard-coded in `buildRelease1Import()` as canonical `chyunes` -> 2026 jam -> 2025 jam.
- **Gig selection behavior** is controlled by `stPaddysDayGigMetadata.includeDropMarkedSourceGroups`.
- **Excluded title manifest** is controlled by `expectedExcludedSourceTitles` and validated during import generation.

## Testing

### How to Test

- Automated:
  - `npm run generate:release-1-data`
  - `npm run lint`
  - `npm run test`
  - `npm run typecheck`
  - `npm run build`

- Manual:
  - Load `/tunes` and confirm the page shows real imported tune names and chord content.
  - Load `/sets` and confirm the ordered set names come from the imported source groups.
  - Load `/gigs/st-paddys-day` and confirm the private gig references imported public sets in the expected order.

### Edge Cases

- **Mixed section headings**: `STRATHSPEYS → REELS` requires explicit tune-type inference so later tunes in that section do not all inherit `Strathspey`.
- **Word-boundary tune-type inference**: Title matching uses word-level checks so titles like `Tabhair Dom Do Lámh` do not get misclassified as an air just because they contain the letters `air`.
- **Title-only tunes**: `Kitty Lie Over`, `Up in the Air`, `The Rolling Waves`, `The Highlander's Farewell to Ireland`, `Farewell to Erin`, `Put Me in the Big Chest`, and `Josefin's Waltz` remain excluded until recoverable chart content exists in the checked-in source chain.
- **Alias recovery**: The generated catalog currently picks up alternate names such as `Swinging on a Gate` and `Green Mountain` from fallback sources without widening lookup collisions.

## Limitations and Future Work

- The import path is still an offline regeneration workflow, not a runtime content-management pipeline.
- The private gig source still depends on checked-in derived metadata because the canonical gig source is a PDF, and normal builds intentionally avoid PDF tooling.
- The generated `fixture-store.ts` must be regenerated when source assets or metadata change.
- Titles that still lack recoverable chart content remain out of the imported catalog until the source material is expanded.
