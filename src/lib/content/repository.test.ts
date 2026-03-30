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
    expect(glenOfAherlow?.theSessionLink).toMatchObject({
      href: "https://thesession.org/tunes/496#setting45009",
      provider: "the-session",
      theSessionTuneId: 496,
      theSessionSettingId: 45009,
    });
    expect(glenOfAherlow?.hasStructuredVersions).toBe(true);
    expect(glenOfAherlow?.versions[0]?.parts.map((part) => part.name)).toEqual([
      "A",
      "B",
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

  it("surfaces structured tune versions for preview rendering", () => {
    const repository = createContentRepository({
      tunes: [
        {
          slug: "versioned-tune",
          title: "Versioned Tune",
          aliases: [],
          tuneType: "Reel",
          key: "D",
          mode: "Major",
          meter: "4/4",
          visibility: "public",
          chart: "A:\n| D / / / |\n\nA alt (second pass):\n| Bm / / / |",
          versions: [
            {
              label: "Session default",
              links: [
                {
                  label: "YouTube",
                  href: "https://youtu.be/example",
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
              ],
            },
          ],
          notes: "",
          links: [],
          workingNotes: "",
          sourcePath: "content/tunes/versioned-tune.md",
        },
      ],
      sets: [],
      sessions: [],
    });

    const versionedTune = repository.getPreviewTuneBySlug("versioned-tune");

    expect(versionedTune?.hasStructuredVersions).toBe(true);
    expect(versionedTune?.versions[0]).toMatchObject({
      label: "Session default",
      links: [
        {
          href: "https://youtu.be/example",
          provider: "youtube",
        },
      ],
      parts: [
        {
          name: "A",
          contentMarkdown: "| D / / / |",
        },
        {
          name: "A",
          alternateLabel: "second pass",
          contentMarkdown: "| Bm / / / |",
        },
      ],
    });
  });
});
