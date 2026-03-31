import type {
  SessionDocument,
  SessionbookCorpus,
  SetDocument,
  TuneDocument,
} from "@/lib/content/schema";
import type { TuneLink } from "@/lib/content/tune-links";
import {
  renderTuneVersionChart,
  versionHasExplicitPartStructure,
  type TuneVersion,
} from "@/lib/content/tune-versions";

type SetMembership = {
  slug: string;
  name: string;
};

type SetEntryView = {
  position: number;
  tuneSlug: string;
  tuneName: string;
  tuneType: string;
  key: string;
  mode: string;
  meter: string;
  chartTitle: string;
  contentMarkdown: string;
};

type SessionSectionSetView = {
  slug: string;
  name: string;
  notes: string;
  entries: SetEntryView[];
  tuneNames: string[];
  tuneCount: number;
};

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
  links: TuneLink[];
  theSessionLink?: TuneLink;
  versions: Array<{
    label: string;
    links: TuneLink[];
    theSessionLink?: TuneLink;
    parts: Array<{
      name: string;
      isAlternate?: boolean;
      alternateLabel?: string;
      contentMarkdown: string;
    }>;
    contentMarkdown: string;
  }>;
  hasStructuredVersions: boolean;
  workingNotes: string;
  setMemberships: SetMembership[];
};

export type PublicTuneView = {
  id: string;
  slug: string;
  name: string;
  summary: string;
  notes: string;
  aliases: string[];
  tuneType: string;
  chart: {
    title: string;
    key: string;
    mode: string;
    meter: string;
    contentMarkdown: string;
  };
  setNames: string[];
  setMemberships: SetMembership[];
};

export type PreviewSetView = {
  id: string;
  slug: string;
  name: string;
  tuneType?: string;
  notes: string;
  sourcePath: string;
  entries: SetEntryView[];
};

export type PublicSetView = {
  id: string;
  slug: string;
  name: string;
  summary: string;
  notes: string;
  entries: SetEntryView[];
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

export type PublicSessionListItem = {
  id: string;
  slug: string;
  name: string;
  date?: string;
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
    sets: SessionSectionSetView[];
  }>;
};

export type PublicSessionView = {
  id: string;
  slug: string;
  name: string;
  date?: string;
  notes: string;
  sections: Array<{
    heading: string;
    sets: SessionSectionSetView[];
  }>;
};

export type PreviewCatalogSummary = {
  tuneCount: number;
  setCount: number;
  sessionCount: number;
};

export type PublicCatalogSummary = {
  publicTuneCount: number;
  publicSetCount: number;
  publicSessionCount: number;
  chartCount: number;
};

export type ContentRepository = {
  getCatalogSummary: () => PreviewCatalogSummary;
  getPublicCatalogSummary: () => PublicCatalogSummary;
  listPreviewTunes: () => PreviewTuneView[];
  getPreviewTuneBySlug: (slug: string) => PreviewTuneView | undefined;
  listPreviewSets: () => PreviewSetView[];
  getPreviewSetBySlug: (slug: string) => PreviewSetView | undefined;
  listPreviewSessions: () => PreviewSessionListItem[];
  getPreviewSessionBySlug: (slug: string) => PreviewSessionView | undefined;
  listPublicTunes: () => PublicTuneView[];
  getPublicTuneBySlug: (slug: string) => PublicTuneView | undefined;
  listPublicSets: () => PublicSetView[];
  getPublicSetBySlug: (slug: string) => PublicSetView | undefined;
  listPublicSessions: () => PublicSessionListItem[];
  getPublicSessionBySlug: (slug: string) => PublicSessionView | undefined;
};

function getDisplayMeter(meter?: string): string {
  return meter ?? "TBD";
}

function summarizeNotes(notes: string): string {
  return notes.trim();
}

function buildSetMemberships(
  setDocuments: SetDocument[],
): Map<string, SetMembership[]> {
  const tuneMemberships = new Map<string, SetMembership[]>();

  for (const setDocument of setDocuments) {
    for (const tuneSlug of setDocument.tuneSlugs) {
      const memberships = tuneMemberships.get(tuneSlug) ?? [];
      memberships.push({
        slug: setDocument.slug,
        name: setDocument.title,
      });
      tuneMemberships.set(tuneSlug, memberships);
    }
  }

  return tuneMemberships;
}

function buildPreviewTuneVersion(version: TuneVersion) {
  const theSessionLink = version.links.find(
    (link) => link.provider === "the-session",
  );

  return {
    label: version.label,
    links: version.links,
    theSessionLink,
    parts: version.parts.map((part) => ({
      name: part.name,
      isAlternate: part.isAlternate,
      alternateLabel: part.alternateLabel,
      contentMarkdown: part.chart,
    })),
    contentMarkdown: renderTuneVersionChart(version),
  };
}

function buildSetEntries(
  setDocument: SetDocument,
  tunesBySlug: Map<string, TuneDocument>,
  label: string,
): SetEntryView[] {
  return setDocument.tuneSlugs.map((tuneSlug, index) => {
    const tune = tunesBySlug.get(tuneSlug);

    if (!tune) {
      throw new Error(`${label} references unavailable tune "${tuneSlug}".`);
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
  });
}

function buildSessionSectionSets(
  setSlugs: string[],
  buildSetView: (slug: string) => {
    slug: string;
    name: string;
    notes: string;
    entries: SetEntryView[];
  },
): SessionSectionSetView[] {
  return setSlugs.map((setSlug) => {
    const setView = buildSetView(setSlug);

    return {
      slug: setView.slug,
      name: setView.name,
      notes: setView.notes,
      entries: setView.entries,
      tuneNames: setView.entries.map((entry) => entry.tuneName),
      tuneCount: setView.entries.length,
    };
  });
}

export function createContentRepository(
  corpus: SessionbookCorpus,
): ContentRepository {
  const tunesBySlug = new Map(corpus.tunes.map((tune) => [tune.slug, tune]));
  const setsBySlug = new Map(
    corpus.sets.map((setDocument) => [setDocument.slug, setDocument]),
  );
  const sessionsBySlug = new Map(
    corpus.sessions.map((session) => [session.slug, session]),
  );

  const publicTunes = corpus.tunes.filter(
    (tune) => tune.visibility === "public",
  );
  const publicSets = corpus.sets.filter(
    (setDocument) => setDocument.visibility === "public",
  );
  const publicSessions = corpus.sessions.filter(
    (session) => session.visibility === "public",
  );

  const publicTunesBySlug = new Map(
    publicTunes.map((tune) => [tune.slug, tune]),
  );
  const publicSetsBySlug = new Map(
    publicSets.map((setDocument) => [setDocument.slug, setDocument]),
  );
  const publicSessionsBySlug = new Map(
    publicSessions.map((session) => [session.slug, session]),
  );

  const previewTuneMemberships = buildSetMemberships(corpus.sets);
  const publicTuneMemberships = buildSetMemberships(publicSets);

  function buildPreviewTuneView(slug: string): PreviewTuneView {
    const tune = tunesBySlug.get(slug);

    if (!tune) {
      throw new Error(`Missing tune "${slug}" while building preview view.`);
    }

    const theSessionLink = tune.links.find(
      (link) => link.provider === "the-session",
    );
    const versions = tune.versions.map((version) =>
      buildPreviewTuneVersion(version),
    );
    const hasStructuredVersions =
      versions.length > 1 ||
      tune.versions.some(
        (version) =>
          version.links.length > 0 || versionHasExplicitPartStructure(version),
      );

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
      links: tune.links,
      theSessionLink,
      versions,
      hasStructuredVersions,
      workingNotes: tune.workingNotes,
      setMemberships: previewTuneMemberships.get(tune.slug) ?? [],
    };
  }

  function buildPublicTuneView(slug: string): PublicTuneView {
    const tune = publicTunesBySlug.get(slug);

    if (!tune) {
      throw new Error(
        `Missing public tune "${slug}" while building public view.`,
      );
    }

    const setMemberships = publicTuneMemberships.get(tune.slug) ?? [];

    return {
      id: tune.slug,
      slug: tune.slug,
      name: tune.title,
      summary: summarizeNotes(tune.notes),
      notes: tune.notes,
      aliases: tune.aliases,
      tuneType: tune.tuneType,
      chart: {
        title: tune.title,
        key: tune.key,
        mode: tune.mode,
        meter: getDisplayMeter(tune.meter),
        contentMarkdown: tune.chart,
      },
      setNames: setMemberships.map((setMembership) => setMembership.name),
      setMemberships,
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
      entries: buildSetEntries(
        setDocument,
        tunesBySlug,
        `Preview set "${setDocument.slug}"`,
      ),
    };
  }

  function buildPublicSetView(slug: string): PublicSetView {
    const setDocument = publicSetsBySlug.get(slug);

    if (!setDocument) {
      throw new Error(
        `Missing public set "${slug}" while building public view.`,
      );
    }

    return {
      id: setDocument.slug,
      slug: setDocument.slug,
      name: setDocument.title,
      summary: summarizeNotes(setDocument.notes),
      notes: setDocument.notes,
      entries: buildSetEntries(
        setDocument,
        publicTunesBySlug,
        `Public set "${setDocument.slug}"`,
      ),
    };
  }

  function buildPublicSessionView(slug: string): PublicSessionView {
    const session = publicSessionsBySlug.get(slug);

    if (!session) {
      throw new Error(
        `Missing public session "${slug}" while building public view.`,
      );
    }

    return {
      id: session.slug,
      slug: session.slug,
      name: session.title,
      date: session.date,
      notes: session.notes,
      sections: session.sections.map((section) => ({
        heading: section.heading,
        sets: buildSessionSectionSets(section.setSlugs, getPublicSetView),
      })),
    };
  }

  const previewTunes = corpus.tunes.map((tune) =>
    buildPreviewTuneView(tune.slug),
  );
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

  const publicTuneViews = publicTunes.map((tune) =>
    buildPublicTuneView(tune.slug),
  );
  const publicSetViews = publicSets.map((setDocument) =>
    buildPublicSetView(setDocument.slug),
  );
  const publicSetViewsBySlug = new Map(
    publicSetViews.map((setView) => [setView.slug, setView]),
  );

  function getPublicSetView(slug: string): PublicSetView {
    const setView = publicSetViewsBySlug.get(slug);

    if (!setView) {
      throw new Error(
        `Missing public set "${slug}" while building public session view.`,
      );
    }

    return setView;
  }

  const publicSessionViews = publicSessions.map((session) =>
    buildPublicSessionView(session.slug),
  );
  const publicSessionViewsBySlug = new Map(
    publicSessionViews.map((session) => [session.slug, session]),
  );
  const publicSessionsList = publicSessionViews.map((session) => ({
    id: session.id,
    slug: session.slug,
    name: session.name,
    date: session.date,
    sectionCount: session.sections.length,
    setCount: session.sections.reduce(
      (count, section) => count + section.sets.length,
      0,
    ),
  }));

  return {
    getCatalogSummary: () => ({
      tuneCount: previewTunes.length,
      setCount: previewSets.length,
      sessionCount: previewSessions.length,
    }),
    getPublicCatalogSummary: () => ({
      publicTuneCount: publicTuneViews.length,
      publicSetCount: publicSetViews.length,
      publicSessionCount: publicSessionViews.length,
      chartCount: publicTuneViews.length,
    }),
    listPreviewTunes: () => previewTunes,
    getPreviewTuneBySlug: (slug) =>
      previewTunes.find((tune) => tune.slug === slug),
    listPreviewSets: () => previewSets,
    getPreviewSetBySlug: (slug) =>
      previewSets.find((setView) => setView.slug === slug),
    listPreviewSessions: () => previewSessions,
    getPreviewSessionBySlug: (slug) => {
      const session = sessionsBySlug.get(slug);

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
          sets: buildSessionSectionSets(section.setSlugs, buildPreviewSetView),
        })),
      };
    },
    listPublicTunes: () => publicTuneViews,
    getPublicTuneBySlug: (slug) =>
      publicTuneViews.find((tune) => tune.slug === slug),
    listPublicSets: () => publicSetViews,
    getPublicSetBySlug: (slug) =>
      publicSetViews.find((setView) => setView.slug === slug),
    listPublicSessions: () => publicSessionsList,
    getPublicSessionBySlug: (slug) => publicSessionViewsBySlug.get(slug),
  };
}
