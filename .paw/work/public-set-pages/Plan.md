# Public Set Pages Implementation Plan

## Overview

Implement public tune and set detail routes on top of the existing browse indexes so sets become shareable, linkable catalog objects and tune/set navigation feels coherent. The work stays within the Release 1 public catalog and reuses the existing repository layer, page structure, and styling patterns.

## Current State Analysis

- `/tunes` and `/sets` already render live public browse indexes.
- `src/lib/release-1/repository.ts` already builds slug maps for tunes and sets, but it only exposes list views plus alias lookup and private gig lookup.
- `PublicSetView` entries expose tune names and chart metadata, but not tune slugs for linking.
- `PublicTuneView` exposes set names only, so tune-facing surfaces cannot link back to set detail pages.
- `src/components/tune-list.tsx` duplicates the public tune shape locally and treats the entire row as a click target, so linked navigation has to coexist carefully with chart expansion.
- No public detail routes exist under `src/app/tunes/[slug]/` or `src/app/sets/[slug]/`.
- The Release 1 milestone already expects tune pages and set pages to link together coherently.

## Desired End State

- A public set detail page exists at `/sets/[slug]` with title, optional summary, ordered tune entries, and links to public tune pages.
- A public tune detail page exists at `/tunes/[slug]` with title, aliases, chart metadata, always-visible chart content, and links to containing public sets.
- Existing `/sets` and `/tunes` browse surfaces link into the new detail routes without losing current browse behavior.
- Detail pages expose route-level metadata so tune and set URLs are meaningfully shareable in tabs and previews.
- Repository APIs expose public-by-slug lookups and link-ready view data without bypassing visibility constraints.
- Verification covers tests, lint, typecheck, build, and manual route checks for linked navigation and 404 behavior.

## What We're NOT Doing

- Search changes or result ranking work
- Seed/schema/import format changes
- Auth, private gig-sheet access, or owner workflows
- Editing, export, PDF, or print workflows
- Broad homepage or navigation redesign outside the minimum detail-page integration needed here

## Phase Status

- [x] **Phase 1: Repository contracts** - Add public slug lookups and linkable view data while preserving current browse surfaces.
- [x] **Phase 2: Public detail routes** - Render `/sets/[slug]` and `/tunes/[slug]` and wire existing public surfaces to them.
- [x] **Phase 3: Documentation** - Capture the as-built behavior and finish full verification.

## Phase Candidates

- [x] Remove stale homepage `nextIssue` roadmap labels from the live Tunes and Sets cards.

---

## Phase 1: Repository contracts

### Changes Required:

- **`src/lib/release-1/repository.ts`**: add public set/tune lookup methods by slug; retain the existing `setNames` field long enough to keep current consumers stable while adding link-ready tune slugs and `setMemberships` data for the new routes.
- **`src/lib/release-1/repository.test.ts`**: add assertions for slug lookups, ordered detail data, and cross-link-ready membership fields.
- **Tests**: keep repository contract coverage as the primary automated safety net for the new public data shape.

### Success Criteria:

#### Automated Verification:

- [ ] Tests pass: `npm run test`
- [ ] Types remain sound: `npm run typecheck`

#### Manual Verification:

- [ ] A sample public set can be resolved by slug with ordered entries and tune slugs present.
- [ ] A sample public tune can be resolved by slug with public set memberships that include set slugs.

---

## Phase 2: Public detail routes

### Changes Required:

- **`src/app/sets/[slug]/page.tsx`**: render the public set detail page, load by slug, export route metadata, follow the existing dynamic-page convention, and return `notFound()` for unknown sets.
- **`src/app/tunes/[slug]/page.tsx`**: render the public tune detail page with aliases, chart metadata, always-visible chart content, containing-set links, route metadata, and a context-specific back link.
- **`src/app/sets/page.tsx`**: link browse-index set names and tune entries into the new detail routes.
- **`src/components/tune-list.tsx`**: align its local/public tune typing, link tune names and set memberships, and prevent link clicks from accidentally toggling the expandable chart row.
- **`src/app/globals.css`**: add or refine only the styles needed for detail-page layout, inline catalog links, and always-visible chart presentation on tune detail pages.
- **Tests**: extend existing unit coverage if any navigation metadata contracts change.

### Success Criteria:

#### Automated Verification:

- [ ] Lint passes: `npm run lint`
- [ ] Tests pass: `npm run test`
- [ ] Types remain sound: `npm run typecheck`
- [ ] Static build succeeds: `npm run build`

#### Manual Verification:

- [ ] Opening a set from `/sets` lands on a detail page with ordered tune links.
- [ ] Opening a tune from a set lands on a tune page with chart content and set backlinks.
- [ ] Unknown `/sets/[slug]` and `/tunes/[slug]` routes render the existing not-found experience.
- [ ] Clicking linked tune or set names inside `/tunes` does not also toggle the expandable chart row.
- [ ] The `/tunes` browse page still expands charts on row click while exposing detail-page links.
- [ ] Detail page titles reflect the current tune or set instead of a generic browser-tab title.

---

## Phase 3: Documentation

### Changes Required:

- **`.paw/work/public-set-pages/Docs.md`**: capture the implemented public route behavior, repository contract changes, and verification performed.
- **Project docs**: no README or milestone-doc update is planned unless implementation reveals user-facing documentation drift that should be corrected in the same change.

### Success Criteria:

#### Automated Verification:

- [ ] Final verification passes: `npm run lint`
- [ ] Final verification passes: `npm run test`
- [ ] Final verification passes: `npm run typecheck`
- [ ] Final verification passes: `npm run build`

#### Manual Verification:

- [ ] Docs match the implemented route behavior and verification steps.
- [ ] Scope boundaries remain intact with no unrelated catalog changes.

---

## References

- Issue: `https://github.com/lossyrob/sessionbook.org/issues/8`
- Work shaping: `.paw/work/public-set-pages/WorkShaping.md`
- Milestone guidance: `docs/planning/sessionbook-release-1-milestone.md`
