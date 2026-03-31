# Developing

## Prerequisites

- **Node.js** 22.14.0 (see `.node-version` / `engines` in `package.json`)
- **npm** 10.x (bundled with Node 22)
- **Python 3** – only needed for PDF rendering (`pip install -r requirements-pdf.txt`)

## Setup

```sh
npm install          # install dependencies and set up git hooks
```

The `npm install` step automatically configures [Husky](https://typicode.github.io/husky/) pre-commit hooks via the `prepare` script. Staged files are auto-formatted with Prettier on every commit, so CI formatting checks should never fail.

## Scripts

| Command                            | What it does                                              |
| ---------------------------------- | --------------------------------------------------------- |
| `npm run dev`                      | Start the Next.js dev server                              |
| `npm run build`                    | Production build (runs `db:setup` first)                  |
| `npm run typecheck`                | Type-check with `tsc --noEmit`                            |
| `npm run lint`                     | ESLint with zero warnings allowed                         |
| `npm run format`                   | Format everything with Prettier                           |
| `npm run format:check`             | Check formatting without writing (used in CI)             |
| `npm run test`                     | Run Vitest tests                                          |
| `npm run generate:session-content` | Canonicalize `Sessions/*_session_work.md` into `content/` |
| `npm run render:session-pdf`       | Render a session work doc to PDF (requires Python)        |

## Formatting & Linting

The project uses **Prettier** for formatting and **ESLint** for linting.

- **Pre-commit hook** – [lint-staged](https://github.com/lint-staged/lint-staged) runs Prettier on staged files automatically. You generally don't need to think about formatting.
- **Manual formatting** – run `npm run format` to format the entire repo.
- **CI** – runs `format:check`, `lint`, `typecheck`, and `test`. If pre-commit hooks are active, formatting should always pass.

## Testing

```sh
npm run test         # run all tests once
npx vitest           # run in watch mode
```

Tests live next to the code they test (`*.test.ts`). The test suite uses [Vitest](https://vitest.dev/).

## Database

The app reads from Postgres when `DATABASE_URL` is set, otherwise falls back to fixture data. For local development without a database, just run `npm run dev` — fixtures are used automatically.

To use a local Postgres instance:

```sh
export DATABASE_URL="postgresql://user:pass@localhost:5432/sessionbook"
npm run build        # seeds the database via db:setup
```

## PDF Rendering

Session PDFs require a Python environment:

```sh
python3 -m pip install -r requirements-pdf.txt
npm run render:session-pdf -- Sessions/my_session_work.md
```

Output goes to `out/session-pdfs/` by default. See `--help` for flags like `--include-alternates`, `--include-notes`, and `--print-large`.
