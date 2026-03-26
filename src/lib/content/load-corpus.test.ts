import path from "node:path";

import { describe, expect, it } from "vitest";

import { loadSessionbookCorpus } from "@/lib/content/load-corpus";

describe("loadSessionbookCorpus", () => {
  it("loads the upcoming session draft corpus from content/", async () => {
    const corpus = await loadSessionbookCorpus({
      contentRoot: path.join(process.cwd(), "content"),
    });

    expect(corpus.tunes).toHaveLength(19);
    expect(corpus.sets).toHaveLength(10);
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
      links: [
        {
          label: "The Session (setting 45009)",
          href: "https://thesession.org/tunes/496#setting45009",
          provider: "the-session",
          theSessionTuneId: 496,
          theSessionSettingId: 45009,
        },
      ],
      versions: [
        {
          label: "Session default",
          parts: [
            {
              name: "Full tune",
            },
          ],
        },
      ],
    });

    const woundedHussarSet = corpus.sets.find(
      (setDocument) => setDocument.slug === "the-wounded-hussar",
    );
    expect(woundedHussarSet?.tuneSlugs).toEqual(["the-wounded-hussar"]);
  });
});
