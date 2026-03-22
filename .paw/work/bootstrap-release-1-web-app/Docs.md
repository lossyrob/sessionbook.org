# Bootstrap Release 1 Web App Docs

## Summary

Issue `#2` establishes the first real application baseline for SessionBook. The
repo now uses a Next.js App Router scaffold at the repository root instead of a
hand-authored static `public/index.html` landing page.

The bootstrap intentionally keeps the runtime static for now:

- `next build` runs with `output: 'export'`
- Firebase Hosting deploys the generated `out/` directory
- GitHub Actions build before deploy for preview, staging, and production

This gives later Release 1 issues a stable route structure, shared shell, and
tooling contract without prematurely committing to Cloud Run runtime behavior.

## Tooling Decisions

- **Node.js**: pinned with `.nvmrc` at `22.14.0`
- **Package manager**: `npm` with a committed `package-lock.json`
- **Framework**: Next.js `16.2.1` with React `19.2.4`
- **Type checking**: `tsc --noEmit`
- **Linting**: ESLint flat config using `eslint-config-next/core-web-vitals`
- **Tests**: Vitest smoke tests around shared route metadata

## App Structure

- **`src/app/`**: top-level routes, layout, global styles, and placeholder pages
- **`src/components/`**: shared shell, cards, and placeholder-page building blocks
- **`src/lib/site-navigation.ts`**: central route metadata for the Release 1 bootstrap surfaces

Bootstrap routes reserved for later feature work:

- `/tunes`
- `/sets`
- `/search`
- `/login`
- `/gigs/st-paddys-day`

## Deployment Contract

- `firebase.json` now points both hosting targets at `out/`
- `public/` is no longer the deploy root; it is reserved for normal Next.js
  static assets
- GitHub workflow steps now follow the same contract as local development:
  `npm ci` → `npm run build` → Firebase deploy

## Known Constraints

- No API routes, middleware, or server-only Next.js features while static export
  is the deploy mode
- No real auth, seeded content, or private-content enforcement yet
- Placeholder routes exist to stabilize information architecture, not to deliver
  finished user-facing functionality

## Verification

Run from the repository root:

```bash
npm run lint
npm run test
npm run typecheck
npm run build
```
