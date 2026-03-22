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

Early development — the repo now includes a Next.js app scaffold, local
tooling, Firebase deployment hooks, a validated Release 1 schema, and the first
real Postgres-backed persistence path for tunes, charts, public sets, and
private gig sheets. Real external seed import, auth enforcement, and richer
catalog/search behavior still land in later issues.

## Local Development

Use the pinned Node.js version from `.nvmrc` before installing dependencies:

```bash
nvm use
npm install
npm run db:setup
npm run dev
```

The app runs at `http://localhost:3000`.

If you need local project or deploy configuration, copy `.env.template` to
`.env`. When `DATABASE_URL` is configured, `npm run db:setup` creates the
Release 1 schema and seeds it from the checked-in fixture store. Without
`DATABASE_URL`, the app can still fall back to the fixture-backed repository for
local UI work.

### Available Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start the local Next.js development server |
| `npm run db:setup` | Create migrations and seed the Release 1 catalog into Postgres when `DATABASE_URL` is set |
| `npm run lint` | Run the flat ESLint config used in CI |
| `npm run test` | Run the Vitest smoke tests |
| `npm run typecheck` | Run `tsc --noEmit` |
| `npm run build` | Seed Postgres when configured, then build the static export deployed by Firebase Hosting |

## Current Bootstrap Constraints

- The app currently builds in Next.js static-export mode, so it does **not**
  support API routes, middleware, or other server-only Next.js features yet.
- The Release 1 repository prefers Postgres when `DATABASE_URL` is configured
  and seeded, but it still falls back to the checked-in fixture store when no
  database is available.
- Real external chart/set/gig import is still deferred to the later import
  issue.
- Firebase Hosting now deploys the generated `out/` directory, not source files.
- The repository `public/` directory is reserved for standard Next.js static
  assets, not hand-authored deploy pages.

## Deployment Workflow

Firebase Hosting is configured with separate `staging` and `prod` targets in
the `sessionbook-491003` project.

- Pull requests deploy to a Firebase Hosting preview channel on the staging
  site.
- Pushes to `main` deploy the live staging site.
- Tags matching `v*` deploy the live production site.
- Each workflow uses `.nvmrc`, runs `npm ci`, executes
  `npm run lint && npm run test && npm run typecheck && npm run build`, and
  then deploys the generated `out/` directory.
- Preview and staging builds can use `DATABASE_URL_STAGING`; production tag
  builds can use `DATABASE_URL_PROD`.

Current Hosting sites:

- Production: `sessionbook-491003` → `sessionbook.org`
- Staging: `sessionbook-491003-staging` → `staging.sessionbook.org`

## Planning Documents

- [`docs/planning/sessionbook-product.md`](docs/planning/sessionbook-product.md) — product vision, core concepts, feature roadmap, and design principles
- [`docs/planning/sessionbook-tech-stack.md`](docs/planning/sessionbook-tech-stack.md) — hosting, infrastructure, and deployment research

## License

[MIT](LICENSE)
