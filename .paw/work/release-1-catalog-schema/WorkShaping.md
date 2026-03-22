# Work Shaping — Release 1 Catalog Schema

## Problem

Issue `#3` needs the first concrete Release 1 storage contract for the catalog and
private gig-sheet content. The merged app scaffold now exists on `main`, but it
still runs in static-export mode and has no data layer.

The issue has been updated to clarify that real seed-data ingestion belongs to
issue `#4`, so this work should define and prove the schema/persistence layer
without importing the external `Sessions/*.md` assets yet.

## Validated scope

### In scope

- Define the persisted shapes for:
  - tunes
  - tune aliases
  - one chart per tune for the Release 1 seeded-content assumption
  - public sets
  - private gig/session sheets
- Capture the public/private content split in the schema.
- Choose the first working storage approach and wire it into the app.
- Add tests that exercise the persistence layer without requiring the real seed
  files to be present.

### Out of scope

- Importing or parsing the real external `Sessions/*.md` assets
- Search UX and ranking behavior
- Authentication or authorization enforcement
- Hosting/runtime migration to live database access or API routes
- Full chart authoring, revisions, or PDF rendering

## Chosen storage approach

Use a checked-in, fixture-backed persistence layer validated at runtime.

That means:

- a typed domain schema for Release 1 records using `zod` runtime validation
- a small checked-in fixture dataset in TypeScript modules imported at build time
- repository/query helpers that expose the data to the app
- data-backed app surfaces that prove the contract during static build and test

This is the best fit for the current repo because it:

- satisfies the issue requirement to establish a concrete persistence layer
- keeps the app compatible with static export
- avoids prematurely coupling this issue to Neon/API/runtime decisions
- creates a stable target for issue `#4` to import real external data into later

### Explicit storage decisions

- **Visibility enum:** model `public | unlisted | private` now, even though issue
  `#3` fixtures only need `public` and `private`. That avoids a later visibility
  migration when `unlisted` becomes active.
- **ID strategy:** use stable kebab-case string IDs plus slugs for URL-facing
  records. Fixtures may keep them equal initially, but the schema keeps both so
  future imports do not force URL changes.
- **Cardinality:** keep charts as their own collection keyed to tunes, while the
  Release 1 fixture data enforces one chart per tune. That preserves the later
  multi-chart path without a schema rewrite.
- **Load mechanism:** import the fixture-backed store from TypeScript modules at
  build time; no `fs` reads, API routes, or request-time I/O.
- **Issue #4 seam:** the repository API will remain stable while issue `#4`
  replaces the hand-authored fixture module with parser-produced data of the same
  shape.

## Intended implementation shape

1. Add validated schema definitions and derived view models.
2. Add a fixture-backed repository adapter for public tunes/sets and private gig
   sheets.
3. Update only the home page, tune index, set index, and existing private gig
   route to consume the repository; leave search/auth/dynamic detail routes to
   later issues.
4. Keep the login route as a scaffold, and keep the gig route focused on proving
   the private-content contract rather than pretending auth is complete.
5. Add tests for schema validation, visibility rules, repository behavior, and
   rejection of malformed fixture data.

## Risks and mitigations

- **Risk:** The work could drift into seed-import logic.
  - **Mitigation:** Keep fixture data hand-authored and explicitly separate from
    any `Sessions/*.md` parsing.

- **Risk:** The work could drift into runtime/database plumbing.
  - **Mitigation:** Preserve static export and keep persistence build-time/local
    for this issue.

- **Risk:** Private gig content could be treated as fully protected before auth
  exists.
  - **Mitigation:** Model privacy in the schema and repository now, but leave
    access control enforcement to the later auth issue.

- **Risk:** Future import work could require schema churn.
  - **Mitigation:** Define the fixture module as the exact repository input
    contract that issue `#4` must produce, rather than introducing a temporary
    fixture-only shape.

## Acceptance mapping

- **Concrete schema/persistence layer:** delivered by the validated domain schema
  plus repository adapter.
- **Supports Release 1 seeded-content assumptions:** delivered by one-chart-per-
  tune and alias-aware fixture records shaped for later import.
- **Private gig/session records distinguished from public catalog content:**
  delivered by explicit visibility/content-type rules in schema and repository.
- **Can be exercised without real seed files:** delivered by tests and app wiring
  over checked-in fixture content.
