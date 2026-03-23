import { readFileSync } from "node:fs";
import path from "node:path";

import {
  expectedExcludedSourceTitles,
  stPaddysDayGigMetadata,
} from "@/data/release-1/import-metadata";
import { normalizeSearchTerm } from "@/lib/release-1/normalize-search-term";
import {
  release1StoreSchema,
  type Release1Store,
  type SetRecord,
  type TuneAliasRecord,
  type TuneRecord,
} from "@/lib/release-1/schema";

const canonicalSourcePath = "Sessions/chyunes_mbys.md";
const firstFallbackSourcePath = "Sessions/2026-01_first_friday_jam.md";
const secondFallbackSourcePath = "Sessions/2025-12_first_friday_jam.md";

type ParsedTune = {
  title: string;
  keyDescriptor?: string;
  chartMarkdown?: string;
  notes: string[];
  sectionHeading: string;
  sourceFile: string;
};

type ParsedGroup = {
  sourceFile: string;
  sectionHeading: string;
  dropMarked: boolean;
  order: number;
  tunes: ParsedTune[];
};

type BuildRelease1ImportResult = {
  store: Release1Store;
  excludedSourceTitles: string[];
};

function toAscii(value: string): string {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
}

export function slugify(value: string): string {
  return toAscii(value)
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

// Article stripping deliberately treats "the"/"a"/"an" variants as the same
// source identity so canonical and fallback chart names can merge cleanly.
function toIdentityKey(value: string): string {
  return toAscii(value)
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter((part) => !["a", "an", "the"].includes(part))
    .join(" ");
}

function normalizeChartMarkdown(value: string): string {
  return value
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .join("\n")
    .trim();
}

function toWordSet(value: string): Set<string> {
  return new Set(
    toAscii(value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim()
      .split(/\s+/)
      .filter(Boolean),
  );
}

function matchTuneTitle(value: string): RegExpMatchArray | null {
  return value.match(/^\*\*(.+?)\*\*\s*(?:\(([^)]+)\))?\s*$/);
}

function readSourceFile(repoRoot: string, sourcePath: string): string {
  return readFileSync(path.join(repoRoot, sourcePath), "utf8");
}

function inferDefaultFamily(sectionHeading: string): string {
  const normalized = toAscii(sectionHeading).toLowerCase();
  const familySource = normalized.split(/->|→/).at(-1)?.trim() ?? normalized;

  if (familySource.includes("jig")) {
    return "Jig";
  }

  if (familySource.includes("hornpipe")) {
    return "Hornpipe";
  }

  if (familySource.includes("waltz")) {
    return "Waltz";
  }

  if (familySource.includes("polka")) {
    return "Polka";
  }

  if (familySource.includes("slide")) {
    return "Slide";
  }

  if (familySource.includes("air")) {
    return "Air";
  }

  if (familySource.includes("fling")) {
    return "Fling";
  }

  if (familySource.includes("strathspey")) {
    return "Strathspey";
  }

  return "Reel";
}

export function inferTuneType(
  title: string,
  sectionHeading: string,
  keyDescriptor?: string,
): string {
  const descriptorWords = toWordSet(keyDescriptor ?? "");
  const titleWords = toWordSet(title);

  if (descriptorWords.has("strathspey") || titleWords.has("strathspey")) {
    return "Strathspey";
  }

  if (descriptorWords.has("hornpipe") || titleWords.has("hornpipe")) {
    return "Hornpipe";
  }

  if (titleWords.has("waltz")) {
    return "Waltz";
  }

  if (titleWords.has("polka")) {
    return "Polka";
  }

  if (titleWords.has("slide")) {
    return "Slide";
  }

  if (titleWords.has("fling")) {
    return "Fling";
  }

  if (titleWords.has("jig")) {
    return "Jig";
  }

  if (titleWords.has("reel")) {
    return "Reel";
  }

  if (titleWords.has("air")) {
    return "Air";
  }

  return inferDefaultFamily(sectionHeading);
}

function inferMeter(tuneType: string): string {
  switch (tuneType) {
    case "Jig":
      return "6/8";
    case "Waltz":
    case "Air":
      return "3/4";
    case "Polka":
      return "2/4";
    case "Slide":
      return "12/8";
    default:
      return "4/4";
  }
}

export function parseKeyAndMode(keyDescriptor?: string): {
  key: string;
  mode: string;
} {
  const descriptor = toAscii(keyDescriptor ?? "").trim();

  if (!descriptor) {
    return { key: "Unknown", mode: "Unknown" };
  }

  const firstToken = descriptor.split(/\s+/)[0] ?? descriptor;
  const match = firstToken.match(/^([A-G][b#]?)(.*)$/i);

  if (!match) {
    return { key: descriptor, mode: "Unknown" };
  }

  const key = match[1].charAt(0).toUpperCase() + match[1].slice(1);
  const suffix = match[2].toLowerCase();

  if (suffix.includes("dor")) {
    return { key, mode: "Dorian" };
  }

  if (suffix.includes("mix")) {
    return { key, mode: "Mixolydian" };
  }

  if (suffix.includes("m")) {
    return { key, mode: "Minor" };
  }

  return { key, mode: "Major" };
}

function parseStructuredSource(
  content: string,
  sourceFile: string,
): ParsedGroup[] {
  const lines = content.split(/\r?\n/);
  const groups: ParsedGroup[] = [];
  let currentSectionHeading = "Imported source";
  let currentGroup: ParsedGroup | null = null;
  let currentTune: ParsedTune | null = null;
  let nextGroupDrop = false;
  let groupOrder = 0;

  const finalizeTune = () => {
    if (!currentTune) {
      return;
    }

    if (!currentGroup) {
      groupOrder += 1;
      currentGroup = {
        sourceFile,
        sectionHeading: currentSectionHeading,
        dropMarked: nextGroupDrop,
        order: groupOrder,
        tunes: [],
      };
      nextGroupDrop = false;
    }

    currentGroup.tunes.push(currentTune);
    currentTune = null;
  };

  const finalizeGroup = () => {
    finalizeTune();

    if (currentGroup && currentGroup.tunes.length > 0) {
      groups.push(currentGroup);
    }

    currentGroup = null;
  };

  for (let index = 0; index < lines.length; index += 1) {
    const rawLine = lines[index] ?? "";
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    if (!trimmed) {
      continue;
    }

    if (trimmed.startsWith("## ")) {
      finalizeGroup();
      currentSectionHeading = trimmed.slice(3).trim();
      continue;
    }

    if (trimmed === "---") {
      finalizeGroup();
      continue;
    }

    if (trimmed === "[drop]") {
      finalizeGroup();
      nextGroupDrop = true;
      continue;
    }

    const titleMatch = matchTuneTitle(trimmed);

    if (titleMatch) {
      finalizeTune();
      currentTune = {
        title: titleMatch[1].trim(),
        keyDescriptor: titleMatch[2]?.trim(),
        notes: [],
        sectionHeading: currentSectionHeading,
        sourceFile,
      };
      continue;
    }

    if (!currentTune) {
      continue;
    }

    if (trimmed === "```") {
      const chartLines: string[] = [];

      for (index += 1; index < lines.length; index += 1) {
        const chartLine = (lines[index] ?? "").trimEnd();

        if (chartLine.trim() === "```") {
          break;
        }

        chartLines.push(chartLine);
      }

      currentTune.chartMarkdown = normalizeChartMarkdown(chartLines.join("\n"));
      continue;
    }

    if (trimmed.startsWith(">")) {
      currentTune.notes.push(trimmed.replace(/^>\s?/, ""));
      continue;
    }

    if (trimmed.startsWith("(")) {
      currentTune.notes.push(trimmed);
    }
  }

  finalizeGroup();
  return groups;
}

function parseInlineFallbackSource(
  content: string,
  sourceFile: string,
): ParsedTune[] {
  const lines = content.split(/\r?\n/);
  const tunes: ParsedTune[] = [];
  let currentSectionHeading = "Imported source";
  let currentTune: ParsedTune | null = null;
  let chartLines: string[] = [];

  const finalizeTune = () => {
    if (!currentTune) {
      return;
    }

    if (chartLines.length > 0) {
      currentTune.chartMarkdown = normalizeChartMarkdown(chartLines.join("\n"));
    }

    tunes.push(currentTune);
    currentTune = null;
    chartLines = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    if (!trimmed) {
      continue;
    }

    if (trimmed.startsWith("#")) {
      finalizeTune();
      currentSectionHeading = trimmed.replace(/^#+\s*/, "");
      continue;
    }

    const titleMatch = matchTuneTitle(trimmed);

    if (titleMatch) {
      finalizeTune();
      currentTune = {
        title: titleMatch[1].trim(),
        keyDescriptor: titleMatch[2]?.trim(),
        notes: [],
        sectionHeading: currentSectionHeading,
        sourceFile,
      };
      continue;
    }

    if (!currentTune) {
      continue;
    }

    if (trimmed.startsWith(">") || trimmed.startsWith("(")) {
      currentTune.notes.push(trimmed.replace(/^>\s?/, ""));
      continue;
    }

    if (trimmed.includes("|")) {
      chartLines.push(trimmed);
    }
  }

  finalizeTune();
  return tunes;
}

function buildFallbackChartMap(repoRoot: string): Map<string, ParsedTune[]> {
  const fallbackMap = new Map<string, ParsedTune[]>();

  const structuredFallbackTunes = parseStructuredSource(
    readSourceFile(repoRoot, firstFallbackSourcePath),
    firstFallbackSourcePath,
  ).flatMap((group) => group.tunes);
  const inlineFallbackTunes = parseInlineFallbackSource(
    readSourceFile(repoRoot, secondFallbackSourcePath),
    secondFallbackSourcePath,
  );

  for (const tune of [...structuredFallbackTunes, ...inlineFallbackTunes]) {
    if (!tune.chartMarkdown) {
      continue;
    }

    const identityKey = toIdentityKey(tune.title);
    const variants = fallbackMap.get(identityKey) ?? [];
    variants.push(tune);
    fallbackMap.set(identityKey, variants);
  }

  return fallbackMap;
}

function buildTuneSummary(
  tune: ParsedTune,
  fallbackSourceFile?: string,
): string {
  const parts = [`Imported from ${canonicalSourcePath}.`];

  if (fallbackSourceFile) {
    parts.push(`Chart content recovered from ${fallbackSourceFile}.`);
  }

  if (tune.notes[0]) {
    parts.push(tune.notes[0]);
  }

  return parts.join(" ");
}

function buildSetSummary(
  group: ParsedGroup,
  omittedTitleCount: number,
): string {
  const parts = [
    `Imported from the ${group.sectionHeading} section of ${canonicalSourcePath}.`,
  ];

  if (group.dropMarked) {
    parts.push("Marked [drop] in the source.");
  }

  if (omittedTitleCount > 0) {
    parts.push(
      `${omittedTitleCount} source title${omittedTitleCount === 1 ? "" : "s"} in this group could not be imported because no recoverable chart content exists.`,
    );
  }

  return parts.join(" ");
}

export function allocateSetId(
  baseSlug: string,
  sectionHeading: string,
  groupOrder: number,
  usedIds: Set<string>,
): string {
  if (!usedIds.has(baseSlug)) {
    usedIds.add(baseSlug);
    return baseSlug;
  }

  const fallbackBase = `${slugify(sectionHeading)}-${groupOrder}`;

  if (!usedIds.has(fallbackBase)) {
    usedIds.add(fallbackBase);
    return fallbackBase;
  }

  let suffix = 2;
  while (usedIds.has(`${fallbackBase}-${suffix}`)) {
    suffix += 1;
  }

  const resolved = `${fallbackBase}-${suffix}`;
  usedIds.add(resolved);
  return resolved;
}

export function buildAliasRecords(
  importedTunes: TuneRecord[],
  fallbackChartsByIdentity: Map<string, Array<{ title: string }>>,
): TuneAliasRecord[] {
  const tuneIdByLookupTerm = new Map<string, string>();
  const aliases: TuneAliasRecord[] = [];
  const usedAliasIds = new Set<string>();
  const importedByIdentity = new Map(
    importedTunes.map((tune) => [toIdentityKey(tune.name), tune]),
  );

  for (const tune of importedTunes) {
    const lookupTerm = normalizeSearchTerm(tune.name);
    const existingTuneId = tuneIdByLookupTerm.get(lookupTerm);

    if (existingTuneId && existingTuneId !== tune.id) {
      throw new Error(
        `Primary tune name collision while importing Release 1 sources: ${tune.name} conflicts with ${existingTuneId}`,
      );
    }

    tuneIdByLookupTerm.set(lookupTerm, tune.id);
  }

  for (const [identityKey, tune] of importedByIdentity) {
    const fallbackVariants = fallbackChartsByIdentity.get(identityKey) ?? [];

    for (const variant of fallbackVariants) {
      const normalizedAlias = normalizeSearchTerm(variant.title);
      const normalizedTuneName = normalizeSearchTerm(tune.name);

      if (!normalizedAlias || normalizedAlias === normalizedTuneName) {
        continue;
      }

      const existingTuneId = tuneIdByLookupTerm.get(normalizedAlias);

      if (existingTuneId && existingTuneId !== tune.id) {
        throw new Error(
          `Alias collision while importing Release 1 sources: ${variant.title} conflicts with ${existingTuneId}`,
        );
      }

      if (existingTuneId === tune.id) {
        continue;
      }

      const baseAliasId = `${tune.id}-${slugify(variant.title)}`;
      let aliasId = baseAliasId;
      let suffix = 2;

      while (usedAliasIds.has(aliasId)) {
        aliasId = `${baseAliasId}-${suffix}`;
        suffix += 1;
      }

      usedAliasIds.add(aliasId);
      tuneIdByLookupTerm.set(normalizedAlias, tune.id);
      aliases.push({
        id: aliasId,
        tuneId: tune.id,
        name: variant.title,
        normalizedName: normalizedAlias,
      });
    }
  }

  return aliases.sort(
    (left, right) =>
      left.normalizedName.localeCompare(right.normalizedName) ||
      left.tuneId.localeCompare(right.tuneId),
  );
}

export function buildRelease1Import(
  repoRoot = process.cwd(),
): BuildRelease1ImportResult {
  const canonicalGroups = parseStructuredSource(
    readSourceFile(repoRoot, canonicalSourcePath),
    canonicalSourcePath,
  );
  const fallbackChartsByIdentity = buildFallbackChartMap(repoRoot);

  const importedTunes: TuneRecord[] = [];
  const charts: Release1Store["charts"] = [];
  const tuneIdByIdentity = new Map<string, string>();
  const chartIdByTuneId = new Map<string, string>();
  const excludedSourceTitles: string[] = [];

  for (const group of canonicalGroups) {
    for (const sourceTune of group.tunes) {
      const identityKey = toIdentityKey(sourceTune.title);

      if (tuneIdByIdentity.has(identityKey)) {
        continue;
      }

      const fallbackTune = fallbackChartsByIdentity.get(identityKey)?.[0];
      const chartMarkdown =
        sourceTune.chartMarkdown ?? fallbackTune?.chartMarkdown;

      if (!chartMarkdown) {
        excludedSourceTitles.push(sourceTune.title);
        continue;
      }

      const tuneId = slugify(sourceTune.title);
      const chartId = `${tuneId}-chart`;
      const tuneType = inferTuneType(
        sourceTune.title,
        sourceTune.sectionHeading,
        sourceTune.keyDescriptor,
      );
      const meter = inferMeter(tuneType);
      const keyMode = parseKeyAndMode(
        sourceTune.keyDescriptor ?? fallbackTune?.keyDescriptor,
      );

      importedTunes.push({
        id: tuneId,
        slug: tuneId,
        name: sourceTune.title,
        tuneType,
        summary: buildTuneSummary(
          sourceTune,
          sourceTune.chartMarkdown ? undefined : fallbackTune?.sourceFile,
        ),
      });
      charts.push({
        id: chartId,
        slug: chartId,
        tuneId,
        title: sourceTune.title,
        key: keyMode.key,
        mode: keyMode.mode,
        meter,
        contentMarkdown: normalizeChartMarkdown(chartMarkdown),
        visibility: "public",
      });
      tuneIdByIdentity.set(identityKey, tuneId);
      chartIdByTuneId.set(tuneId, chartId);
    }
  }

  const tuneAliases = buildAliasRecords(
    importedTunes,
    fallbackChartsByIdentity,
  );
  const importedSets: SetRecord[] = [];
  const setIds = new Set<string>();
  const gigSheetEntries: Release1Store["gigSheets"][number]["entries"] = [];

  for (const group of canonicalGroups) {
    const survivingTunes = group.tunes.filter((sourceTune) =>
      tuneIdByIdentity.has(toIdentityKey(sourceTune.title)),
    );

    if (survivingTunes.length === 0) {
      continue;
    }

    const entries = survivingTunes.map((sourceTune, index) => {
      const tuneId = tuneIdByIdentity.get(toIdentityKey(sourceTune.title));

      if (!tuneId) {
        throw new Error(`Missing imported tune for ${sourceTune.title}`);
      }

      const chartId = chartIdByTuneId.get(tuneId);

      if (!chartId) {
        throw new Error(`Missing imported chart for ${sourceTune.title}`);
      }

      return {
        position: index + 1,
        tuneId,
        chartId,
      };
    });

    const setName = survivingTunes.map((tune) => tune.title).join(" / ");
    const baseSetId = entries.map((entry) => entry.tuneId).join("-");
    const setId = allocateSetId(
      baseSetId,
      group.sectionHeading,
      group.order,
      setIds,
    );
    const setRecord: SetRecord = {
      id: setId,
      slug: setId,
      name: setName,
      summary: buildSetSummary(
        group,
        group.tunes.length - survivingTunes.length,
      ),
      visibility: "public",
      entries,
    };

    importedSets.push(setRecord);

    if (
      !group.dropMarked ||
      stPaddysDayGigMetadata.includeDropMarkedSourceGroups
    ) {
      gigSheetEntries.push({
        position: gigSheetEntries.length + 1,
        setId,
      });
    }
  }

  const excludedSorted = [...excludedSourceTitles].sort((left, right) =>
    left.localeCompare(right),
  );
  const expectedSorted = [...expectedExcludedSourceTitles].sort((left, right) =>
    left.localeCompare(right),
  );

  if (JSON.stringify(excludedSorted) !== JSON.stringify(expectedSorted)) {
    throw new Error(
      `Excluded source titles drifted from import metadata. Expected ${expectedSorted.join(", ")} but saw ${excludedSorted.join(", ")}.`,
    );
  }

  const store = release1StoreSchema.parse({
    tunes: importedTunes,
    tuneAliases,
    charts,
    sets: importedSets,
    gigSheets: [
      {
        id: stPaddysDayGigMetadata.id,
        slug: stPaddysDayGigMetadata.slug,
        name: stPaddysDayGigMetadata.name,
        summary: stPaddysDayGigMetadata.summary,
        visibility: "private",
        entries: gigSheetEntries,
      },
    ],
  });

  return {
    store,
    excludedSourceTitles: excludedSorted,
  };
}
