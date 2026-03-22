# SessionBook

**[sessionbook.org](https://sessionbook.org)** — a home for Irish trad chord charts.

Browse tunes, author charts, organize them into sets, assemble gig sheets, and
print them in a format that actually works on a music stand.

Like [thesession.org](https://thesession.org), but for accompaniment rather
than melody.

## What It Does

SessionBook is a library and workflow tool for chordal accompanists in Irish
traditional music — guitarists, bouzouki players, piano players, and anyone who
needs clean chord charts for sessions and gigs.

**Core ideas:**

- **Charts** are the product — human-readable, hand-editable, and shareable
  chord charts backed by a structured AST with deterministic markdown
  serialization.
- **Sets** are first-class — an ordered group of tunes with pinned chart
  revisions, not just a playlist. Pairing tunes is creative work.
- **Print is primary** — if it doesn't read well on paper or an iPad on a
  stand, it fails the product test.
- **Revisions are pinned** — a gig sheet never silently changes because a base
  chart was edited later.

## Core Concepts

| Concept | Description |
|---------|-------------|
| **Tune** | A tune identity: name, aliases, type, external references |
| **Chart** | A chord chart for a tune in a given key/mode, by a given author |
| **ChartRevision** | An immutable snapshot of a chart |
| **Set** | An ordered group of tunes with chosen chart revisions |
| **Session / Gig Sheet** | An ordered list of sets prepared for a specific event — the printable "book" |
| **SessionChart** | Gig-specific overrides (repeats, cues, transitions) layered on a pinned chart revision |

## Tech Stack

| Layer | Choice |
|-------|--------|
| Frontend | Next.js / React |
| Database | Neon Postgres |
| Hosting | Firebase Hosting → Google Cloud Run |
| PDF Generation | Python renderer in a separate Cloud Run service |
| DNS / Domain | Cloudflare Registrar + DNS |
| CI/CD | GitHub Actions with Google Workload Identity Federation |
| File Storage | Google Cloud Storage (future) |

## Project Status

Early development — building the foundation for a personal chart library and
workflow tool, with a path toward a community library of additive chart
"settings" for accompanists.

## Planning Documents

- [`docs/planning/sessionbook-product.md`](docs/planning/sessionbook-product.md) — product vision, core concepts, feature roadmap, and design principles
- [`docs/planning/sessionbook-tech-stack.md`](docs/planning/sessionbook-tech-stack.md) — hosting, infrastructure, and deployment research

## License

All rights reserved.
