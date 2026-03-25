import { describe, expect, it } from "vitest";

import { release1FixtureStore } from "@/data/release-1/fixture-store";
import { createRelease1Repository } from "@/lib/release-1/repository";

describe("release1Repository", () => {
  it("summarizes the validated fixture store", () => {
    const repository = createRelease1Repository(release1FixtureStore);

    expect(repository.getCatalogSummary()).toEqual({
      publicTuneCount: 35,
      aliasCount: 2,
      chartCount: 35,
      publicSetCount: 14,
      privateGigSheetCount: 1,
    });
  });

  it("resolves public tunes by alias", () => {
    const repository = createRelease1Repository(release1FixtureStore);

    expect(repository.findPublicTuneByAlias("Green Mountain")?.slug).toBe(
      "the-green-mountain",
    );
    expect(repository.findPublicTuneByAlias("Swinging on a Gate")?.slug).toBe(
      "swinging-on-the-gate",
    );
    expect(repository.findPublicTuneByAlias("Tabhair Dom Do Lámh")?.slug).toBe(
      "tabhair-dom-do-lamh",
    );
    expect(repository.findPublicTuneByAlias("Tabhair Dom Do Lamh")?.slug).toBe(
      "tabhair-dom-do-lamh",
    );
    expect(repository.findPublicTuneByAlias("missing tune")).toBeUndefined();
  });

  it("resolves public tunes and sets by slug with link-ready metadata", () => {
    const repository = createRelease1Repository(release1FixtureStore);
    const linkedSet = repository
      .listPublicSets()
      .find(
        (setRecord) =>
          setRecord.name === "The Green Mountain / Wind that Shakes the Barley",
      );
    const firstSet = repository.listPublicSets()[0];
    const morrisonsJig = repository
      .listPublicTunes()
      .find((tune) => tune.name === "Morrison's Jig");
    const tune = repository.getPublicTuneBySlug("the-green-mountain");
    const setRecord = firstSet
      ? repository.getPublicSetBySlug(firstSet.slug)
      : undefined;

    expect(linkedSet).toBeDefined();
    expect(morrisonsJig).toBeDefined();
    expect(tune).toMatchObject({
      slug: "the-green-mountain",
      setNames: ["The Green Mountain / Wind that Shakes the Barley"],
      setMemberships: [
        {
          name: linkedSet?.name,
          slug: linkedSet?.slug,
        },
      ],
    });
    expect(setRecord?.entries[0]).toMatchObject({
      tuneName: morrisonsJig?.name,
      tuneSlug: morrisonsJig?.slug,
      tuneType: morrisonsJig?.tuneType,
      contentMarkdown: morrisonsJig?.chart.contentMarkdown,
    });
    expect(repository.getPublicTuneBySlug("missing-tune")).toBeUndefined();
    expect(repository.getPublicSetBySlug("missing-set")).toBeUndefined();
  });

  it("preserves set and gig-sheet ordering", () => {
    const repository = createRelease1Repository(release1FixtureStore);
    const sets = repository.listPublicSets();
    const gigSheet = repository.getPrivateGigSheetBySlug("st-paddys-day");

    expect(sets[0]?.entries.map((entry) => entry.tuneName)).toEqual([
      "Morrison's Jig",
      "The Butterfly",
      "Swallowtail Jig",
    ]);
    expect(gigSheet?.entries.map((entry) => entry.setName)).toEqual([
      "Morrison's Jig / The Butterfly / Swallowtail Jig",
      "Saddle the Pony / Lilting Banshee / Tom Billy's",
      "Connaughtman's Rambles",
      "The Green Mountain / Wind that Shakes the Barley",
      "Swinging on the Gate / Man of the House / Jackie Coleman's",
      "Congress Reel / Mason's Apron",
      "The Silver Spear / The Earl's Chair / The Musical Priest",
      "Warlock's / Bog an Lochan / Keep it Up / Prince Charlie's / Hull's Reel",
      "The Rights of Man / Merrily Kiss the Quaker / The Kesh Jig",
      "Off to California / Temperance Reel / Wissahickon Drive",
      "Fisher's Hornpipe / The Fairies' Hornpipe",
      "Tabhair Dom Do Lámh",
    ]);
  });

  it("enforces the Release 1 one-chart-per-tune fixture invariant", () => {
    const duplicateChartStore = {
      ...release1FixtureStore,
      charts: [
        ...release1FixtureStore.charts,
        {
          ...release1FixtureStore.charts[0],
          id: "lantern-reel-alt-chart",
          slug: "lantern-reel-alt-chart",
          title: "The Lantern Reel (Alt)",
        },
      ],
    };

    expect(() => createRelease1Repository(duplicateChartStore)).toThrow(
      /exactly one chart/i,
    );
  });

  it("rejects malformed fixture data", () => {
    const malformedStore = {
      ...release1FixtureStore,
      tunes: [
        {
          id: "broken-tune",
          name: "Broken Tune",
          tuneType: "Reel",
          summary: "Missing slug on purpose.",
        },
        ...release1FixtureStore.tunes.slice(1),
      ],
    };

    expect(() => createRelease1Repository(malformedStore)).toThrow(/slug/i);
  });

  it("rejects public gig sheets", () => {
    const publicGigStore = {
      ...release1FixtureStore,
      gigSheets: [
        {
          ...release1FixtureStore.gigSheets[0],
          visibility: "public" as const,
        },
      ],
    };

    expect(() => createRelease1Repository(publicGigStore)).toThrow(
      /gig sheets must stay private/i,
    );
  });

  it("rejects unlisted catalog records until browse semantics exist", () => {
    const unlistedSetStore = {
      ...release1FixtureStore,
      sets: [
        {
          ...release1FixtureStore.sets[0],
          visibility: "unlisted" as const,
        },
        ...release1FixtureStore.sets.slice(1),
      ],
    };

    expect(() => createRelease1Repository(unlistedSetStore)).toThrow(
      /must stay public/i,
    );
  });

  it("rejects duplicate slugs", () => {
    const duplicateSlugStore = {
      ...release1FixtureStore,
      tunes: [
        release1FixtureStore.tunes[0],
        {
          ...release1FixtureStore.tunes[1],
          slug: release1FixtureStore.tunes[0].slug,
        },
        ...release1FixtureStore.tunes.slice(2),
      ],
    };

    expect(() => createRelease1Repository(duplicateSlugStore)).toThrow(
      /duplicate tune slug/i,
    );
  });

  it("rejects ambiguous lookup terms across tunes", () => {
    const ambiguousAliasStore = {
      ...release1FixtureStore,
      tuneAliases: [
        ...release1FixtureStore.tuneAliases,
        {
          id: "tabhair-dom-do-lamh-green-mountain",
          tuneId: "tabhair-dom-do-lamh",
          name: "Green Mountain",
          normalizedName: "green mountain",
        },
      ],
    };

    expect(() => createRelease1Repository(ambiguousAliasStore)).toThrow(
      /resolves to multiple tunes/i,
    );
  });

  it("rejects gig-sheet entries that reference unknown sets", () => {
    const danglingSetStore = {
      ...release1FixtureStore,
      gigSheets: [
        {
          ...release1FixtureStore.gigSheets[0],
          entries: [
            {
              ...release1FixtureStore.gigSheets[0].entries[0],
              setId: "missing-set",
            },
            ...release1FixtureStore.gigSheets[0].entries.slice(1),
          ],
        },
      ],
    };

    expect(() => createRelease1Repository(danglingSetStore)).toThrow(
      /unknown set/i,
    );
  });
});
