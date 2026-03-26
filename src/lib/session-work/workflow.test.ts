import path from "node:path";

import { describe, expect, it } from "vitest";

import { loadSessionbookCorpus } from "@/lib/content/load-corpus";
import {
  buildSessionWorkCorpus,
  parseSessionWorkDocument,
  renderSessionWorkDocument,
} from "@/lib/session-work/workflow";

describe("session work document workflow", () => {
  it("renders a single-document session work template from structured input", () => {
    const rendered = renderSessionWorkDocument({
      title: "Example Session",
      sections: [
        {
          heading: "Jigs",
          sets: [
            {
              tunes: [
                { title: "Tune One", keyDescriptor: "G" },
                { title: "Tune Two", keyDescriptor: "Edor" },
              ],
            },
          ],
        },
      ],
    });

    expect(rendered).toContain("# Example Session");
    expect(rendered).toContain("%% Author-only comments start with %%");
    expect(rendered).toContain("**Tune One** (G)");
    expect(rendered).toContain("**Tune Two** (Edor)");
    expect(rendered).toContain("Structured tune blocks: = version:, = part:, = alt:.");
    expect(rendered).toContain("```");
  });

  it("parses multiline tune, set, and session notes while ignoring author comments", () => {
    const parsed = parseSessionWorkDocument({
      sourcePath: "Sessions/example_session_work.md",
      source: `# Example Session

>>> Session Notes
>>> also can be multiline

## Jigs

---

>> Set note

**Tune notes can be multiline** (G)

\`\`\`
| G / / / |
\`\`\`

> Tune notes can
> be multiline

=> https://thesession.org/tunes/43#setting55355
=> Session video | https://youtu.be/example-tune

%% Author comment

**Second Tune** (Edor)

\`\`\`
| Em / / / |
\`\`\`
`,
    });

    expect(parsed.slug).toBe("example");
    expect(parsed.notes).toBe("Session Notes\nalso can be multiline");
    expect(parsed.sections[0]?.sets[0]?.notes).toBe("Set note");
    expect(parsed.sections[0]?.sets[0]?.tunes[0]).toMatchObject({
      title: "Tune notes can be multiline",
      keyDescriptor: "G",
      links: [
        {
          label: "The Session (setting 55355)",
          href: "https://thesession.org/tunes/43#setting55355",
          provider: "the-session",
          theSessionTuneId: 43,
          theSessionSettingId: 55355,
        },
        {
          label: "Session video",
          href: "https://youtu.be/example-tune",
          provider: "youtube",
        },
      ],
      versions: [
        {
          label: "Session default",
          parts: [
            {
              name: "Full tune",
              chart: "| G / / / |",
            },
          ],
        },
      ],
      notes: "Tune notes can\nbe multiline",
      tuneType: "Jig",
    });
  });

  it("promotes simple legacy source note lines into tune links", () => {
    const parsed = parseSessionWorkDocument({
      sourcePath: "Sessions/example_session_work.md",
      source: `# Example Session

## Reels

---

**Legacy Tune** (D)

\`\`\`
| D / / / |
\`\`\`

> Source: https://thesession.org/tunes/188
> Needs review against the preferred local version.
`,
    });

    expect(parsed.sections[0]?.sets[0]?.tunes[0]).toMatchObject({
      title: "Legacy Tune",
      links: [
        {
          label: "The Session",
          href: "https://thesession.org/tunes/188",
          provider: "the-session",
          theSessionTuneId: 188,
        },
      ],
      versions: [
        {
          label: "Session default",
          parts: [
            {
              name: "Full tune",
              chart: "| D / / / |",
            },
          ],
        },
      ],
      notes: "Needs review against the preferred local version.",
    });
  });

  it("strips legacy source note lines when explicit links are present", () => {
    const parsed = parseSessionWorkDocument({
      sourcePath: "Sessions/example_session_work.md",
      source: `# Example Session

## Reels

---

**Mixed Tune** (D)

\`\`\`
| D / / / |
\`\`\`

=> https://thesession.org/tunes/188
> Source: https://thesession.org/tunes/188
> Keep this note.
`,
    });

    expect(parsed.sections[0]?.sets[0]?.tunes[0]).toMatchObject({
      title: "Mixed Tune",
      links: [
        {
          label: "The Session",
          href: "https://thesession.org/tunes/188",
          provider: "the-session",
          theSessionTuneId: 188,
        },
      ],
      versions: [
        {
          label: "Session default",
          parts: [
            {
              name: "Full tune",
              chart: "| D / / / |",
            },
          ],
        },
      ],
      notes: "Keep this note.",
    });
  });

  it("parses structured tune versions and alternate parts", () => {
    const parsed = parseSessionWorkDocument({
      sourcePath: "Sessions/example_session_work.md",
      source: `# Example Session

## Reels

---

**Versioned Tune** (D)

=> https://thesession.org/tunes/188

= version: Session default
=> Session video | https://youtu.be/example-default
= part: A
\`\`\`
| D / / / |
\`\`\`

= alt: A | second pass
\`\`\`
| Bm / / / |
\`\`\`

= part: B
\`\`\`
| G / / / |
\`\`\`

= version: Recording variant
=> https://open.spotify.com/track/example
\`\`\`
| Em / / / |
\`\`\`
`,
    });

    expect(parsed.sections[0]?.sets[0]?.tunes[0]).toMatchObject({
      title: "Versioned Tune",
      links: [
        {
          label: "The Session",
          href: "https://thesession.org/tunes/188",
          provider: "the-session",
          theSessionTuneId: 188,
        },
      ],
      versions: [
        {
          label: "Session default",
          links: [
            {
              label: "Session video",
              href: "https://youtu.be/example-default",
              provider: "youtube",
            },
          ],
          parts: [
            {
              name: "A",
              chart: "| D / / / |",
            },
            {
              name: "A",
              alternateLabel: "second pass",
              chart: "| Bm / / / |",
            },
            {
              name: "B",
              chart: "| G / / / |",
            },
          ],
        },
        {
          label: "Recording variant",
          links: [
            {
              label: "Spotify",
              href: "https://open.spotify.com/track/example",
              provider: "spotify",
            },
          ],
          parts: [
            {
              name: "Full tune",
              chart: "| Em / / / |",
            },
          ],
        },
      ],
    });
  });

  it("keeps the checked-in canonical content in sync with the session work docs", async () => {
    const builtCorpus = await buildSessionWorkCorpus({
      sessionsRoot: path.join(process.cwd(), "Sessions"),
    });
    const loadedCorpus = await loadSessionbookCorpus({
      contentRoot: path.join(process.cwd(), "content"),
    });

    expect(builtCorpus).toEqual(loadedCorpus);
  });
});
