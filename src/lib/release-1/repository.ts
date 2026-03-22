import { release1FixtureStore } from "@/data/release-1/fixture-store";
import {
  type ChartRecord,
  type Release1Store,
  type SetEntryRecord,
  type SetRecord,
  type TuneAliasRecord,
  type TuneRecord,
  release1StoreSchema,
} from "@/lib/release-1/schema";

export type CatalogSummary = {
  publicTuneCount: number;
  aliasCount: number;
  chartCount: number;
  publicSetCount: number;
  privateGigSheetCount: number;
};

export type PublicTuneView = {
  id: string;
  slug: string;
  name: string;
  tuneType: string;
  summary: string;
  aliases: string[];
  chart: {
    title: string;
    key: string;
    mode: string;
    meter: string;
    contentMarkdown: string;
  };
  setNames: string[];
};

export type PublicSetView = {
  id: string;
  slug: string;
  name: string;
  summary: string;
  entries: Array<{
    position: number;
    tuneName: string;
    chartTitle: string;
    key: string;
    mode: string;
    meter: string;
  }>;
};

export type PrivateGigSheetView = {
  id: string;
  slug: string;
  name: string;
  summary: string;
  visibility: "private";
  entries: Array<{
    position: number;
    setName: string;
    setSummary: string;
    tuneNames: string[];
    transitionNotes?: string;
  }>;
};

export type Release1Repository = {
  getCatalogSummary: () => CatalogSummary;
  listPublicTunes: () => PublicTuneView[];
  listPublicSets: () => PublicSetView[];
  findPublicTuneByAlias: (term: string) => PublicTuneView | undefined;
  getPrivateGigSheetBySlug: (slug: string) => PrivateGigSheetView | undefined;
};

function normalizeSearchTerm(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildIdMap<T extends { id: string }>(records: T[], label: string): Map<string, T> {
  const map = new Map<string, T>();

  for (const record of records) {
    if (map.has(record.id)) {
      throw new Error(`Duplicate ${label} id: ${record.id}`);
    }

    map.set(record.id, record);
  }

  return map;
}

function buildSlugMap<T extends { slug: string }>(records: T[], label: string): Map<string, T> {
  const map = new Map<string, T>();

  for (const record of records) {
    if (map.has(record.slug)) {
      throw new Error(`Duplicate ${label} slug: ${record.slug}`);
    }

    map.set(record.slug, record);
  }

  return map;
}

function assertSortedPositions(entries: Array<{ position: number }>, label: string) {
  const positions = entries.map((entry) => entry.position);
  const uniquePositions = new Set(positions);

  if (uniquePositions.size !== entries.length) {
    throw new Error(`${label} contains duplicate positions`);
  }
}

function assertAliasInvariants(tunes: Map<string, TuneRecord>, aliases: TuneAliasRecord[]) {
  for (const alias of aliases) {
    if (!tunes.has(alias.tuneId)) {
      throw new Error(`Alias ${alias.id} references unknown tune ${alias.tuneId}`);
    }

    if (alias.normalizedName !== normalizeSearchTerm(alias.name)) {
      throw new Error(`Alias ${alias.id} does not match its normalizedName`);
    }
  }
}

function assertChartInvariants(tunes: Map<string, TuneRecord>, charts: ChartRecord[]) {
  const chartCountByTuneId = new Map<string, number>();

  for (const chart of charts) {
    if (!tunes.has(chart.tuneId)) {
      throw new Error(`Chart ${chart.id} references unknown tune ${chart.tuneId}`);
    }

    if (chart.visibility === "private") {
      throw new Error(`Catalog charts must not be private (${chart.id})`);
    }

    chartCountByTuneId.set(chart.tuneId, (chartCountByTuneId.get(chart.tuneId) ?? 0) + 1);
  }

  for (const tune of tunes.values()) {
    if (chartCountByTuneId.get(tune.id) !== 1) {
      throw new Error(`Release 1 fixtures must provide exactly one chart for tune ${tune.id}`);
    }
  }
}

function assertSetInvariants(
  tunes: Map<string, TuneRecord>,
  charts: Map<string, ChartRecord>,
  sets: SetRecord[],
) {
  for (const setRecord of sets) {
    if (setRecord.visibility === "private") {
      throw new Error(`Catalog sets must not be private (${setRecord.id})`);
    }

    assertSortedPositions(setRecord.entries, `Set ${setRecord.id}`);

    for (const entry of setRecord.entries) {
      const tune = tunes.get(entry.tuneId);
      const chart = charts.get(entry.chartId);

      if (!tune) {
        throw new Error(`Set ${setRecord.id} references unknown tune ${entry.tuneId}`);
      }

      if (!chart) {
        throw new Error(`Set ${setRecord.id} references unknown chart ${entry.chartId}`);
      }

      if (chart.tuneId !== tune.id) {
        throw new Error(`Set ${setRecord.id} mismatches tune ${tune.id} and chart ${chart.id}`);
      }
    }
  }
}

function assertGigSheetInvariants(store: Release1Store, sets: Map<string, SetRecord>) {
  for (const gigSheet of store.gigSheets) {
    if (gigSheet.visibility !== "private") {
      throw new Error(`Gig sheets must stay private (${gigSheet.id})`);
    }

    assertSortedPositions(gigSheet.entries, `Gig sheet ${gigSheet.id}`);

    for (const entry of gigSheet.entries) {
      if (!sets.has(entry.setId)) {
        throw new Error(`Gig sheet ${gigSheet.id} references unknown set ${entry.setId}`);
      }
    }
  }
}

function sortEntries<T extends { position: number }>(entries: T[]): T[] {
  return [...entries].sort((left, right) => left.position - right.position);
}

function createSetNamesByTune(entriesBySet: SetRecord[], chartsById: Map<string, ChartRecord>) {
  const namesByTuneId = new Map<string, string[]>();

  for (const setRecord of entriesBySet) {
    for (const entry of setRecord.entries) {
      if (!chartsById.has(entry.chartId)) {
        continue;
      }

      const setNames = namesByTuneId.get(entry.tuneId) ?? [];
      setNames.push(setRecord.name);
      namesByTuneId.set(entry.tuneId, setNames);
    }
  }

  return namesByTuneId;
}

function resolveSetEntry(
  entry: SetEntryRecord,
  tunesById: Map<string, TuneRecord>,
  chartsById: Map<string, ChartRecord>,
) {
  const tune = tunesById.get(entry.tuneId);
  const chart = chartsById.get(entry.chartId);

  if (!tune || !chart) {
    throw new Error(`Unable to resolve set entry ${entry.chartId}`);
  }

  return {
    position: entry.position,
    tuneName: tune.name,
    chartTitle: chart.title,
    key: chart.key,
    mode: chart.mode,
    meter: chart.meter,
  };
}

export function createRelease1Repository(input: unknown = release1FixtureStore): Release1Repository {
  const store = release1StoreSchema.parse(input);

  const tunesById = buildIdMap(store.tunes, "tune");
  const chartsById = buildIdMap(store.charts, "chart");
  const setsById = buildIdMap(store.sets, "set");
  const gigSheetsBySlug = buildSlugMap(store.gigSheets, "gig sheet");
  const aliasesByTuneId = new Map<string, string[]>();

  assertAliasInvariants(tunesById, store.tuneAliases);
  assertChartInvariants(tunesById, store.charts);
  assertSetInvariants(tunesById, chartsById, store.sets);
  assertGigSheetInvariants(store, setsById);

  for (const alias of store.tuneAliases) {
    const aliases = aliasesByTuneId.get(alias.tuneId) ?? [];
    aliases.push(alias.name);
    aliasesByTuneId.set(alias.tuneId, aliases);
  }

  const setNamesByTuneId = createSetNamesByTune(store.sets, chartsById);

  const publicTunes = store.tunes
    .map((tune) => {
      const chart = store.charts.find((candidate) => candidate.tuneId === tune.id);

      if (!chart) {
        throw new Error(`Missing chart for tune ${tune.id}`);
      }

      return {
        id: tune.id,
        slug: tune.slug,
        name: tune.name,
        tuneType: tune.tuneType,
        summary: tune.summary,
        aliases: aliasesByTuneId.get(tune.id) ?? [],
        chart: {
          title: chart.title,
          key: chart.key,
          mode: chart.mode,
          meter: chart.meter,
          contentMarkdown: chart.contentMarkdown,
        },
        setNames: setNamesByTuneId.get(tune.id) ?? [],
      };
    })
    .sort((left, right) => left.name.localeCompare(right.name));

  const publicSets = store.sets.map((setRecord) => ({
    id: setRecord.id,
    slug: setRecord.slug,
    name: setRecord.name,
    summary: setRecord.summary,
    entries: sortEntries(setRecord.entries).map((entry) =>
      resolveSetEntry(entry, tunesById, chartsById),
    ),
  }));

  const publicTunesById = buildIdMap(publicTunes, "public tune view");

  return {
    getCatalogSummary() {
      return {
        publicTuneCount: store.tunes.length,
        aliasCount: store.tuneAliases.length,
        chartCount: store.charts.length,
        publicSetCount: store.sets.length,
        privateGigSheetCount: store.gigSheets.length,
      };
    },
    listPublicTunes() {
      return publicTunes;
    },
    listPublicSets() {
      return publicSets;
    },
    findPublicTuneByAlias(term: string) {
      const normalizedTerm = normalizeSearchTerm(term);
      const directTune = publicTunes.find(
        (tune) =>
          tune.slug === normalizedTerm.replace(/\s+/g, "-") ||
          normalizeSearchTerm(tune.name) === normalizedTerm,
      );

      if (directTune) {
        return directTune;
      }

      const aliasRecord = store.tuneAliases.find(
        (alias) => alias.normalizedName === normalizedTerm,
      );

      if (!aliasRecord) {
        return undefined;
      }

      return publicTunesById.get(aliasRecord.tuneId);
    },
    getPrivateGigSheetBySlug(slug: string) {
      const gigSheet = gigSheetsBySlug.get(slug);

      if (!gigSheet) {
        return undefined;
      }

      return {
        id: gigSheet.id,
        slug: gigSheet.slug,
        name: gigSheet.name,
        summary: gigSheet.summary,
        visibility: "private" as const,
        entries: sortEntries(gigSheet.entries).map((entry) => {
          const setRecord = setsById.get(entry.setId);

          if (!setRecord) {
            throw new Error(`Missing set ${entry.setId} for gig sheet ${gigSheet.id}`);
          }

          return {
            position: entry.position,
            setName: setRecord.name,
            setSummary: setRecord.summary,
            tuneNames: sortEntries(setRecord.entries).map(
              (setEntry) => tunesById.get(setEntry.tuneId)?.name ?? setEntry.tuneId,
            ),
            transitionNotes: entry.transitionNotes,
          };
        }),
      };
    },
  };
}

export const release1Repository = createRelease1Repository(release1FixtureStore);
