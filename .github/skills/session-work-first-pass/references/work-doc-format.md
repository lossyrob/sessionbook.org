# Session Work Document Format

## Paths

- Primary authoring source: `Sessions/*_session_work.md`
- Canonical generated output:
  - `content/tunes/*.md`
  - `content/sets/*.md`
  - `content/sessions/*.md`
- Regeneration command: `npm run generate:session-content`

## Structure

Use one checked-in markdown file for the full session in running order.

### Title

Use a single top-level heading:

```markdown
# Commodore Barry Club First Friday Session - April 3 2026
```

### Session sections

Use `##` headings for ordered sections from the leader list:

```markdown
## Jigs
## Reels
## Slip Jigs
```

### Set boundaries

Use `---` to separate sets. Tunes inside the same set stay adjacent.

```markdown
---
**Tune One** (G)
...
**Tune Two** (Edor)
...
```

### Tune titles

Use bold tune titles with an optional trailing key descriptor:

```markdown
**The Lisnagun** (G)
**Glen of Aherlow (Lafferty's)** (Edor)
```

If the tune title itself includes an alternate name in parentheses, keep it
inside the bold title. The final parenthetical outside the bold title is the key
descriptor.

### Charts

Each tune owns one fenced code block:

```markdown
**The Lisnagun** (G)

```
| G / / / | D / / / |
```
```

Blank code fences are valid during initialization.

## Note markers

### Published tune notes

Use `>` for notes that should survive into the canonical tune document.

```markdown
> Tune notes can
> be multiline
```

### Published set / transition notes

Use `>>` for notes that should survive into the canonical set document.

```markdown
>> Let the first tune settle
>> before the pickup into the second
```

### Published session notes

Use `>>>` for notes that should survive into the canonical session document.

```markdown
>>> Session Notes
>>> also can be multiline
```

### Ignored author comments

Use `%%` for comments that should be ignored during canonicalization.

```markdown
%% Author comment
%% Another scratch note
```

### Tune links

Use `=>` for tune-associated resources such as The Session, YouTube, Spotify, or
repo-local provenance paths.

```markdown
=> https://thesession.org/tunes/43#setting55355
=> Session video | https://youtu.be/example
=> Sessions/2026-01_first_friday_jam.md
```

Links written before any version block belong to the tune overall. Links written
after `= version:` belong to that version.

### Structured tune versions

Use `= version:` for a whole-tune variant with its own links and parts:

```markdown
= version: Session default
= version: Matt Molloy recording
```

### Structured parts and alternates

Use `= part:` for a named part and `= alt:` for an alternate pass or variation
of that part. Each marker owns the next fenced chart block.

```markdown
= version: Session default
=> https://youtu.be/example
= part: A
```
| G / / / |
```

= alt: A | second pass
```
| Em / / / |
```

= part: B
```
| D / / / |
```
```

## Multiline behavior

- Consecutive lines with the same marker belong to one note block
- Blank lines end the current note block
- Canonicalization preserves newlines inside the block

## Canonical mapping

- `>` -> tune `## Notes`
- `=>` -> tune `## Links`
- `= version:` / `= part:` / `= alt:` -> tune `## Versions`
- `>>` -> set `## Notes`
- `>>>` -> session `## Notes`
- `%%` -> stripped

Never edit `content/` by hand when using this workflow. Always edit the session
work doc, then run `npm run generate:session-content`.
