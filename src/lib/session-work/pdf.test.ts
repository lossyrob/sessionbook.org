import { describe, expect, it } from "vitest";

import {
  buildSessionPdfDocument,
  buildSessionPdfTuneParts,
} from "@/lib/session-work/pdf";
import { parseSessionWorkDocument } from "@/lib/session-work/workflow";

describe("session work PDF print model", () => {
  it("uses the first/default version and hides alternate parts by default", () => {
    const parsed = parseSessionWorkDocument({
      sourcePath: "Sessions/example_session_work.md",
      source: `# Example Session

>>> Bring the capo.

## Reels

---

>> Fast opener.

**Versioned Tune** (D)

> Keep the lift in the B part.

= version: Session default
= part: A
\`\`\`
| D / / / |
\`\`\`

= alt: A+B
\`\`\`
| Bm / / / |
\`\`\`

= part: B
\`\`\`
| G / / / |
\`\`\`

= version: Recording variant
\`\`\`
| Em / / / |
\`\`\`

**Legacy Tune (Local name)** (G)

\`\`\`
| G / / / |
\`\`\`

---

**Second Set Tune** (A)

\`\`\`
| A / / / |
\`\`\`
`,
    });

    const pdf = buildSessionPdfDocument(parsed);

    expect(pdf).toMatchObject({
      title: "Example Session",
      notes: "",
      sets: [
        {
          sectionHeading: "Reels",
          notes: "",
          tunes: [
            {
              title: "Versioned Tune",
              notes: "",
              parts: [
                {
                  label: "A",
                  chartLines: ["| D / / / |"],
                },
                {
                  label: "B",
                  chartLines: ["| G / / / |"],
                },
              ],
            },
            {
              title: "Legacy Tune (Local name)",
              notes: "",
              parts: [
                {
                  chartLines: ["| G / / / |"],
                },
              ],
            },
          ],
        },
        {
          notes: "",
          tunes: [
            {
              title: "Second Set Tune",
            },
          ],
        },
      ],
    });
    expect(pdf.sets[1]?.sectionHeading).toBeUndefined();
  });

  it("can include alternate parts when requested", () => {
    const parsed = parseSessionWorkDocument({
      sourcePath: "Sessions/example_session_work.md",
      source: `# Example Session

>>> Bring the capo.

## Jigs

---

**Alt Tune** (G)

> Keep the groove on the repeat.

= part: A
\`\`\`
| G / / / |
\`\`\`

= alt: A
\`\`\`
| D / / / |
\`\`\`

= alt: A | second pass
\`\`\`
| Em / / / |
\`\`\`

= part: B
\`\`\`
| C / / / |
\`\`\`
`,
    });
    const version = parsed.sections[0]?.sets[0]?.tunes[0]?.versions[0];

    expect(version).toBeDefined();
    expect(buildSessionPdfTuneParts(version!, { includeAlternateParts: true })).toEqual([
      {
        label: "A",
        chartLines: ["| G / / / |"],
      },
      {
        label: "A alt",
        chartLines: ["| D / / / |"],
      },
      {
        label: "A alt (second pass)",
        chartLines: ["| Em / / / |"],
      },
      {
        label: "B",
        chartLines: ["| C / / / |"],
      },
    ]);

    const pdf = buildSessionPdfDocument(parsed, {
      includeAlternateParts: true,
      includeNotes: true,
    });

    expect(pdf.notes).toBe("Bring the capo.");
    expect(pdf.sets[0]?.tunes[0]?.notes).toBe("Keep the groove on the repeat.");
  });
});
