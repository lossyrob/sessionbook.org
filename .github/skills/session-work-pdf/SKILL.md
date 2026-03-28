---
name: session-work-pdf
description: Render SessionBook session work documents (`Sessions/*_session_work.md`) to printable PDF using the repo-owned renderer and print model. Use when Claude needs to generate or re-render a rehearsal PDF, include alternate parts with a flag, or troubleshoot PDF output from the SessionBook session workflow.
---

# Session Work PDF

Render a printable PDF from a checked-in SessionBook session work doc without
leaving the local-first workflow. Use the repo command here instead of the older
external chord-chart workflow.

## Workflow

1. Work from a target `Sessions/*_session_work.md` file.
2. If the file was edited recently or PDF rendering fails, validate it first
   with `npm run generate:session-content`. Fix malformed `= part:` / `= alt:`
   markers or fenced chart blocks before retrying.
3. Ensure the Python dependency is available:

   ```bash
   python3 -m pip install -r requirements-pdf.txt
   ```

4. Render the default PDF:

   ```bash
   npm run render:session-pdf -- Sessions/<name>_session_work.md
   ```

5. Add flags only when asked:
   - `--include-alternates` to include `= alt:` parts
   - `--print-large` for a single-column large-print layout
   - a second positional path to choose the output PDF location

6. Treat `out/session-pdfs/<session>.pdf` as the default output when no explicit
   path is supplied.
7. If the user wants layout changes, adjust repo code and re-run the repo
   command instead of inventing an ad hoc external workflow.

## Output Expectations

- Keep the session work doc as the source of truth.
- Do not manually edit generated PDFs.
- Preserve the default print model: first/default tune version only, primary
  parts only unless `--include-alternates` is passed.
- Use this skill after `session-work-first-pass` when the user wants a printable
  rehearsal artifact or layout feedback.
