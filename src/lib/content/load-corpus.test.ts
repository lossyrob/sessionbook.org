import path from "node:path";

import { describe, expect, it } from "vitest";

import { loadSessionbookCorpus } from "@/lib/content/load-corpus";

describe("loadSessionbookCorpus", () => {
  it("loads the merged publishable corpus from content/", async () => {
    const corpus = await loadSessionbookCorpus({
      contentRoot: path.join(process.cwd(), "content"),
    });

    expect(corpus.tunes).toHaveLength(52);
    expect(corpus.sets).toHaveLength(24);
    expect(corpus.sessions).toHaveLength(1);

    const session = corpus.sessions[0];
    expect(session.slug).toBe(
      "commodore-barry-club-first-friday-session-2026-04-03",
    );
    expect(session.sections.map((section) => section.heading)).toEqual([
      "Jigs",
      "Reels",
      "Slip Jigs",
      "Hornpipes",
      "Polkas",
      "O'Carolan",
    ]);

    const glenOfAherlow = corpus.tunes.find(
      (tune) => tune.slug === "glen-of-aherlow",
    );
    expect(glenOfAherlow).toMatchObject({
      title: "Glen of Aherlow",
      aliases: ["Lafferty's"],
      tuneType: "Reel",
      key: "E",
      mode: "Dorian",
      meter: "4/4",
      visibility: "public",
      links: [],
      versions: [
        {
          label: "Session default",
          parts: [
            {
              name: "A",
            },
            {
              name: "B",
            },
          ],
        },
      ],
    });

    const woundedHussarSet = corpus.sets.find(
      (setDocument) => setDocument.slug === "the-wounded-hussar",
    );
    expect(woundedHussarSet?.tuneSlugs).toEqual(["the-wounded-hussar"]);

    const morrisonsJig = corpus.tunes.find(
      (tune) => tune.slug === "morrisons-jig",
    );
    expect(morrisonsJig).toMatchObject({
      title: "Morrison's Jig",
      tuneType: "Jig",
      visibility: "public",
      notes: "Imported from Sessions/chyunes_mbys.md.",
    });
  });
});
