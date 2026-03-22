# Plan — Release 1 Catalog Schema

## Goal

Implement issue `#3` by adding a concrete, validated Release 1 schema and a
fixture-backed persistence layer that the current static-export app can consume,
without importing the real external source assets yet.

## Phase Status

- [x] Phase 1 - Define the Release 1 storage contract
- [x] Phase 2 - Build repository/query helpers
- [x] Phase 3 - Wire the persistence layer into app surfaces
- [x] Phase 4 - Document and verify

## Plan

### Phase 1 — Define the Release 1 storage contract

- Add a runtime-validated schema module for:
  - tunes
  - aliases
  - charts
  - sets
  - private gig sheets
- Use `zod` for runtime validation.
- Define the field-level Release 1 contract explicitly:
  - `ContentVisibility`: `public | unlisted | private`
  - `TuneRecord`: `id`, `slug`, `name`, `tuneType`, `summary`
  - `TuneAliasRecord`: `id`, `tuneId`, `name`, `normalizedName`
  - `ChartRecord`: `id`, `slug`, `tuneId`, `title`, `key`, `mode`, `meter`, `contentMarkdown`, `visibility`
  - `SetRecord`: `id`, `slug`, `name`, `summary`, `visibility`, `entries[]`
  - `SetEntryRecord`: `position`, `tuneId`, `chartId`
  - `GigSheetRecord`: `id`, `slug`, `name`, `summary`, `visibility`, `entries[]`
  - `GigSheetEntryRecord`: `position`, `setId`, `transitionNotes`
- Encode the Release 1 assumptions explicitly:
  - fixtures will use `public` for tunes/charts/sets and `private` for gig sheets
  - the schema keeps charts separate from tunes, but the fixtures enforce one
    chart per tune for Release 1 seeded content
  - sets point to chart IDs directly; chart/set revision models and SessionChart
    overrides are deferred from this issue
- Add a small fixture dataset under `src/data/release-1/` that conforms to the
  new schema and is clearly separate from the real external import inputs.
- Use stable kebab-case string IDs and explicit slugs so later imports can keep
  stable identifiers independent of display labels.

### Phase 2 — Build repository/query helpers

- Add a repository layer that loads and validates the fixture-backed data from
  TypeScript modules at build time; no `fs` reads or request-time I/O.
- Expose query helpers for:
  - listing public tunes
  - listing public sets
  - resolving tune aliases
  - reading private gig-sheet records
  - summarizing counts/relationships for the home page
- Define the issue `#4` handoff contract explicitly: importer work must produce
  the same validated record shapes consumed by this repository so the app-facing
  query API stays unchanged.
- Add unit tests for:
  - successful validation of the checked-in fixture store
  - rejection of malformed fixture data
  - public/private visibility filtering
  - one-chart-per-tune fixture invariant
  - preservation of set and gig entry ordering
  - alias lookup behavior

### Phase 3 — Wire the persistence layer into app surfaces

- Update the home page to reflect that the app now has a concrete catalog
  storage contract.
- Replace only the tune and set placeholders with minimal data-backed index
  views sourced from the repository.
- Update the existing `/gigs/st-paddys-day` route to prove the private content
  model without pretending auth is already enforced.
- Leave `/search`, `/login`, and any dynamic detail routes to later issues; do
  not add `/tunes/[slug]` or `/sets/[slug]` in this issue.

### Phase 4 — Document and verify

- Update README language where it still implies the catalog is entirely
  placeholder-only.
- Run `npm run lint`, `npm run test`, `npm run typecheck`, and `npm run build`.
- Prepare for planning review, then implement/fix any material findings.

## Success criteria

- The repo contains a clear Release 1 schema/persistence contract for the issue
  scope.
- The app consumes that layer during static build.
- Tests prove the public/private split and seed-shape assumptions without using
  the real external seed files.

## What we are not doing

- Parsing or importing the real external `Sessions/*.md` sources
- Switching the app away from static export
- Adding API routes, live database access, or Neon integration
- Implementing auth enforcement
- Adding dynamic tune/set detail routes
- Implementing chart/set revision history or SessionChart overrides
