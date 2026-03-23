import { describe, expect, it } from "vitest";

import {
  expectedExcludedSourceTitles,
  stPaddysDayGigMetadata,
} from "@/data/release-1/import-metadata";
import { release1FixtureStore } from "@/data/release-1/fixture-store";
import {
  allocateSetId,
  buildAliasRecords,
  buildRelease1Import,
  inferTuneType,
  parseKeyAndMode,
  slugify,
} from "@/lib/release-1/import-source";
import { createRelease1Repository } from "@/lib/release-1/repository";

describe("buildRelease1Import", () => {
  it("stays in sync with the checked-in fixture store", () => {
    const result = buildRelease1Import();

    expect(result.store).toEqual(release1FixtureStore);
    expect(result.excludedSourceTitles).toEqual(
      [...expectedExcludedSourceTitles].sort((left, right) =>
        left.localeCompare(right),
      ),
    );
  });

  it("recovers Willie Coleman's from the fallback source chain", () => {
    const result = buildRelease1Import();
    const willieChart = result.store.charts.find(
      (chart) => chart.tuneId === "willie-colemans",
    );

    expect(willieChart?.contentMarkdown).toContain(
      "G - C D | or | G - Am D | or build G A B C D",
    );
    expect(willieChart?.contentMarkdown).toContain("{varation}");
  });

  it("keeps excluded titles documented and out of the imported store", () => {
    const result = buildRelease1Import();
    const importedTuneNames = new Set(
      result.store.tunes.map((tune) => tune.name),
    );

    expect(result.excludedSourceTitles).toEqual(
      [...expectedExcludedSourceTitles].sort((left, right) =>
        left.localeCompare(right),
      ),
    );
    expect(importedTuneNames.has("Josefin's Waltz")).toBe(false);
    expect(importedTuneNames.has("Kitty Lie Over")).toBe(false);
  });

  it("derives the private gig from non-drop public source groups", () => {
    const repository = createRelease1Repository(buildRelease1Import().store);
    const gigSheet = repository.getPrivateGigSheetBySlug(
      stPaddysDayGigMetadata.slug,
    );

    expect(gigSheet?.name).toBe(stPaddysDayGigMetadata.name);
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

  it("covers the helper rules behind the generated catalog", () => {
    expect(slugify("Willie Coleman's")).toBe("willie-colemans");
    expect(parseKeyAndMode("Ador")).toEqual({ key: "A", mode: "Dorian" });
    expect(
      inferTuneType("Bog an Lochan", "STRATHSPEYS → REELS", "Edor strathspey"),
    ).toBe("Strathspey");
    expect(inferTuneType("Keep it Up", "STRATHSPEYS → REELS", "Emix")).toBe(
      "Reel",
    );
    expect(inferTuneType("Sample Fling", "REELS")).toBe("Fling");
    expect(allocateSetId("repeat-id", "JIGS", 3, new Set(["repeat-id"]))).toBe(
      "jigs-3",
    );
  });

  it("fails fast on primary and alias lookup collisions", () => {
    const importedTunes = [
      {
        id: "tabhair-dom-do-lamh",
        slug: "tabhair-dom-do-lamh",
        name: "Tabhair Dom Do Lámh",
        tuneType: "Waltz",
        summary: "Primary collision case.",
      },
      {
        id: "tabhair-dom-do-lamh-ascii",
        slug: "tabhair-dom-do-lamh-ascii",
        name: "Tabhair Dom Do Lamh",
        tuneType: "Waltz",
        summary: "Primary collision case.",
      },
    ];

    expect(() => buildAliasRecords(importedTunes, new Map())).toThrow(
      /Primary tune name collision/i,
    );

    expect(() =>
      buildAliasRecords(
        [
          {
            id: "the-green-mountain",
            slug: "the-green-mountain",
            name: "The Green Mountain",
            tuneType: "Reel",
            summary: "Alias collision case.",
          },
          {
            id: "other-tune",
            slug: "other-tune",
            name: "Other Tune",
            tuneType: "Reel",
            summary: "Alias collision case.",
          },
        ],
        new Map([
          ["green mountain", [{ title: "Green Mountain" }]],
          ["other tune", [{ title: "Green Mountain" }]],
        ]),
      ),
    ).toThrow(/Alias collision while importing Release 1 sources/i);
  });

  it("marks surviving [drop] groups in the generated set summaries", () => {
    const dropSetNames = buildRelease1Import()
      .store.sets.filter((setRecord) => setRecord.summary.includes("[drop]"))
      .map((setRecord) => setRecord.name);

    expect(dropSetNames).toEqual([
      "Willie Coleman's",
      "The Boys of Ballisodare / The Crosses of Annagh / Lord McDonald's",
    ]);
  });
});
