# Bootstrap Release 1 Web App Implementation Plan

## Overview

Bootstrap the Release 1 application as a minimal Next.js + TypeScript static-export app at the repository root so the project has a real local development workflow without breaking the existing Firebase preview, staging, and production deployment paths.

This plan intentionally treats issue `#2` as a bootstrap issue, not a full runtime migration. The current repo already has Firebase Hosting targets and GitHub deploy workflows, so the plan focuses on replacing the hand-authored static landing page with an app scaffold that can be built into `out/` and deployed by the existing Firebase pipeline.

## Current State Analysis

- The repository currently deploys a static `public/` directory through Firebase Hosting.
- There is no Node application scaffold, package manager lockfile, linting setup, test runner, or local app workflow.
- Firebase preview, staging, and production workflows already exist and should keep working after the bootstrap.
- Product planning points toward `Next.js / React` for the web app and a future `Firebase Hosting -> Cloud Run` front-door/runtime split.
- Release 1 still has later issues for data modeling, import, search, auth, and private gig pages, so this issue should establish structure and tooling rather than solve those product areas now.

## Desired End State

- The repo contains a minimal Next.js App Router application with TypeScript, shared layout primitives, and placeholder routes for the main Release 1 surfaces.
- The repo pins a single Node.js version for local development and CI so the bootstrap behaves consistently for contributors and GitHub Actions.
- Contributors can run a documented local workflow with `npm install`, `npm run dev`, `npm run lint`, `npm run test`, `npm run typecheck`, and `npm run build`.
- The build outputs a static `out/` directory so Firebase Hosting preview/staging/prod deployments continue to work with the new app.
- GitHub Actions use `actions/setup-node`, `npm ci`, and an explicit `npm run build` step before each Firebase deploy instead of relying on Firebase action auto-build behavior or deploying raw source files.
- Repo docs and env guidance describe the bootstrap workflow clearly enough for a new contributor to get running.

## What We're NOT Doing

- Migrating the site to Cloud Run or adding Firebase Hosting rewrites to a server runtime.
- Provisioning Neon, introducing a backend API, or defining the catalog schema.
- Implementing real authentication, protected data loading, or private-content enforcement.
- Building the final public information architecture, tune/search/set experience, or import pipeline.
- Adding PDF generation, markdown export, or other later Release 1 feature work.

## Phase Status

- [x] **Phase 1: Scaffold the app shell** - Create the Next.js baseline, shared layout, and placeholder routes that later Release 1 issues can extend.
- [x] **Phase 2: Wire build and deploy tooling** - Add scripts, ignore rules, Firebase output configuration, and GitHub Actions build steps for the new app.
- [x] **Phase 3: Document and verify the bootstrap** - Capture the as-built notes, update contributor docs, and verify the new baseline end to end.

## Phase Candidates

<!-- No additional phase candidates at this time. -->

---

## Phase 1: Scaffold the app shell

### Changes Required:

- **`package.json` / `package-lock.json` / `.nvmrc`**: Introduce the Node/Next toolchain, scripts, package manager baseline, and a pinned Node.js version contract for local and CI use.
- **`tsconfig.json`, `next.config.*`, `next-env.d.ts`, ESLint config, test config`**: Establish TypeScript, linting, test runner integration, and an explicit static-export build contract (`output: 'export'`) that emits `out/`.
- **`src/app/**`**: Create the App Router layout, homepage, 404 handling, shared styles, and placeholder routes for `/tunes`, `/sets`, `/search`, `/login`, and `/gigs/st-paddys-day`.
- **`src/components/**` and `src/lib/**`**: Add reusable navigation/layout primitives and route metadata that future issues can build on.
- **`public/**`**: Convert the directory from deployed HTML pages into normal Next.js static assets usage, removing obsolete hand-authored landing-page files that would otherwise confuse the new build.
- **Tests**: Add at least one Vitest-based smoke test around shared route/navigation behavior so the baseline has a real `npm test` contract.

### Success Criteria:

#### Automated Verification:

- [ ] Tests pass: `npm run test`
- [ ] Lint and type checks pass: `npm run lint && npm run typecheck`
- [ ] Static build succeeds: `npm run build`

#### Manual Verification:

- [ ] `npm run dev` starts successfully on a fresh clone after dependency install.
- [ ] The homepage renders from the Next.js app rather than the old static HTML file.
- [ ] Placeholder routes for the main Release 1 surfaces are reachable and visually coherent enough to serve as future implementation targets.

---

## Phase 2: Wire build and deploy tooling

### Changes Required:

- **`.gitignore`**: Ignore `node_modules`, `.next`, `out`, coverage, and other local/tool outputs while keeping committed app sources visible.
- **`firebase.json`**: Change both Hosting targets from source `public/` deployment to generated `out/` deployment, while leaving the repository `public/` directory available for Next.js static assets.
- **`.github/workflows/firebase-hosting-pull-request.yml`**: Add `actions/setup-node`, `npm ci`, and explicit build steps before preview deploys; keep the Firebase action limited to deploying the already-built `out/` directory.
- **`.github/workflows/firebase-hosting-merge.yml`**: Add `actions/setup-node`, `npm ci`, and explicit build steps before staging live deploys; keep the Firebase action limited to deploying the already-built `out/` directory.
- **`.github/workflows/firebase-hosting-release-tag.yml`**: Add `actions/setup-node`, `npm ci`, and explicit build steps before production tag deploys; keep the Firebase action limited to deploying the already-built `out/` directory.
- **`.env.template`**: Clarify any app-local environment expectations needed by the scaffold, including the `NEXT_PUBLIC_` naming convention for any future browser-exposed variables.

### Success Criteria:

#### Automated Verification:

- [ ] Static build emits deployable output: `npm run build`
- [ ] Workflow build steps are aligned with repo scripts: `npm run lint && npm run test && npm run build`

#### Manual Verification:

- [ ] The Firebase configuration clearly points at generated build output instead of source HTML.
- [ ] Each GitHub workflow uses the same build contract a local developer uses.
- [ ] The bootstrap does not require ad hoc manual edits before the next preview deploy can succeed.

---

## Phase 3: Document and verify the bootstrap

### Changes Required:

- **`.paw/work/bootstrap-release-1-web-app/Docs.md`**: Record the as-built bootstrap decisions, scope boundaries, verification commands, and the known constraints of static-export mode.
- **`README.md`**: Add local setup, available commands, Node version expectations, and how the Next.js build fits the existing Firebase preview/staging/prod flow.
- **Project docs/config comments**: Tighten any wording in `.env.template` or related files so new contributors understand what they do and do not need yet.

### Success Criteria:

#### Automated Verification:

- [ ] Final validation passes: `npm run lint && npm run test && npm run typecheck && npm run build`

#### Manual Verification:

- [ ] A new contributor could follow the README and get the app running locally without repo-specific tribal knowledge.
- [ ] The docs make it clear that this issue establishes the app baseline but does not yet implement auth, data, import features, or server-only Next.js capabilities.
- [ ] The resulting branch is ready for review as the foundation for later Release 1 issues.

---

## References

- Issue: `https://github.com/lossyrob/sessionbook.org/issues/2`
- Product planning: `docs/planning/sessionbook-product.md`
- Stack planning: `docs/planning/sessionbook-tech-stack.md`
- Code research: `.paw/work/bootstrap-release-1-web-app/CodeResearch.md`
- Release milestone context used for validation: local planning notes and prior session context
