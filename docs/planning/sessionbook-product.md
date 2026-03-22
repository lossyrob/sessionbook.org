# Session Chords — Product One-Pager

## Vision

`sessionbook.org` is a home for Irish trad chord charts: browse tunes,
author charts, organize them into sets, assemble gig/session sheets, and print
them in a format that actually works on a music stand.

The product starts as a personal library and workflow tool, then grows into a
community library of additive chart "settings" for accompanists.

Core idea: **like thesession.org, but for accompaniment rather than melody.**


## Product Thesis

Three things make this product different:

- The **chart format itself** is useful, portable, human-editable, and worth
  sharing independently of the site.
- **Sets and session sheets** are first-class objects, not just playlists. The
  creative value is not only in individual tune charts, but in how tunes are
  paired and prepared for actual gigs.
- **Print is a primary output**, not an afterthought. If it does not read well
  on paper or an iPad on a stand, it fails the product test.


## Who It Is For

- You, as a working accompanist building and refining your own chart library
- Guitarists, bouzouki players, piano players, and other chordal accompanists
- Session leaders who want to share organized, printable gig sheets
- Eventually, a community of players contributing alternate settings, keys,
  and set ideas


## Core Concepts

### Tune

A tune identity: name, aliases, tune type, optional regional/style tags, and
external references.

A Tune may have:
- many names / aliases
- many Charts
- many external references (thesession.org, YouTube, melody PDFs, recordings)

Important note: external IDs such as thesession.org tune IDs are **references**,
not the product's primary identity. Tune identity in trad music is messy:
aliases, regional variants, and related tunes should not be forced into a
single external system.


### Chart

A logical chord chart for a Tune, in a given key / mode, by a given author.
A Tune can have many Charts:

- different keys
- different harmonic approaches
- different authors
- different instrument/tuning approaches

Charts are **additive, not editorial**. Other users do not wiki-edit your
chart. They create a new chart or fork your chart into their own setting.

Chart metadata should include:
- tune
- key / mode
- time signature
- beats per bar / grid resolution
- author / owner
- visibility: `private`, `unlisted`, `public`
- status: `draft`, `rehearsal`, `gig-tested`
- instrument / tuning tags (`guitar`, `DADGAD`, `bouzouki`, `capo 2`, etc.)
- provenance ("learned from X recording/session")


### ChartRevision

An immutable revision of a Chart.

This is important enough to be part of the data model from day one, even if
the first UI for it is light. Revisions solve a major real-world problem:
**a gig sheet should not silently change because a base chart got edited later**.

Sessions and Sets should pin specific revisions, not just logical chart IDs.


### Chart Format

The chart format is a product artifact, not just an internal storage detail.

Requirements:
- writable by hand
- readable in raw form
- translatable to a clean printed layout
- easy to extend
- backward-compatible when notation grows

The key design decision:

- **In-app canonical model:** structured AST / JSON document
- **Portable serialized form:** deterministic markdown export/import

That avoids the biggest gotcha in rich chart editors: fragile round-tripping
between a visual grid editor and freeform markdown. Markdown remains first-class
and editable, but the app does not rely on regex-level parsing as the source of
truth.


### Set

An ordered group of tunes played together, with a specific Chart (really:
ChartRevision) chosen for each tune.

Sets are first-class because pairing tunes is creative and valuable in itself.
A good set is a reusable musical object, not just a temporary list.

Set entries should pin:
- Tune
- chosen ChartRevision
- order
- optional set-level notes or transitions


### SetRevision

An immutable revision / snapshot of a Set.

This lets a Session/Gig reference a stable arrangement of tunes even if the
base Set is later edited.


### Session / Gig Sheet

A Session is an ordered list of Sets prepared for a specific event: a rehearsal,
pub session, or gig.

This is the printable "book" or run sheet.

Implementation note: the UI can use the trad-native word **Session**, but the
internal model may want a name like `GigSheet` or `RunSheet` to avoid confusion
with web/app sessions.


### SessionChart

A thin gig-specific override layer applied to a pinned ChartRevision inside a
Session.

This is where performance-specific changes live:
- extra repeats / altered form (`AABB -> AAABB`)
- cue notes ("watch for nod", "fiddle starts")
- tempo / feel notes
- transition instructions between tunes

The base harmony stays in the Chart. The performance form lives here.

That separation keeps the core library clean while still letting you prepare
for specific gigs.


## What Success Looks Like

In under a minute, a player can:

1. search for or create a tune chart
2. drop it into a set
3. assemble a session/gig sheet from sets
4. print a readable PDF that works on a stand
5. share a link with other players


## Product Surface

## v1 — Foundation / Personal Workflow

### Tune Library

- browse tunes by name, alias, type, key/mode
- full-text search over names and aliases
- tune page shows charts, references, linked sets, and external tune links


### Chart Authoring

- visual grid editor for bars / beats / parts
- raw markdown editor with sync to the structured chart model
- time signature and beats-per-bar controls
- annotations before/after lines
- import of existing markdown charts


### Set Builder

- create a Set from selected tunes + chosen chart revisions
- drag-and-drop ordering
- preview as printed


### Session / Gig Sheet Builder

- create a Session from Sets
- drag-and-drop ordering of Sets
- print/export PDF
- compact and large-print modes
- shareable view URL


### References

- link a Tune to thesession.org
- attach external recordings / YouTube / Spotify / audio references
- attach or link melody PDFs

For v1, external linking is safer than trying to host large libraries of
melody PDFs.


### Visibility

- private
- unlisted
- public

This is important even for solo use, because you will want to share some things
with other musicians before everything is "publish to the world" ready.


### Print & Export

- PDF generation using the current renderer
- compact two-column mode
- single-column large-print mode
- print-friendly browser fallback
- support notation features like `[drop]`


## v1.5 — Power-User Workflow

### Revisions & History

- visible ChartRevision history
- visible SetRevision history
- basic diff view
- pinning and repinning revisions in Sessions


### Session-Specific Overrides

- SessionChart editor
- override form / repeats / gig notes without changing the base chart


### Clone & Reuse

- clone chart
- clone set
- clone session


### Metadata Upgrades

- chart status (`draft`, `rehearsal`, `gig-tested`)
- instrument / tuning / capo tags
- provenance notes
- per-user default chart for a tune


### Transposition

- transpose charts into a new key
- optionally annotate capo

This is useful, but should not be treated as trivial. It needs the structured
chart AST to be reliable.


## v2 — Community Layer

### Accounts & Ownership

- user accounts / profiles
- authored charts
- public chart pages


### Additive Contributions

- submit new charts for existing tunes
- fork someone else's chart into a new setting
- no silent overwriting of another author's work


### Discovery

- sets containing this tune
- commonly paired tunes
- tune relationship graph
- regional/style tags

This is one of the most interesting long-term differentiators: the product can
learn from real set-building behavior in a way melody archives do not.


### Stage & Mobile

- iPad-optimized chart view
- dark / high-contrast mode
- set-to-set navigation during gigs
- long-term: page turn or pedal support


## Tech Direction

### Frontend

- Next.js / React
- custom chart editor component
- strong emphasis on printable layouts and iPad readability


### Backend / Database

- PostgreSQL is a better default than SQLite for the hosted product because
  revisions, relationships, ownership, search, and future community features
  will benefit from it
- SQLite is still fine for local development or a solo prototype


### Chart Data Model

- canonical in-app representation: AST / structured JSON
- deterministic markdown serialization for portability
- store original user-entered markdown/source as well where useful

This is the main technical design constraint. If you want both a rich editor
and hand-editable text, you need reliable round-tripping and test coverage for
that boundary.


### PDF Generation

- server-side renderer wrapping the existing Python PDF engine is a good v1 move
- prefer a small containerized worker/service over fragile serverless glue if
  PDF generation is business-critical
- client-side rendering can come later if it proves valuable

This is one of the biggest implementation gotchas: Python PDF tooling and
serverless hosting are often an awkward fit.


### File Storage

- object storage for uploads / assets (R2, S3, etc.)
- melody PDFs, images, and audio references should not live directly in the DB


### Search

- Postgres full-text search is enough for v1
- search names, aliases, chart metadata, set names, and provenance notes


### Auth

- no auth required for initial single-user workflow
- but ownership should still exist in the schema from day one
- later: OAuth (GitHub / Google)


## Risks / Gotchas

### 1. Round-Trip Editing

Rich editor + markdown editor is the hardest part of the product.
If the app cannot round-trip charts losslessly, users will stop trusting it.

Mitigation:
- AST model
- deterministic serializer
- parser/formatter fixture tests
- preserve unknown syntax as opaque nodes rather than dropping it


### 2. Transposition Complexity

Transposition is not just string replacement.

Problems include:
- slash chords
- modal tunes
- capo-aware display
- chord-like text inside annotations
- preserving preferred spellings

Mitigation:
- chord tokens are parsed nodes, not free text


### 3. Tune Identity

Trad tune identity is fuzzy.

Problems include:
- aliases
- regional variants
- related but distinct settings
- external archives disagreeing on naming

Mitigation:
- separate internal tune identity from external references
- support aliases and related-tune links explicitly


### 4. Copyright / Melody PDFs

Hosting melody PDFs may create copyright issues depending on source.

Mitigation:
- start with external links
- host only user-uploaded/public-domain/permitted files
- keep melody references separate from the core chord-chart product


### 5. PDF Infrastructure

If printing is central, PDF generation is infrastructure, not a side feature.

Mitigation:
- treat renderer as a tested subsystem
- consider snapshot/fixture tests for visual output
- avoid platform choices that make PDF generation brittle


## Design Principles

1. **The chart format is the product.** It must remain simple, writable,
   readable, and extensible.
2. **Print is first-class.** If it is not comfortable on paper or an iPad
   stand, it is not done.
3. **Start personal, grow social.** Every workflow should work well for one
   musician before adding community complexity.
4. **Additive, not editorial.** Fork, don't overwrite.
5. **Reproducibility matters.** Sessions and gigs must pin revisions.
6. **Portability matters.** No lock-in; charts should always export cleanly.
7. **Tunes are atoms, sets are molecules.** The set/session layer is where a
   lot of the creative value lives.

