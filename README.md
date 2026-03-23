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
| CI/CD | GitHub Actions with Google and Firebase deploy actions |
| File Storage | Google Cloud Storage (future) |

## Project Status

Early development — the repo now includes a Next.js app, local tooling,
Firebase Hosting + Cloud Run deployment hooks, a validated Release 1 schema,
and the first runtime-backed public catalog for the homepage plus the tune/set
indexes. The checked-in Release 1 catalog is imported from the canonical
`Sessions/*` source assets; tune detail pages, auth enforcement, and richer
search/private behavior still land in later issues.

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
Release 1 schema and seeds it from the checked-in imported store. Without
`DATABASE_URL`, the app can still fall back to the same imported catalog through
the fixture-backed repository path for local UI work. When `DATABASE_URL` is
configured, the public homepage and browse indexes expect to load the Release 1
catalog from Postgres instead of silently falling back to fixtures.

### Available Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start the local Next.js development server |
| `npm run db:setup` | Create migrations and seed the Release 1 catalog into Postgres when `DATABASE_URL` is set |
| `npm run generate:release-1-data` | Rebuild the checked-in Release 1 fixture store from the canonical `Sessions/*` source assets |
| `npm run lint` | Run the flat ESLint config used in CI |
| `npm run test` | Run the Vitest smoke tests |
| `npm run typecheck` | Run `tsc --noEmit` |
| `npm run build` | Build the Next.js runtime app (including the standalone Cloud Run bundle) |

## Current Runtime Notes

- The public homepage, `/tunes`, and `/sets` are request-time rendered routes
  on the app runtime, so deployed environments are expected to read from
  Postgres when `DATABASE_URL` is configured.
- The Release 1 repository still uses the checked-in fixture store for local
  work when `DATABASE_URL` is absent.
- The checked-in Release 1 fixture store is generated from the canonical
  `Sessions/*` source assets rather than hand-authored demo data.
- Firebase Hosting is the front door, but the public app now runs behind
  Hosting rewrites to Cloud Run.
- The first runtime rollout keeps Next.js app assets on the Cloud Run side of
  the Hosting rewrite instead of splitting asset serving between Hosting and the
  runtime.
- The repository `public/` directory is reserved for standard Next.js static
  assets, not hand-authored deploy pages.

## Deployment Workflow

Firebase Hosting is configured with separate `staging` and `prod` targets in
the `sessionbook-491003` project.

- Pull requests build the app, deploy a no-traffic revision of
  `sessionbook-web-staging`, then deploy a Firebase Hosting preview channel on
  the staging site pinned to that Cloud Run revision.
- Pushes to `main` run `npm run db:setup`, deploy `sessionbook-web-staging`, and
  then deploy the live staging Hosting target pinned to that revision.
- Tags matching `v*` run `npm run db:setup`, deploy `sessionbook-web-prod`, and
  then deploy the live production Hosting target pinned to that revision.
- Each workflow uses `.nvmrc`, runs `npm ci`, executes
  `npm run lint && npm run test && npm run typecheck && npm run build`, and
  then publishes the Hosting config after the Cloud Run deploy step.
- Preview and staging runtime deploys use `DATABASE_URL_STAGING`; production tag
  deploys use `DATABASE_URL_PROD`.

Current Hosting sites:

- Production: `sessionbook-491003` → `sessionbook.org`
- Staging: `sessionbook-491003-staging` → `staging.sessionbook.org`

## Planning Documents

- [`docs/planning/sessionbook-product.md`](docs/planning/sessionbook-product.md) — product vision, core concepts, feature roadmap, and design principles
- [`docs/planning/sessionbook-tech-stack.md`](docs/planning/sessionbook-tech-stack.md) — hosting, infrastructure, and deployment research

## License

[MIT](LICENSE)
