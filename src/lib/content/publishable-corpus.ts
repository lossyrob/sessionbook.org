import {
  sessionbookCorpusSchema,
  type SessionbookCorpus,
  type SetDocument,
  type TuneDocument,
} from "@/lib/content/schema";
import {
  createImplicitTuneVersion,
  renderTuneVersionChart,
} from "@/lib/content/tune-versions";
import { buildRelease1Import } from "@/lib/release-1/import-source";
import type {
  ChartRecord,
  Release1Store,
  SetRecord,
  TuneAliasRecord,
  TuneRecord,
} from "@/lib/release-1/schema";
import { buildSessionWorkCorpus } from "@/lib/session-work/workflow";

type BuildPublishableCorpusOptions = {
  repoRoot?: string;
  sessionsRoot?: string;
};

function sortDocuments<T extends { slug: string; sourcePath?: string }>(
  documents: T[],
): T[] {
  return [...documents].sort((left, right) =>
    (left.sourcePath ?? left.slug).localeCompare(
      right.sourcePath ?? right.slug,
    ),
  );
}

function mergeBySlugWithOverrides<T extends { slug: string }>(
  baseDocuments: T[],
  overrideDocuments: T[],
): T[] {
  const documentsBySlug = new Map(
    baseDocuments.map((document) => [document.slug, document]),
  );

  for (const document of overrideDocuments) {
    documentsBySlug.set(document.slug, document);
  }

  return sortDocuments([...documentsBySlug.values()]);
}

function buildAliasesByTuneId(
  aliases: TuneAliasRecord[],
): Map<string, TuneAliasRecord[]> {
  const aliasesByTuneId = new Map<string, TuneAliasRecord[]>();

  for (const alias of aliases) {
    const tuneAliases = aliasesByTuneId.get(alias.tuneId) ?? [];
    tuneAliases.push(alias);
    aliasesByTuneId.set(alias.tuneId, tuneAliases);
  }

  return aliasesByTuneId;
}

function buildChartsByTuneId(charts: ChartRecord[]): Map<string, ChartRecord> {
  return new Map(charts.map((chart) => [chart.tuneId, chart]));
}

function inferSetTuneType(
  setRecord: SetRecord,
  tunesById: Map<string, TuneRecord>,
): string | undefined {
  const tuneTypes = new Set(
    setRecord.entries.map((entry) => {
      const tune = tunesById.get(entry.tuneId);

      if (!tune) {
        throw new Error(
          `Release 1 set "${setRecord.slug}" references missing tune "${entry.tuneId}".`,
        );
      }

      return tune.tuneType;
    }),
  );

  if (tuneTypes.size !== 1) {
    return undefined;
  }

  return [...tuneTypes][0];
}

export function createRelease1ContentCorpus(
  store: Release1Store,
): SessionbookCorpus {
  const tunesById = new Map(store.tunes.map((tune) => [tune.id, tune]));
  const aliasesByTuneId = buildAliasesByTuneId(store.tuneAliases);
  const chartsByTuneId = buildChartsByTuneId(store.charts);

  const tunes: TuneDocument[] = store.tunes.map((tune) => {
    const chart = chartsByTuneId.get(tune.id);

    if (!chart) {
      throw new Error(
        `Release 1 tune "${tune.slug}" is missing its chart for content generation.`,
      );
    }

    const implicitVersion = createImplicitTuneVersion(chart.contentMarkdown);
    const defaultVersion = {
      ...implicitVersion,
      parts: implicitVersion.parts.map((part) => ({
        ...part,
        isAlternate: false,
        alternateLabel: undefined,
      })),
    };

    return {
      slug: tune.slug,
      title: tune.name,
      aliases: (aliasesByTuneId.get(tune.id) ?? []).map((alias) => alias.name),
      tuneType: tune.tuneType,
      key: chart.key,
      mode: chart.mode,
      meter: chart.meter,
      visibility: chart.visibility,
      chart: renderTuneVersionChart(defaultVersion),
      versions: [defaultVersion],
      notes: tune.summary,
      links: [],
      workingNotes: "",
      sourcePath: `content/tunes/${tune.slug}.md`,
    };
  });

  const sets: SetDocument[] = store.sets.map((setRecord) => ({
    slug: setRecord.slug,
    title: setRecord.name,
    tuneType: inferSetTuneType(setRecord, tunesById),
    visibility: setRecord.visibility,
    tuneSlugs: setRecord.entries.map((entry) => {
      const tune = tunesById.get(entry.tuneId);

      if (!tune) {
        throw new Error(
          `Release 1 set "${setRecord.slug}" references missing tune "${entry.tuneId}".`,
        );
      }

      return tune.slug;
    }),
    notes: setRecord.summary,
    sourcePath: `content/sets/${setRecord.slug}.md`,
  }));

  return sessionbookCorpusSchema.parse({
    tunes: sortDocuments(tunes),
    sets: sortDocuments(sets),
    sessions: [],
  });
}

export function buildRelease1ContentCorpus(
  repoRoot = process.cwd(),
): SessionbookCorpus {
  return createRelease1ContentCorpus(buildRelease1Import(repoRoot).store);
}

export async function buildPublishableCorpus(
  options?: BuildPublishableCorpusOptions,
): Promise<SessionbookCorpus> {
  const release1Corpus = buildRelease1ContentCorpus(options?.repoRoot);
  const sessionWorkCorpus = await buildSessionWorkCorpus({
    sessionsRoot: options?.sessionsRoot,
  });

  return sessionbookCorpusSchema.parse({
    tunes: mergeBySlugWithOverrides(
      release1Corpus.tunes,
      sessionWorkCorpus.tunes,
    ),
    sets: mergeBySlugWithOverrides(release1Corpus.sets, sessionWorkCorpus.sets),
    sessions: mergeBySlugWithOverrides(
      release1Corpus.sessions,
      sessionWorkCorpus.sessions,
    ),
  });
}
