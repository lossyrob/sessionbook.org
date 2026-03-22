# SessionBook Release 1 Milestone Spec

## Proposed milestone name

**Release 1: Public Catalog + Private Gig Sheets**

## Summary

The first release should make SessionBook feel like a real public website, even
if the library is still small. A visitor who lands on the site should be able
to understand what SessionBook is, browse a small set of tunes and sets, search
for content, and click through to individual tune pages that show actual chord
charts.

At the same time, the release should support the beginning of the private
working-musician workflow by allowing the site owner to sign in and view
private gig/session sheets.

This release is intentionally **not** about community features or in-app
authoring. It is about publishing the existing chart library in a way that
makes sense to anonymous visitors while preserving privacy for owner-only gig
materials.

## Product goal

Ship a coherent public-facing catalog of existing SessionBook content with a
minimal owner-only auth layer for private gig sheets.

## Users in scope

### Anonymous visitor

Someone who discovers `sessionbook.org` and wants to understand what the site
is, browse tunes, inspect sets, and read chord charts.

### Owner/admin

You, as the initial curator and sole authenticated user. You can view private
gig/session sheets, but content creation and editing do not need to happen in
the app yet.

## Core release decisions

- The public site should be understandable to a stranger.
- Tunes, charts, and sets in this release are public.
- Gig/session sheets can be private.
- Auth is included in the first release, but only for a single owner/admin.
- Existing content can be seeded/imported manually.
- In-app editing is out of scope.

## In-scope functionality

### 1. Public front page

The home page should explain what SessionBook is and give a visitor clear paths
into the catalog.

Minimum expectations:

- short explanation of the site
- visible navigation to browse/search content
- a simple introduction to tunes, sets, and charts
- enough context that the site does not feel like an internal tool

### 2. Public search

Visitors should be able to search the available catalog and find relevant
content quickly.

Minimum expectations:

- search by tune name
- search by tune aliases
- search results that link directly to tune pages

Release 1 boundary:

- sets should be browseable, but they do not need to appear in search yet

### 3. Public tune pages

Tune pages are the heart of this release. They are the main way current chord
charts become shareable on the public web.

Minimum expectations:

- tune name and aliases
- one public chart displayed clearly on the page
- relevant metadata that helps a musician understand the chart
- links to any public sets that include the tune

Release 1 assumption:

- seeded content will contain one chart per tune

### 4. Public set pages

Sets should be visible as first-class objects, not buried implementation
details.

Minimum expectations:

- set title
- ordered tune list
- links from each tune in the set to its tune page
- optional short notes if useful

### 5. Private gig/session sheets

The first release should support at least one real owner-only gig sheet: the
St. Paddy's Day gig.

Minimum expectations:

- a private session/gig page exists in the app
- the owner can sign in and view it
- anonymous visitors cannot view it
- the page can reference the sets and tunes used for that gig

### 6. Owner-only auth

Auth should be intentionally narrow.

Minimum expectations:

- one owner/admin can sign in
- signed-in state is only required for private gig/session access
- anonymous visitors can use the public site without friction

Implementation note:

- the exact provider can be chosen later; the product requirement is
  owner-only authentication, not multi-user account management

### 7. Manual content seeding/import

This release should prioritize publishing existing content over building content
management tooling.

Minimum expectations:

- current chord charts can be loaded into the app
- current public sets can be loaded into the app
- the St. Paddy's Day gig sheet can be loaded as private content

### 8. Markdown export

This release should support export of the chart markdown/source format, even
though print workflows stay outside the web app for now.

Minimum expectations:

- chart content can be exported as markdown
- the exported markdown is suitable for the existing local script workflow
- no in-app print or PDF generation UI is required in Release 1

## Content and visibility model for this release

### Public

- tunes
- charts attached to those tunes
- sets

### Private

- session/gig sheets

### Deferred

- per-chart privacy
- per-set privacy
- collaborative ownership
- public/private controls for every content type

## Out of scope

These are important later, but should not block Release 1:

- in-app chart editing
- in-app set editing
- in-app gig/session editing
- self-service user registration
- public multi-user accounts
- community contributions and chart forking
- revision history UI
- in-app PDF export and print-first layout work
- advanced filtering, tagging, and recommendation features

## Success criteria

Release 1 is successful if all of the following are true:

- a first-time visitor can understand what SessionBook is from the home page
- a visitor can search for a tune and reach its chart page
- a visitor can browse at least a small set of public tunes and sets
- tune pages and set pages link together in a way that feels coherent
- the owner can sign in and access the private St. Paddy's Day gig sheet
- anonymous visitors are blocked from private gig/session content
- the site feels like a small but intentional public catalog, not a half-exposed
  internal tool

## Suggested implementation shape

This is not yet the issue list, but the milestone naturally breaks into these
work areas:

1. Public catalog information architecture
2. Content model and seed/import path
3. Public tune and set pages
4. Public search
5. Owner-only auth
6. Private gig/session page access

## Resolved Release 1 decisions

- Search covers tunes only; sets are browseable but not searchable yet.
- Seeded Release 1 content has one chart per tune.
- Markdown export is in scope.
- Print and PDF workflows remain local for now via the existing script.

## Known source assets

These source assets were identified by the user as the current seed-data and
conversion inputs for Release 1 work:

### Chord chart library

- `Sessions/chyunes_mbys.md` — main chord chart file with 42 tunes, grouped
  into sets, with `[drop]` markers and annotations
- `Sessions/2026-01_first_friday_jam.md` — original template/source charts
- `Sessions/2025-12_first_friday_jam.md` — additional reusable charts

### Canonical PDF renderer and format docs

- `.github/skills/chord-charts/scripts/generate_chord_pdf.py` — actively
  maintained renderer with compact two-column mode, `--print-large`
  single-column mode, `--preview`, `[drop]`, annotations, and Monaco font
- `.github/skills/chord-charts/SKILL.md` — chart markdown format and renderer
  usage documentation

Note: these assets were provided as source references during planning and may
need to be brought into or linked from this repository before implementation.
