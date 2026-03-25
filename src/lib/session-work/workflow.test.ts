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
      notes: "Tune notes can\nbe multiline",
      chart: "| G / / / |",
      tuneType: "Jig",
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
