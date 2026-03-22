# Bootstrap Release 1 Web App Code Research

## Existing Repository State Before Issue #2

- The repository deployed a hand-authored static `public/` directory through
  Firebase Hosting for both `staging` and `prod`.
- There was no Node.js application scaffold, no package manifest, no local app
  workflow, and no automated lint/test/typecheck contract.
- Firebase Hosting preview, staging, and production workflows already existed
  and were the main integration surface that this issue needed to preserve.

## Relevant Existing Files and Patterns

- **`firebase.json`** — multi-target Firebase Hosting config for `staging` and
  `prod`
- **`.github/workflows/firebase-hosting-*.yml`** — deploy workflows generated
  from Firebase CLI setup
- **`.env.template`** — checked-in deployment/environment template per user
  preference
- **`README.md`** — primary contributor-facing documentation in the repo root
- **`docs/planning/sessionbook-product.md`** — product direction pointing to
  `Next.js / React`
- **`docs/planning/sessionbook-tech-stack.md`** — stack direction pointing to
  Firebase Hosting as the front door with a future Cloud Run runtime behind it

## Constraints That Shaped the Bootstrap

- The bootstrap needed to fit the already-live Firebase preview/staging/prod
  flow instead of replacing it.
- The issue was validated against the current repo state and treated as a
  scaffold issue, not a full runtime migration.
- The resulting app needed to be static-exportable so Firebase Hosting could
  keep serving built output immediately.

## Documentation System

- **Project docs**: `README.md` and `.env.template`
- **Planning artifacts**: `.paw/work/bootstrap-release-1-web-app/Plan.md` and
  `ImplementationPlan.md`
- **As-built notes**: `.paw/work/bootstrap-release-1-web-app/Docs.md`

## Notable Validation Findings

- Next.js static export required Firebase Hosting to deploy `out/` rather than
  the old source `public/` directory.
- Firebase Hosting also needed `cleanUrls: true` on both targets so exported
  routes like `/tunes` resolve correctly in the Hosting emulator.
- The deploy workflows now run the same quality gate as local development:
  `npm run lint`, `npm run test`, `npm run typecheck`, and `npm run build`.
