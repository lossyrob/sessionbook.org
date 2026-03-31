import path from "node:path";

import { describe, expect, it } from "vitest";

import { loadSessionbookCorpus } from "@/lib/content/load-corpus";
import { createContentRepository } from "@/lib/content/repository";

describe("createContentRepository", () => {
  it("derives preview views from the merged shared markdown corpus", async () => {
    const corpus = await loadSessionbookCorpus({
      contentRoot: path.join(process.cwd(), "content"),
    });
    const repository = createContentRepository(corpus);

    expect(repository.getCatalogSummary()).toEqual({
      tuneCount: 52,
      setCount: 24,
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
    expect(aprilSession?.sections[0]).toMatchObject({
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

    const morrisonsJig = repository.getPreviewTuneBySlug("morrisons-jig");
    expect(morrisonsJig?.notes).toBe("Imported from Sessions/chyunes_mbys.md.");
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

  it("derives public views with visibility filtering and transitive public memberships", () => {
    const repository = createContentRepository({
      tunes: [
        {
          slug: "public-tune",
          title: "Public Tune",
          aliases: ["Shared Alias"],
          tuneType: "Reel",
          key: "D",
          mode: "Major",
          meter: "4/4",
          visibility: "public",
          chart: "| D / / / |",
          versions: [
            {
              label: "Session default",
              links: [],
              parts: [{ name: "Full tune", chart: "| D / / / |" }],
            },
          ],
          notes: "Public summary.",
          links: [],
          workingNotes: "",
          sourcePath: "content/tunes/public-tune.md",
        },
        {
          slug: "private-tune",
          title: "Private Tune",
          aliases: [],
          tuneType: "Jig",
          key: "G",
          mode: "Major",
          meter: "6/8",
          visibility: "private",
          chart: "| G / / / |",
          versions: [
            {
              label: "Session default",
              links: [],
              parts: [{ name: "Full tune", chart: "| G / / / |" }],
            },
          ],
          notes: "Private summary.",
          links: [],
          workingNotes: "",
          sourcePath: "content/tunes/private-tune.md",
        },
        {
          slug: "unlisted-tune",
          title: "Unlisted Tune",
          aliases: [],
          tuneType: "Hornpipe",
          key: "A",
          mode: "Major",
          meter: "4/4",
          visibility: "unlisted",
          chart: "| A / / / |",
          versions: [
            {
              label: "Session default",
              links: [],
              parts: [{ name: "Full tune", chart: "| A / / / |" }],
            },
          ],
          notes: "Unlisted summary.",
          links: [],
          workingNotes: "",
          sourcePath: "content/tunes/unlisted-tune.md",
        },
      ],
      sets: [
        {
          slug: "public-set",
          title: "Public Set",
          tuneType: "Reel",
          visibility: "public",
          tuneSlugs: ["public-tune"],
          notes: "Public set summary.",
          sourcePath: "content/sets/public-set.md",
        },
        {
          slug: "private-set",
          title: "Private Set",
          tuneType: "Reel",
          visibility: "private",
          tuneSlugs: ["public-tune"],
          notes: "Private set summary.",
          sourcePath: "content/sets/private-set.md",
        },
        {
          slug: "unlisted-set",
          title: "Unlisted Set",
          tuneType: "Hornpipe",
          visibility: "unlisted",
          tuneSlugs: ["public-tune"],
          notes: "Unlisted set summary.",
          sourcePath: "content/sets/unlisted-set.md",
        },
      ],
      sessions: [
        {
          slug: "public-session",
          title: "Public Session",
          date: "2026-04-03",
          visibility: "public",
          notes: "Public session summary.",
          sections: [{ heading: "Reels", setSlugs: ["public-set"] }],
          sourcePath: "content/sessions/public-session.md",
        },
        {
          slug: "private-session",
          title: "Private Session",
          date: "2026-05-03",
          visibility: "private",
          notes: "Private session summary.",
          sections: [{ heading: "Reels", setSlugs: ["private-set"] }],
          sourcePath: "content/sessions/private-session.md",
        },
        {
          slug: "unlisted-session",
          title: "Unlisted Session",
          date: "2026-06-03",
          visibility: "unlisted",
          notes: "Unlisted session summary.",
          sections: [{ heading: "Reels", setSlugs: ["public-set"] }],
          sourcePath: "content/sessions/unlisted-session.md",
        },
      ],
    });

    expect(repository.getPublicCatalogSummary()).toEqual({
      publicTuneCount: 1,
      publicSetCount: 1,
      publicSessionCount: 1,
      chartCount: 1,
    });
    expect(repository.listPublicTunes()).toHaveLength(1);
    expect(repository.listPublicSets()).toHaveLength(1);
    expect(repository.listPublicSessions()).toHaveLength(1);
    expect(repository.getPublicTuneBySlug("private-tune")).toBeUndefined();
    expect(repository.getPublicTuneBySlug("unlisted-tune")).toBeUndefined();
    expect(repository.getPublicSetBySlug("private-set")).toBeUndefined();
    expect(repository.getPublicSetBySlug("unlisted-set")).toBeUndefined();
    expect(
      repository.getPublicSessionBySlug("private-session"),
    ).toBeUndefined();
    expect(
      repository.getPublicSessionBySlug("unlisted-session"),
    ).toBeUndefined();
    expect(repository.getPublicTuneBySlug("public-tune")).toMatchObject({
      summary: "Public summary.",
      setNames: ["Public Set"],
      setMemberships: [
        {
          slug: "public-set",
          name: "Public Set",
        },
      ],
    });
    expect(repository.getPublicSessionBySlug("public-session")).toMatchObject({
      sections: [
        {
          heading: "Reels",
          sets: [
            {
              slug: "public-set",
              name: "Public Set",
              entries: [
                {
                  position: 1,
                  tuneSlug: "public-tune",
                  tuneName: "Public Tune",
                },
              ],
              tuneNames: ["Public Tune"],
            },
          ],
        },
      ],
    });
  });

  it("fails fast when public sets or sessions reference non-public content", () => {
    expect(() =>
      createContentRepository({
        tunes: [
          {
            slug: "private-tune",
            title: "Private Tune",
            aliases: [],
            tuneType: "Jig",
            key: "G",
            mode: "Major",
            meter: "6/8",
            visibility: "private",
            chart: "| G / / / |",
            versions: [
              {
                label: "Session default",
                links: [],
                parts: [{ name: "Full tune", chart: "| G / / / |" }],
              },
            ],
            notes: "",
            links: [],
            workingNotes: "",
            sourcePath: "content/tunes/private-tune.md",
          },
        ],
        sets: [
          {
            slug: "bad-public-set",
            title: "Bad Public Set",
            visibility: "public",
            tuneSlugs: ["private-tune"],
            notes: "",
            sourcePath: "content/sets/bad-public-set.md",
          },
        ],
        sessions: [],
      }).listPublicSets(),
    ).toThrow(
      /Public set "bad-public-set" references unavailable tune "private-tune"/i,
    );

    expect(() =>
      createContentRepository({
        tunes: [
          {
            slug: "public-tune",
            title: "Public Tune",
            aliases: [],
            tuneType: "Reel",
            key: "D",
            mode: "Major",
            meter: "4/4",
            visibility: "public",
            chart: "| D / / / |",
            versions: [
              {
                label: "Session default",
                links: [],
                parts: [{ name: "Full tune", chart: "| D / / / |" }],
              },
            ],
            notes: "",
            links: [],
            workingNotes: "",
            sourcePath: "content/tunes/public-tune.md",
          },
        ],
        sets: [
          {
            slug: "private-set",
            title: "Private Set",
            visibility: "private",
            tuneSlugs: ["public-tune"],
            notes: "",
            sourcePath: "content/sets/private-set.md",
          },
        ],
        sessions: [
          {
            slug: "bad-public-session",
            title: "Bad Public Session",
            visibility: "public",
            notes: "",
            sections: [{ heading: "Reels", setSlugs: ["private-set"] }],
            sourcePath: "content/sessions/bad-public-session.md",
          },
        ],
      }),
    ).toThrow(
      /Missing public set "private-set" while building public session view/i,
    );
  });
});
