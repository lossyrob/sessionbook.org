import { describe, expect, it } from "vitest";

import { release1FixtureStore } from "@/data/release-1/fixture-store";
import { createRelease1Repository } from "@/lib/release-1/repository";

describe("release1Repository", () => {
  it("summarizes the validated fixture store", () => {
    const repository = createRelease1Repository(release1FixtureStore);

    expect(repository.getCatalogSummary()).toEqual({
      publicTuneCount: 4,
      aliasCount: 8,
      chartCount: 4,
      publicSetCount: 2,
      privateGigSheetCount: 1,
    });
  });

  it("resolves public tunes by alias", () => {
    const repository = createRelease1Repository(release1FixtureStore);

    expect(repository.findPublicTuneByAlias("Market House")?.name).toBe("Market House Reel");
    expect(repository.findPublicTuneByAlias("winter elm")?.slug).toBe("winter-elm-jig");
    expect(repository.findPublicTuneByAlias("missing tune")).toBeUndefined();
  });

  it("preserves set and gig-sheet ordering", () => {
    const repository = createRelease1Repository(release1FixtureStore);
    const sets = repository.listPublicSets();
    const gigSheet = repository.getPrivateGigSheetBySlug("st-paddys-day");

    expect(sets[0]?.entries.map((entry) => entry.tuneName)).toEqual([
      "The Lantern Reel",
      "Market House Reel",
    ]);
    expect(gigSheet?.entries.map((entry) => entry.setName)).toEqual([
      "Lantern Opening Pair",
      "Jigs for Last Orders",
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

    expect(() => createRelease1Repository(publicGigStore)).toThrow(/gig sheets must stay private/i);
  });
});
