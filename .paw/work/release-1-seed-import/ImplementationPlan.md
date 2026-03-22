# Release 1 Seed Import Implementation Plan

## Overview

Replace the demo Release 1 fixture catalog with a reproducible imported catalog built from checked-in `Sessions` source assets. Keep the current `Release1Store` boundary, Postgres seeding path, and repository loading flow intact so the app continues to work in both fixture and database-backed modes.

## Current State Analysis

The repo already has a validated `Release1Store` schema, repository invariant checks, and a Postgres seeding path wired to `src/data/release-1/fixture-store.ts`. What is missing is the import layer that converts real SessionBook source material into that store. The canonical public source is `chyunes_mbys.md`; the secondary jam markdown files can backfill overlapping tunes only through the explicit fallback chain `chyunes` -> `2026-01_first_friday_jam.md` -> `2025-12_first_friday_jam.md`. The private St. Paddy's Day gig currently appears to exist only as a PDF, so the implementation needs a deterministic checked-in derived metadata representation rather than a brittle runtime dependency.

## Desired End State

The repository contains checked-in Release 1 source assets plus importer logic that normalizes those assets into a valid `Release1Store`. The checked-in fixture store is replaced with imported real content, `db:setup` continues to seed Postgres from that store, and automated tests pin both the normalization rules and the resulting catalog shape. The app renders real public tunes/sets and a private `st-paddys-day` gig sheet without changing the existing repository-loading architecture. Critical importer rules are decided up front: deterministic slug generation, explicit fallback precedence, a documented exclusion path for unrecoverable title-only tunes, and a summary-based preservation rule for `[drop]`-marked groups that survive import.

## What We're NOT Doing

- Runtime markdown or PDF ingestion in the web app
- Release 1 schema changes for tune placeholders with no chart
- A generalized PDF parsing subsystem beyond what issue `#4` needs
- Auth, live runtime data loading, or chart revision work from later issues

## Phase Status
- [x] **Phase 1: Source intake and normalization** - Bring the canonical SessionBook source assets into the repo and build the normalization layer that can turn them into import-ready records.
- [x] **Phase 2: Imported store integration** - Materialize the normalized data as the Release 1 fixture store and keep seeding/repository loading aligned with the existing contract.
- [x] **Phase 3: Verification and catalog hardening** - Add focused tests around parser behavior, imported catalog shape, and the private gig mapping.
- [x] **Phase 4: Documentation** - Record the as-built import path and update project docs where the old fixture-only story is no longer accurate.

## Phase Candidates

---

## Phase 1: Source intake and normalization

### Changes Required:
- **`Sessions/chyunes_mbys.md`**, **`Sessions/2026-01_first_friday_jam.md`**, **`Sessions/2025-12_first_friday_jam.md`**: Checked-in canonical and fallback source inputs copied from the user-provided source directory.
- **`Sessions/StPaddyDayJam-2026-chords.pdf`** and a small checked-in derived gig metadata representation: Reproducible private gig source inputs, with the importer consuming the derived metadata during normal builds.
- **`src/data/release-1/import-metadata.ts`** (new metadata artifact): Carry the checked-in derived gig mapping and the exact list of excluded source titles so the import path documents omissions deterministically.
- **`src/lib/release-1/import/`** (new importer modules): Parse the canonical source structure, normalize tune identity and aliases against the existing `normalizeSearchTerm()` contract, derive deterministic tune/chart/set IDs including the set collision fallback, infer tune types/meters from section families, preserve `[drop]` via set summary conventions, detect alias collisions before emitting the store, and apply the fallback chart recovery chain from the secondary markdown files.
- **Tests**: Add parser-level tests under `src/lib/release-1/` for source grouping, `[drop]` summary mapping, duplicate normalization, fallback precedence, slug derivation, alias-collision failure behavior, excluded-title manifest contents, and title-only tune exclusion/removal from sets.

### Success Criteria:

#### Automated Verification:
- [ ] Tests pass: `npm run test`
- [ ] Lint/typecheck: `npm run lint && npm run typecheck`

#### Manual Verification:
- [ ] The importer uses `---` as the public set grouping boundary and preserves a preceding `[drop]` marker in the imported set summary when that group survives import.
- [ ] Title-only source entries with no recoverable chart are either backfilled via the documented fallback chain or excluded together with their set entries, with fully empty groups omitted from the imported set list.

---

## Phase 2: Imported store integration

### Changes Required:
- **`src/data/release-1/fixture-store.ts`**: Replace the demo catalog with imported Release 1 data generated from the new normalization layer.
- **`src/lib/db/seed.ts`**: Keep the seed path consuming the imported fixture store without changing the database contract.
- **`scripts/db-setup.ts`**: Update only if needed to support a deterministic import-generation step while preserving current behavior.
- **`src/lib/release-1/load-repository.ts`** and related repository consumers: Touch only if the integration needs small adjustments to support the imported fixture shape.
- **`src/lib/db/release-1-store.test.ts`** and **`src/lib/release-1/repository.test.ts`**: Update the existing shape/count assertions in the same phase as the fixture replacement so the integration phase can still end green.

### Success Criteria:

#### Automated Verification:
- [ ] Tests pass: `npm run test`
- [ ] Build succeeds: `npm run build`

#### Manual Verification:
- [ ] The imported fixture store contains real public tunes and sets instead of the current demo catalog.
- [ ] The private `st-paddys-day` gig sheet resolves to real imported public sets without breaking repository invariants.

---

## Phase 3: Verification and catalog hardening

### Changes Required:
- **Additional importer tests**: Add regression tests for representative tricky cases from the source files, such as `Willie Coleman's`, mixed `STRATHSPEYS → REELS` tune typing, `[drop]`-marked groups, and duplicate naming variants.
- **Derived gig metadata verification**: Add focused checks that the `st-paddys-day` gig mapping resolves to imported public sets deterministically.

### Success Criteria:

#### Automated Verification:
- [ ] Tests pass: `npm run test`
- [ ] Lint/typecheck/build pass: `npm run lint && npm run typecheck && npm run build`

#### Manual Verification:
- [ ] The imported catalog is obviously sourced from the real SessionBook materials when inspecting tune, set, and gig pages locally or in generated data.
- [ ] Failure cases are explicit: missing chart content or ambiguous source mappings fail tests or importer validation rather than silently producing bad data.

---

## Phase 4: Documentation

### Changes Required:
- **`.paw/work/release-1-seed-import/Docs.md`**: Technical reference describing the source assets, importer architecture, normalization rules, and verification commands.
- **`README.md`**: Update the Release 1 status and local-development notes so they no longer describe the catalog as fixture-only once real imported data lands.

### Success Criteria:
- [ ] Docs build/verification commands are recorded and executed alongside `npm run lint && npm run test && npm run typecheck && npm run build`
- [ ] Documentation accurately describes the checked-in source assets, importer flow, and current limitations such as title-only tunes without recoverable charts

---

## References
- Issue: `https://github.com/lossyrob/sessionbook.org/issues/4`
- Spec: `.paw/work/release-1-seed-import/Spec.md`
- Research: `.paw/work/release-1-seed-import/CodeResearch.md`, `.paw/work/release-1-seed-import/WorkShaping.md`
