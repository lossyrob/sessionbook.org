# Work Shaping

## Problem Statement

Public sets are already visible in the catalog index at `/sets`, but they stop at the browse surface. Visitors cannot open a dedicated set page, and set entries cannot link to tune pages because public tune detail routes do not exist yet. The work should close that gap without expanding into unrelated catalog features.

## Core Value

- Make sets feel like first-class public catalog objects instead of index-only summaries.
- Give visitors stable URLs for sets they can browse and share.
- Preserve navigability between the two core catalog concepts: tunes and sets.

## Scope

### In Scope

- Add public set detail pages at `/sets/[slug]`.
- Add the minimum public tune detail pages needed at `/tunes/[slug]`.
- Link set entries to tune detail pages.
- Link tune pages and tune list surfaces back to set pages where appropriate.
- Reuse the Release 1 repository layer and existing public styling patterns.
- Return `404` for unknown or non-public slugs.

### Out of Scope

- Admin or editing workflows.
- Search implementation.
- New content types or schema changes.
- Redesigning the catalog shell or homepage.

## Work Breakdown

1. Extend repository view models and lookup methods so public set and tune records can be fetched by slug and rendered with linkable metadata.
2. Implement the public set detail route with ordered entries and tune links.
3. Implement the public tune detail route with chart metadata and links back to containing sets.
4. Update existing catalog components so tune/set references point to the new detail pages.
5. Verify public-only visibility, 404 behavior, and static generation compatibility.

## Edge Cases

- Sets may omit short notes/summary; the page should render cleanly without a summary block.
- Tunes may appear in multiple sets; tune pages should list all public set memberships without duplication.
- A tune might not belong to any public set; the tune page should still be valid.
- Hidden or missing records must not produce public pages or cross-links.
- Slug collisions are already handled in the repository store; new routes should rely on repository lookups instead of rebuilding slug logic.

## Rough Architecture

- `src/lib/release-1/repository.ts`
  - Add public lookup methods by slug for tunes and sets.
  - Extend set entry and tune membership view models to carry slugs needed for links.
- `src/app/sets/[slug]/page.tsx`
  - Load the repository, fetch a public set by slug, and render an ordered tune list.
- `src/app/tunes/[slug]/page.tsx`
  - Load the repository, fetch a public tune by slug, and render tune metadata plus set memberships.
- Existing public components
  - Reuse list/table patterns and wire set/tune links instead of duplicating presentation logic.

## Critical Analysis

Issue `#8` is no longer accurate as written because the public sets index already exists. The smallest coherent scope is not just “add set pages,” because set pages would otherwise link to nowhere. Adding minimal tune detail pages keeps the catalog navigable without broadening into a larger content redesign.

## Codebase Fit

- Reuse the Release 1 repository as the single source of public catalog data.
- Follow the existing browse-page styling from `/sets` and `/tunes`.
- Follow the existing not-found route pattern already used by the public gig page.

## Risks

- Repository type changes could ripple into existing list surfaces if the view model updates are not carefully additive.
- It is easy to accidentally expose non-public data if lookups bypass existing visibility filters.
- Tune/set linking can become inconsistent if one surface is updated without the others.

## Open Questions

- None blocking after the user-approved scope amendment. The implementation should stay minimal and reuse current catalog presentation patterns.

## Session Notes

- The user requested a PAW Lite flow in a dedicated worktree, with autonomous execution through final PR unless a serious blocker appears.
- The user approved the amended scope: individual set pages, minimal tune pages, and bidirectional tune/set navigation.
