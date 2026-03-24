# Code Research

## Scope Validation

The original issue text was stale relative to the codebase. The public catalog already exposed browse pages for tunes and sets on the homepage and via dedicated routes, so the real gap was individual detail pages and coherent tune/set linking rather than initial set visibility.

- Homepage public catalog cards: `src/app/page.tsx:56-71`
- Tunes browse page: `src/app/tunes/page.tsx:8-35`
- Sets browse page: `src/app/sets/page.tsx:7-73`
- Homepage section-card rendering and optional roadmap label: `src/components/section-card.tsx:9-23`

## Existing Public Catalog Surfaces

- The home page renders public catalog sections from `publicSections`, which now describe the live tune and set catalog surfaces and only show roadmap labels when a `nextIssue` value is present (`src/app/page.tsx:56-71`, `src/components/section-card.tsx:9-23`, `src/lib/site-navigation.ts:10-37`).
- The tunes browse page remains a server component that loads the repository and renders `TuneList` (`src/app/tunes/page.tsx:8-35`).
- The sets browse page remains a server component that loads the repository and renders ordered set entries (`src/app/sets/page.tsx:7-73`).

## Repository and Data Model

- `Release1Repository` is the central public data boundary. It now exposes catalog summary, list views, slug lookups for tunes and sets, alias lookup, and private gig-sheet lookup (`src/lib/release-1/repository.ts:73-81`).
- `PublicTuneView` carries both backward-compatible `setNames` and link-ready `setMemberships`, while `PublicSetView` entries carry `tuneSlug` for detail-route navigation (`src/lib/release-1/repository.ts:21-56`).
- Repository construction validates aliases, charts, sets, and gig-sheet references before building public views, so downstream helpers can assume chart/tune integrity (`src/lib/release-1/repository.ts:129-235`, `src/lib/release-1/repository.ts:317-446`).
- Tune-to-set memberships are derived from ordered set records in `createSetMembershipsByTune`, and public slug maps are built once for constant-time lookup in `getPublicTuneBySlug()` / `getPublicSetBySlug()` (`src/lib/release-1/repository.ts:267-314`, `src/lib/release-1/repository.ts:343-410`).

## UI and Routing Patterns

- Catalog pages follow a consistent server-component pattern: `export const dynamic = "force-dynamic"`, load the repository, and render a small top-level page component (`src/app/tunes/page.tsx:1-38`, `src/app/sets/page.tsx:1-73`).
- Missing-record handling for route pages uses `notFound()` after repository lookup; the existing gig page established that pattern (`src/app/gigs/st-paddys-day/page.tsx:1-30`).
- The tune browse surface is intentionally interactive: `TuneList` owns row expansion state, toggles charts on row click, and uses `stopPropagation()` on inline links so navigation does not also toggle the row (`src/components/tune-list.tsx:13-89`).

## Testing and Verification

- The repository defines the canonical local verification commands as npm scripts: `lint`, `test`, `typecheck`, and `build` (`package.json:9-18`).
- Existing repository tests already cover fixture invariants and slug/alias behavior, making `src/lib/release-1/repository.test.ts` the right place to extend coverage for public slug lookups and cross-link metadata.

## Documentation System

- `.paw/work/public-set-pages/WorkShaping.md` is the scoped requirements record for this PAW Lite run.
- `.paw/work/public-set-pages/ImplementationPlan.md` is the execution plan and completion record.
- `.paw/work/public-set-pages/Docs.md` is the as-built technical reference for the finished feature.

This workflow did not create separate `Spec.md` or `SpecResearch.md` artifacts; the shaped scope and implementation plan were the operative planning documents for this custom run.

## Open Questions

None. The remaining follow-up is product/roadmap copy polish around how homepage cards should advertise future work after an issue lands, which is explicitly captured as a completed candidate resolution in the plan rather than as an open research question.
