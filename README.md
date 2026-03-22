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
tooling, and Firebase deployment hooks for the first Release 1 implementation
work. The real catalog, auth, import, and private gig behavior still lands in
later issues.

## Local Development

Use the pinned Node.js version from `.nvmrc` before installing dependencies:

```bash
nvm use
npm install
npm run dev
```

The app runs at `http://localhost:3000`.

If you need local project or deploy configuration, copy `.env.template` to
`.env`. The current bootstrap app does not require any additional runtime
variables yet.

### Available Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start the local Next.js development server |
| `npm run lint` | Run the flat ESLint config used in CI |
| `npm run test` | Run the Vitest smoke tests |
| `npm run typecheck` | Run `tsc --noEmit` |
| `npm run build` | Build the static export deployed by Firebase Hosting |

## Current Bootstrap Constraints

- The app currently builds in Next.js static-export mode, so it does **not**
  support API routes, middleware, or other server-only Next.js features yet.
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
- Each workflow uses `.nvmrc`, runs `npm ci`, builds the app with
  `npm run build`, and then deploys the generated `out/` directory.

Current Hosting sites:

- Production: `sessionbook-491003` → `sessionbook.org`
- Staging: `sessionbook-491003-staging` → `staging.sessionbook.org`

## Planning Documents

- [`docs/planning/sessionbook-product.md`](docs/planning/sessionbook-product.md) — product vision, core concepts, feature roadmap, and design principles
- [`docs/planning/sessionbook-tech-stack.md`](docs/planning/sessionbook-tech-stack.md) — hosting, infrastructure, and deployment research

## License

[MIT](LICENSE)
