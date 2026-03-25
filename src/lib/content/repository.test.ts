import path from "node:path";

import { describe, expect, it } from "vitest";

import { loadSessionbookCorpus } from "@/lib/content/load-corpus";
import { createContentRepository } from "@/lib/content/repository";

describe("createContentRepository", () => {
  it("derives preview views from the shared markdown corpus", async () => {
    const corpus = await loadSessionbookCorpus({
      contentRoot: path.join(process.cwd(), "content"),
    });
    const repository = createContentRepository(corpus);

    expect(repository.getCatalogSummary()).toEqual({
      tuneCount: 19,
      setCount: 10,
      sessionCount: 1,
    });

    const glenOfAherlow = repository.getPreviewTuneBySlug("glen-of-aherlow");
    expect(glenOfAherlow?.setMemberships).toEqual([
      {
        slug: "glen-of-aherlow-merry-blacksmith",
        name: "Glen of Aherlow / Merry Blacksmith",
      },
    ]);

    const aprilSession = repository.getPreviewSessionBySlug(
      "commodore-barry-club-first-friday-session-2026-04-03",
    );
    expect(aprilSession?.sections[0]).toEqual({
      heading: "Jigs",
      sets: [
        {
          slug: "the-lisnagun-rollicking-boys-of-tandragee",
          name: "The Lisnagun / Rollicking Boys of Tandragee",
          notes: "",
          tuneNames: ["The Lisnagun", "Rollicking Boys of Tandragee"],
          tuneCount: 2,
        },
        {
          slug: "geese-in-the-bog-millers-maggot",
          name: "Geese in the Bog / Miller's Maggot",
          notes: "",
          tuneNames: ["Geese in the Bog", "Miller's Maggot"],
          tuneCount: 2,
        },
        {
          slug: "willie-colemans-maid-on-the-green",
          name: "Willie Coleman's / Maid on the Green",
          notes: "",
          tuneNames: ["Willie Coleman's", "Maid on the Green"],
          tuneCount: 2,
        },
      ],
    });
  });
});
