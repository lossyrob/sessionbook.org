import { normalizeSearchTerm } from "@/lib/search/normalize";

type Searchable = {
  name: string;
  aliases: string[];
};

type MatchRank = "exact" | "prefix" | "substring" | "alias";

const RANK_ORDER: Record<MatchRank, number> = {
  exact: 0,
  prefix: 1,
  substring: 2,
  alias: 3,
};

export type SearchResult<T> = {
  item: T;
  rank: MatchRank;
};

export function searchTunes<T extends Searchable>(
  query: string,
  tunes: T[],
): SearchResult<T>[] {
  const normalizedQuery = normalizeSearchTerm(query);

  if (normalizedQuery.length === 0) {
    return [];
  }

  const results: SearchResult<T>[] = [];

  for (const tune of tunes) {
    const normalizedName = normalizeSearchTerm(tune.name);

    // Check name match tiers
    if (normalizedName === normalizedQuery) {
      results.push({ item: tune, rank: "exact" });
      continue;
    }

    if (normalizedName.startsWith(normalizedQuery)) {
      results.push({ item: tune, rank: "prefix" });
      continue;
    }

    if (normalizedName.includes(normalizedQuery)) {
      results.push({ item: tune, rank: "substring" });
      continue;
    }

    // Check alias matches
    let aliasMatch = false;
    for (const alias of tune.aliases) {
      const normalizedAlias = normalizeSearchTerm(alias);
      if (
        normalizedAlias === normalizedQuery ||
        normalizedAlias.startsWith(normalizedQuery) ||
        normalizedAlias.includes(normalizedQuery)
      ) {
        aliasMatch = true;
        break;
      }
    }

    if (aliasMatch) {
      results.push({ item: tune, rank: "alias" });
    }
  }

  // Sort by rank order, then alphabetically by name within same rank
  results.sort((a, b) => {
    const rankDiff = RANK_ORDER[a.rank] - RANK_ORDER[b.rank];
    if (rankDiff !== 0) return rankDiff;
    return a.item.name.localeCompare(b.item.name);
  });

  return results;
}
