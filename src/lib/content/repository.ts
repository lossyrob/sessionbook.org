import type { SessionbookCorpus } from "@/lib/content/schema";

export type PreviewTuneView = {
  id: string;
  slug: string;
  name: string;
  aliases: string[];
  tuneType: string;
  sourcePath: string;
  chart: {
    title: string;
    key: string;
    mode: string;
    meter: string;
    contentMarkdown: string;
  };
  notes: string;
  sourceLinks: string;
  workingNotes: string;
  setMemberships: Array<{
    slug: string;
    name: string;
  }>;
};

export type PreviewSetView = {
  id: string;
  slug: string;
  name: string;
  tuneType?: string;
  notes: string;
  sourcePath: string;
  entries: Array<{
    position: number;
    tuneSlug: string;
    tuneName: string;
    tuneType: string;
    key: string;
    mode: string;
    meter: string;
    chartTitle: string;
    contentMarkdown: string;
  }>;
};

export type PreviewSessionListItem = {
  id: string;
  slug: string;
  name: string;
  date?: string;
  sourcePath: string;
  sectionCount: number;
  setCount: number;
};

export type PreviewSessionView = {
  id: string;
  slug: string;
  name: string;
  date?: string;
  sourcePath: string;
  notes: string;
  sections: Array<{
    heading: string;
    sets: Array<{
      slug: string;
      name: string;
      notes: string;
      tuneNames: string[];
      tuneCount: number;
    }>;
  }>;
};

export type PreviewCatalogSummary = {
  tuneCount: number;
  setCount: number;
  sessionCount: number;
};

export type ContentRepository = {
  getCatalogSummary: () => PreviewCatalogSummary;
  listPreviewTunes: () => PreviewTuneView[];
  getPreviewTuneBySlug: (slug: string) => PreviewTuneView | undefined;
  listPreviewSets: () => PreviewSetView[];
  getPreviewSetBySlug: (slug: string) => PreviewSetView | undefined;
  listPreviewSessions: () => PreviewSessionListItem[];
  getPreviewSessionBySlug: (slug: string) => PreviewSessionView | undefined;
};

function getDisplayMeter(meter?: string): string {
  return meter ?? "TBD";
}

export function createContentRepository(
  corpus: SessionbookCorpus,
): ContentRepository {
  const tunesBySlug = new Map(corpus.tunes.map((tune) => [tune.slug, tune]));
  const setsBySlug = new Map(corpus.sets.map((setDocument) => [setDocument.slug, setDocument]));
  const tuneMemberships = new Map<
    string,
    Array<{
      slug: string;
      name: string;
    }>
  >();

  for (const setDocument of corpus.sets) {
    for (const tuneSlug of setDocument.tuneSlugs) {
      const memberships = tuneMemberships.get(tuneSlug) ?? [];
      memberships.push({
        slug: setDocument.slug,
        name: setDocument.title,
      });
      tuneMemberships.set(tuneSlug, memberships);
    }
  }

  function buildPreviewTuneView(slug: string): PreviewTuneView {
    const tune = tunesBySlug.get(slug);

    if (!tune) {
      throw new Error(`Missing tune "${slug}" while building preview view.`);
    }

    return {
      id: tune.slug,
      slug: tune.slug,
      name: tune.title,
      aliases: tune.aliases,
      tuneType: tune.tuneType,
      sourcePath: tune.sourcePath,
      chart: {
        title: tune.title,
        key: tune.key,
        mode: tune.mode,
        meter: getDisplayMeter(tune.meter),
        contentMarkdown: tune.chart,
      },
      notes: tune.notes,
      sourceLinks: tune.sourceLinks,
      workingNotes: tune.workingNotes,
      setMemberships: tuneMemberships.get(tune.slug) ?? [],
    };
  }

  function buildPreviewSetView(slug: string): PreviewSetView {
    const setDocument = setsBySlug.get(slug);

    if (!setDocument) {
      throw new Error(`Missing set "${slug}" while building preview view.`);
    }

    return {
      id: setDocument.slug,
      slug: setDocument.slug,
      name: setDocument.title,
      tuneType: setDocument.tuneType,
      notes: setDocument.notes,
      sourcePath: setDocument.sourcePath,
      entries: setDocument.tuneSlugs.map((tuneSlug, index) => {
        const tune = tunesBySlug.get(tuneSlug);

        if (!tune) {
          throw new Error(
            `Set "${setDocument.slug}" references missing tune "${tuneSlug}".`,
          );
        }

        return {
          position: index + 1,
          tuneSlug: tune.slug,
          tuneName: tune.title,
          tuneType: tune.tuneType,
          key: tune.key,
          mode: tune.mode,
          meter: getDisplayMeter(tune.meter),
          chartTitle: tune.title,
          contentMarkdown: tune.chart,
        };
      }),
    };
  }

  const previewTunes = corpus.tunes.map((tune) => buildPreviewTuneView(tune.slug));
  const previewSets = corpus.sets.map((setDocument) =>
    buildPreviewSetView(setDocument.slug),
  );
  const previewSessions = corpus.sessions.map((session) => ({
    id: session.slug,
    slug: session.slug,
    name: session.title,
    date: session.date,
    sourcePath: session.sourcePath,
    sectionCount: session.sections.length,
    setCount: session.sections.reduce(
      (count, section) => count + section.setSlugs.length,
      0,
    ),
  }));

  return {
    getCatalogSummary: () => ({
      tuneCount: previewTunes.length,
      setCount: previewSets.length,
      sessionCount: previewSessions.length,
    }),
    listPreviewTunes: () => previewTunes,
    getPreviewTuneBySlug: (slug) =>
      previewTunes.find((tune) => tune.slug === slug),
    listPreviewSets: () => previewSets,
    getPreviewSetBySlug: (slug) => previewSets.find((setView) => setView.slug === slug),
    listPreviewSessions: () => previewSessions,
    getPreviewSessionBySlug: (slug) => {
      const session = corpus.sessions.find((candidate) => candidate.slug === slug);

      if (!session) {
        return undefined;
      }

      return {
        id: session.slug,
        slug: session.slug,
        name: session.title,
        date: session.date,
        sourcePath: session.sourcePath,
        notes: session.notes,
        sections: session.sections.map((section) => ({
          heading: section.heading,
          sets: section.setSlugs.map((setSlug) => {
            const setView = buildPreviewSetView(setSlug);

            return {
              slug: setView.slug,
              name: setView.name,
              notes: setView.notes,
              tuneNames: setView.entries.map((entry) => entry.tuneName),
              tuneCount: setView.entries.length,
            };
          }),
        })),
      };
    },
  };
}
