import { describe, expect, it } from "vitest";

import { release1FixtureStore } from "@/data/release-1/fixture-store";
import {
  buildPublishableCorpus,
  createRelease1ContentCorpus,
} from "@/lib/content/publishable-corpus";
import { createRelease1Repository } from "@/lib/release-1/repository";

describe("publishable corpus", () => {
  it("backfills release 1 public catalog content into shared-corpus documents", () => {
    const release1Corpus = createRelease1ContentCorpus(release1FixtureStore);
    const release1Repository = createRelease1Repository(release1FixtureStore);

    expect(release1Corpus.tunes).toHaveLength(
      release1Repository.listPublicTunes().length,
    );
    expect(release1Corpus.sets).toHaveLength(
      release1Repository.listPublicSets().length,
    );
    expect(release1Corpus.sessions).toEqual([]);

    const willieColemans = release1Corpus.tunes.find(
      (tune) => tune.slug === "willie-colemans",
    );
    expect(willieColemans?.versions).toHaveLength(1);
    expect(willieColemans?.versions[0]?.parts).toHaveLength(1);
    expect(willieColemans?.versions[0]?.parts[0]?.chart).toContain(
      "G - C D | or | G - Am D | or build G A B C D",
    );
    expect(willieColemans?.notes).toContain(
      "Imported from Sessions/chyunes_mbys.md",
    );

    const morrisonsSet = release1Corpus.sets.find(
      (setDocument) =>
        setDocument.slug === "morrisons-jig-the-butterfly-swallowtail-jig",
    );
    expect(morrisonsSet?.tuneSlugs).toEqual([
      "morrisons-jig",
      "the-butterfly",
      "swallowtail-jig",
    ]);
  });

  it("merges release 1 backfill with staged session-work docs deterministically", async () => {
    const firstCorpus = await buildPublishableCorpus();
    const secondCorpus = await buildPublishableCorpus();

    expect(firstCorpus).toEqual(secondCorpus);
    expect(firstCorpus.tunes).toHaveLength(52);
    expect(firstCorpus.sets).toHaveLength(24);
    expect(firstCorpus.sessions).toHaveLength(1);

    const willieColemans = firstCorpus.tunes.find(
      (tune) => tune.slug === "willie-colemans",
    );
    expect(willieColemans?.versions[0]?.parts.length).toBeGreaterThan(1);

    const morrisonsJig = firstCorpus.tunes.find(
      (tune) => tune.slug === "morrisons-jig",
    );
    expect(morrisonsJig?.notes).toContain(
      "Imported from Sessions/chyunes_mbys.md",
    );
  });
});
