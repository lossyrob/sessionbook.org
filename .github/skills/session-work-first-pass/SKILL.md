---
name: session-work-first-pass
description: Draft first-pass chord charts into SessionBook session work documents (`Sessions/*_session_work.md`) using session order plus web research, then regenerate canonical `content/tunes`, `content/sets`, and `content/sessions`. Use when Claude needs to initialize or enrich a playable first-pass session chart from a leader list, preserve set adjacency, add published tune/set/session notes, or repeat this workflow for a new session.
---

# Session Work First Pass

## Overview

Use this skill to turn a single SessionBook session work document into a
playable first pass without breaking the local-first flow.

The primary editing surface is always `Sessions/*_session_work.md`. Do not start
by hand-editing `content/`; that is generated output.

## Workflow

1. Read the target session work doc and `references/work-doc-format.md`.
2. Read `references/research-playbook.md` before researching or editing charts.
3. Work in the session's running order, set by set, not alphabetically.
4. Research both tunes in a set together.
5. Fill or refine the fenced chart blocks directly in the work doc.
6. Add published notes with `>`, `>>`, and `>>>`, record tune resources with
   `=>` link lines, and use `= version:`, `= part:`, and `= alt:` when a tune
   needs multiple chart versions or alternate passes.
7. Use `%%` only for author-only scratch comments.
8. Run `npm run generate:session-content` after edits to regenerate canonical
    content.
9. Hand off to `session-work-pdf` if the user wants a printable rehearsal PDF.
10. Run verification before finishing.

## Editing Rules

- Keep paired tunes adjacent and easy to practice together.
- Prefer a simple playable first pass over a speculative dense chart.
- Record tune resources in `=>` link lines and uncertainty in notes so the user
  can review them later. If a recording or source implies a materially different
  chart, give it its own `= version:` block instead of hiding it in prose.
- Preserve human-editable markdown. Avoid adding metadata-heavy scaffolding to
  the work doc.
- If a tune is too uncertain, leave a minimal chart and say so in notes rather
  than inventing detail.

## Output Expectations

- Edit the session work doc in place.
- Do not manually edit `content/`; regenerate it.
- Leave the work doc better for rehearsal: session order intact, set flow intact,
  charts visible inline, notes readable inline.

## References

- Read `references/work-doc-format.md` before parsing or editing a session work
  doc.
- Read `references/research-playbook.md` before web research or when deciding how
  to record provenance and uncertainty.
