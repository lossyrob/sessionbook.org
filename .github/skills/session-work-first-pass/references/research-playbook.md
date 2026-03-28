# Research Playbook

## Goal

Fill first-pass chord charts into `Sessions/*_session_work.md` so the document is
playable and easy to edit while practicing, not final or authoritative.

## Order of work

Always work in session order:

1. Read the current `Sessions/*_session_work.md`
2. Work set by set, keeping paired tunes together
3. Only jump to alphabetical tune browsing if you need prior art

## Source preference

1. Existing repo sources first:
   - `Sessions/chyunes_mbys.md`
   - `Sessions/2026-01_first_friday_jam.md`
   - `Sessions/2025-12_first_friday_jam.md`
2. Web sources second:
   - chord charts
   - accompanist notes
   - tune database pages
   - recordings and session references

## Drafting rules

- Prefer a simple playable first pass over a dense or speculative chart
- Match the key from the session work doc when possible
- Keep bar lines readable and musician-friendly
- If sources disagree, choose the simplest reasonable version and record the
  disagreement in notes
- It is acceptable to leave a chart partial if the uncertainty is real

## How to record provenance

Record tune resources with `=>` links, keep uncertainty / musical caveats in
published tune notes, and split materially different charts into separate
versions:

```markdown
=> https://example.com/chart
=> https://thesession.org/tunes/43#setting55355
> Needs review: source disagrees on the B part turnaround

= version: Recording variant
=> https://open.spotify.com/track/example
= part: A
```
| G / / / |
```

= alt: A | third pass
```
| Em / / / |
```
```

Use `%%` only for temporary scratch notes that should not survive.

## Update flow

1. Edit the target `Sessions/*_session_work.md`
2. Run `npm run generate:session-content`
3. If needed, inspect `/preview/tunes`, `/preview/sets`, and `/preview/sessions`
4. Run verification:

```bash
./node_modules/.bin/vitest run src/lib/session-work/workflow.test.ts src/lib/content/load-corpus.test.ts src/lib/content/repository.test.ts
npm run lint
npm run typecheck
npm run build
```

Run full `npm run test` when you want the broader repo check.
