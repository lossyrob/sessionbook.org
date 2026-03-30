import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import {
  sessionbookCorpusSchema,
  type SessionDocument,
  type SessionSection,
  type SessionbookCorpus,
  type SetDocument,
  type TuneDocument,
} from "@/lib/content/schema";
import {
  isLikelyTuneLinkHref,
  parseTuneLinkValue,
  renderTuneLinksBlock,
  type TuneLink,
} from "@/lib/content/tune-links";
import {
  createImplicitTuneVersion,
  defaultTuneVersionLabel,
  parseTuneVersionBlocks,
  renderTuneVersionBlocks,
  renderTuneVersionChart,
  type TuneVersion,
} from "@/lib/content/tune-versions";
import { parseKeyAndMode, slugify } from "@/lib/release-1/import-source";

const sessionWorkSuffix = "_session_work.md";
const defaultSessionsRoot = path.join(process.cwd(), "Sessions");

type SessionWorkSeedTune = {
  title: string;
  keyDescriptor?: string;
};

type SessionWorkSeedSet = {
  tunes: SessionWorkSeedTune[];
  notes?: string[];
};

type SessionWorkSeedSection = {
  heading: string;
  sets: SessionWorkSeedSet[];
};

export type SessionWorkSeed = {
  title: string;
  authorComments?: string[];
  sessionNotes?: string[];
  sections: SessionWorkSeedSection[];
};

type ParsedSessionWorkTune = {
  title: string;
  aliases: string[];
  displayTitle: string;
  keyDescriptor?: string;
  links: TuneLink[];
  versions: TuneVersion[];
  notes: string;
  tuneType: string;
};

type ParsedSessionWorkSet = {
  notes: string;
  tunes: ParsedSessionWorkTune[];
};

type ParsedSessionWorkSection = {
  heading: string;
  sets: ParsedSessionWorkSet[];
};

export type ParsedSessionWorkDocument = {
  slug: string;
  title: string;
  date?: string;
  sourcePath: string;
  notes: string;
  sections: ParsedSessionWorkSection[];
};

function normalizeLineEndings(value: string): string {
  return value.replace(/\r\n?/g, "\n");
}

function normalizeBlock(value: string): string {
  return value
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trim();
}

function inferTuneType(sectionHeading: string): string {
  const normalized = sectionHeading.trim().toLowerCase();

  switch (normalized) {
    case "jigs":
      return "Jig";
    case "slip jigs":
      return "Slip Jig";
    case "reels":
      return "Reel";
    case "hornpipes":
      return "Hornpipe";
    case "polkas":
      return "Polka";
    default:
      if (normalized.includes("jig")) {
        return "Jig";
      }

      if (normalized.includes("reel")) {
        return "Reel";
      }

      if (normalized.includes("hornpipe")) {
        return "Hornpipe";
      }

      if (normalized.includes("polka")) {
        return "Polka";
      }

      return sectionHeading.trim();
  }
}

function inferMeter(tuneType: string): string | undefined {
  switch (tuneType) {
    case "Jig":
      return "6/8";
    case "Slip Jig":
      return "9/8";
    case "Polka":
      return "2/4";
    case "Reel":
    case "Hornpipe":
      return "4/4";
    default:
      return undefined;
  }
}

function renderMarkedLines(prefix: string, lines: string[]): string[] {
  return lines.map((line) => `${prefix} ${line}`.trimEnd());
}

function renderTitleLine(tune: SessionWorkSeedTune): string {
  if (!tune.keyDescriptor) {
    return `**${tune.title}**`;
  }

  return `**${tune.title}** (${tune.keyDescriptor})`;
}

export function renderSessionWorkDocument(seed: SessionWorkSeed): string {
  const lines: string[] = [`# ${seed.title}`, ""];
  const authorComments = seed.authorComments ?? [
    "Author-only comments start with %% and are ignored during canonicalization.",
    "Published markers: > tune note, >> set note, >>> session note, => tune link.",
    "Structured tune blocks: = version:, = part:, = alt:.",
  ];

  if (authorComments.length > 0) {
    lines.push(...renderMarkedLines("%%", authorComments), "");
  }

  if (seed.sessionNotes && seed.sessionNotes.length > 0) {
    lines.push(...renderMarkedLines(">>>", seed.sessionNotes), "");
  }

  for (const section of seed.sections) {
    lines.push(`## ${section.heading}`, "");

    for (const setDocument of section.sets) {
      lines.push("---", "");

      if (setDocument.notes && setDocument.notes.length > 0) {
        lines.push(...renderMarkedLines(">>", setDocument.notes), "");
      }

      for (const tune of setDocument.tunes) {
        lines.push(renderTitleLine(tune), "", "```", "", "```", "");
      }
    }
  }

  return `${lines.join("\n").trimEnd()}\n`;
}

function isTuneVersionMarker(value: string): boolean {
  return /^=\s*version:/i.test(value);
}

function isTunePartMarker(value: string): boolean {
  return /^=\s*(?:part|alt):/i.test(value);
}

function matchesMarkedPrefix(
  value: string,
  prefix: ">" | ">>" | ">>>",
): boolean {
  if (prefix === ">>>") {
    return value.startsWith(">>>");
  }

  if (prefix === ">>") {
    return value.startsWith(">>") && !value.startsWith(">>>");
  }

  return value.startsWith(">") && !value.startsWith(">>");
}

function collectMarkedBlock(
  lines: string[],
  startIndex: number,
  prefix: ">" | ">>" | ">>>",
): { content: string; lastIndex: number } {
  const blockLines: string[] = [];
  let index = startIndex;

  for (; index < lines.length; index += 1) {
    const rawLine = lines[index] ?? "";
    const trimmed = rawLine.trim();

    if (!trimmed || !matchesMarkedPrefix(trimmed, prefix)) {
      break;
    }

    const withoutPrefix = rawLine
      .replace(new RegExp(`^\\s*${prefix.replace(/\>/g, "\\>")}\\s?`), "")
      .trimEnd();

    blockLines.push(withoutPrefix);
  }

  return {
    content: normalizeBlock(blockLines.join("\n")),
    lastIndex: index - 1,
  };
}

function normalizeChart(value: string): string {
  return normalizeLineEndings(value)
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trim();
}

function promoteLegacySourceLinks(
  notes: string,
  sourcePath: string,
): { notes: string; links: TuneLink[] } {
  if (!notes.trim()) {
    return {
      notes: "",
      links: [],
    };
  }

  const keptLines: string[] = [];
  const links: TuneLink[] = [];

  for (const line of normalizeLineEndings(notes).split("\n")) {
    const trimmed = line.trim();
    const sourceMatch = trimmed.match(/^Source:\s*(.+)$/);
    const sourceValue = sourceMatch?.[1]?.trim();

    if (sourceValue && isLikelyTuneLinkHref(sourceValue)) {
      links.push(parseTuneLinkValue(sourceValue, sourcePath));
      continue;
    }

    keptLines.push(line.trimEnd());
  }

  return {
    notes: normalizeBlock(keptLines.join("\n")),
    links,
  };
}

function parseTuneTitle(
  value: string,
): { title: string; keyDescriptor?: string } | null {
  const match = value.match(/^\*\*(.+?)\*\*\s*(?:\(([^)]+)\))?\s*$/);

  if (!match) {
    return null;
  }

  return {
    title: match[1].trim(),
    keyDescriptor: match[2]?.trim(),
  };
}

function splitAliases(value: string): { title: string; aliases: string[] } {
  const aliases: string[] = [];
  let title = value.trim();

  while (true) {
    const match = title.match(/^(.*?)\s*\(([^()]+)\)\s*$/);

    if (!match || !match[1].trim()) {
      break;
    }

    aliases.unshift(match[2].trim());
    title = match[1].trim();
  }

  return {
    title,
    aliases,
  };
}

function toRelativePath(absolutePath: string): string {
  return path.relative(process.cwd(), absolutePath).replace(/\\/g, "/");
}

function getCanonicalSessionSlug(sourcePath: string): string {
  const basename = path.basename(sourcePath, ".md");

  if (!basename.endsWith("_session_work")) {
    throw new Error(
      `${sourcePath}: session work docs must end with "${sessionWorkSuffix}".`,
    );
  }

  return slugify(basename.slice(0, -"_session_work".length));
}

function getDateFromSlug(slug: string): string | undefined {
  const match = slug.match(/(\d{4}-\d{2}-\d{2})$/);

  return match?.[1];
}

export function parseSessionWorkDocument(args: {
  source: string;
  sourcePath: string;
}): ParsedSessionWorkDocument {
  const lines = normalizeLineEndings(args.source).split("\n");
  const sessionSlug = getCanonicalSessionSlug(args.sourcePath);
  const sessionSections: ParsedSessionWorkSection[] = [];
  const sessionNoteBlocks: string[] = [];
  let title: string | null = null;
  let currentSection: ParsedSessionWorkSection | null = null;
  let currentSet: ParsedSessionWorkSet | null = null;
  let currentTune: {
    displayTitle: string;
    keyDescriptor?: string;
    legacyChart: string;
    links: TuneLink[];
    versionLines: string[];
    notes: string;
    tuneType: string;
  } | null = null;

  const finalizeTune = () => {
    if (!currentTune) {
      return;
    }

    if (!currentSet) {
      throw new Error(
        `${args.sourcePath}: encountered a tune before starting a set.`,
      );
    }

    const { title: parsedTitle, aliases } = splitAliases(
      currentTune.displayTitle,
    );
    const promotedLinks = promoteLegacySourceLinks(
      currentTune.notes,
      args.sourcePath,
    );
    const links = [...currentTune.links];

    for (const link of promotedLinks.links) {
      if (links.some((existingLink) => existingLink.href === link.href)) {
        continue;
      }

      links.push(link);
    }
    const versions =
      currentTune.versionLines.length > 0
        ? parseTuneVersionBlocks({
            source: currentTune.versionLines.join("\n"),
            sourcePath: `${args.sourcePath}: ${currentTune.displayTitle}`,
          })
        : [createImplicitTuneVersion(currentTune.legacyChart)];

    currentSet.tunes.push({
      title: parsedTitle,
      aliases,
      displayTitle: currentTune.displayTitle,
      keyDescriptor: currentTune.keyDescriptor,
      links,
      versions,
      notes: promotedLinks.notes,
      tuneType: currentTune.tuneType,
    });
    currentTune = null;
  };

  const finalizeSet = () => {
    finalizeTune();

    if (!currentSet) {
      return;
    }

    if (currentSet.tunes.length === 0) {
      throw new Error(`${args.sourcePath}: encountered a set with no tunes.`);
    }

    if (!currentSection) {
      throw new Error(
        `${args.sourcePath}: encountered a set before starting a section.`,
      );
    }

    currentSection.sets.push(currentSet);
    currentSet = null;
  };

  const ensureCurrentSection = () => {
    if (!currentSection) {
      throw new Error(
        `${args.sourcePath}: tune content must appear inside a ## section.`,
      );
    }

    return currentSection;
  };

  const ensureCurrentSet = () => {
    const section = ensureCurrentSection();

    if (!currentSet) {
      currentSet = {
        notes: "",
        tunes: [],
      };
      section.sets;
    }

    return currentSet;
  };

  for (let index = 0; index < lines.length; index += 1) {
    const rawLine = lines[index] ?? "";
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    if (!trimmed) {
      continue;
    }

    if (trimmed.startsWith("# ") && !trimmed.startsWith("## ")) {
      title = trimmed.slice(2).trim();
      continue;
    }

    if (trimmed.startsWith("## ")) {
      finalizeSet();

      if (currentSection) {
        sessionSections.push(currentSection);
      }

      currentSection = {
        heading: trimmed.slice(3).trim(),
        sets: [],
      };
      continue;
    }

    if (trimmed === "---") {
      finalizeSet();
      continue;
    }

    if (trimmed.startsWith("%%")) {
      continue;
    }

    if (matchesMarkedPrefix(trimmed, ">>>")) {
      const block = collectMarkedBlock(lines, index, ">>>");
      sessionNoteBlocks.push(block.content);
      index = block.lastIndex;
      continue;
    }

    if (matchesMarkedPrefix(trimmed, ">>")) {
      const block = collectMarkedBlock(lines, index, ">>");
      const setDocument = ensureCurrentSet();
      setDocument.notes = setDocument.notes
        ? `${setDocument.notes}\n\n${block.content}`
        : block.content;
      index = block.lastIndex;
      continue;
    }

    if (matchesMarkedPrefix(trimmed, ">")) {
      if (!currentTune) {
        throw new Error(
          `${args.sourcePath}: tune note encountered before a tune title.`,
        );
      }

      const block = collectMarkedBlock(lines, index, ">");
      currentTune.notes = currentTune.notes
        ? `${currentTune.notes}\n\n${block.content}`
        : block.content;
      index = block.lastIndex;
      continue;
    }

    if (trimmed.startsWith("=>")) {
      if (!currentTune) {
        throw new Error(
          `${args.sourcePath}: tune link encountered before a tune title.`,
        );
      }

      if (currentTune.versionLines.length > 0) {
        currentTune.versionLines.push(trimmed);
      } else {
        currentTune.links.push(
          parseTuneLinkValue(trimmed.slice(2).trim(), args.sourcePath),
        );
      }
      continue;
    }

    if (isTuneVersionMarker(trimmed) || isTunePartMarker(trimmed)) {
      if (!currentTune) {
        throw new Error(
          `${args.sourcePath}: tune version content encountered before a tune title.`,
        );
      }

      if (currentTune.legacyChart) {
        throw new Error(
          `${args.sourcePath}: structured tune versions cannot follow a legacy chart fence in the same tune.`,
        );
      }

      if (currentTune.versionLines.length === 0 && isTunePartMarker(trimmed)) {
        currentTune.versionLines.push(`= version: ${defaultTuneVersionLabel}`);
      }

      currentTune.versionLines.push(trimmed);
      continue;
    }

    const tuneTitle = parseTuneTitle(trimmed);

    if (tuneTitle) {
      finalizeTune();
      const section = ensureCurrentSection();
      ensureCurrentSet();
      currentTune = {
        displayTitle: tuneTitle.title,
        keyDescriptor: tuneTitle.keyDescriptor,
        legacyChart: "",
        links: [],
        versionLines: [],
        notes: "",
        tuneType: inferTuneType(section.heading),
      };
      continue;
    }

    if (trimmed === "```") {
      if (!currentTune) {
        throw new Error(
          `${args.sourcePath}: chart fence encountered before a tune title.`,
        );
      }

      const chartLines: string[] = [];

      for (index += 1; index < lines.length; index += 1) {
        const chartLine = (lines[index] ?? "").trimEnd();

        if (chartLine.trim() === "```") {
          break;
        }

        chartLines.push(chartLine);
      }

      const chart = normalizeChart(chartLines.join("\n"));

      if (currentTune.versionLines.length > 0) {
        currentTune.versionLines.push("```", chart, "```");
        continue;
      }

      currentTune.legacyChart = chart;
      continue;
    }

    throw new Error(
      `${args.sourcePath}: unsupported line outside chart or notes: "${trimmed}".`,
    );
  }

  finalizeSet();

  if (currentSection) {
    sessionSections.push(currentSection);
  }

  if (!title) {
    throw new Error(
      `${args.sourcePath}: expected a top-level "# " session title.`,
    );
  }

  if (sessionSections.length === 0) {
    throw new Error(
      `${args.sourcePath}: expected at least one session section.`,
    );
  }

  return {
    slug: sessionSlug,
    title,
    date: getDateFromSlug(sessionSlug),
    sourcePath: args.sourcePath,
    notes: sessionNoteBlocks.join("\n\n"),
    sections: sessionSections,
  };
}

function mergeBySlug<T extends { slug: string }>(
  collectionName: string,
  existingDocuments: T[],
  incomingDocuments: T[],
): T[] {
  const documentsBySlug = new Map(
    existingDocuments.map((document) => [document.slug, document]),
  );

  for (const incomingDocument of incomingDocuments) {
    const existingDocument = documentsBySlug.get(incomingDocument.slug);

    if (!existingDocument) {
      documentsBySlug.set(incomingDocument.slug, incomingDocument);
      continue;
    }

    if (JSON.stringify(existingDocument) !== JSON.stringify(incomingDocument)) {
      throw new Error(
        `${collectionName}: conflicting canonical document for slug "${incomingDocument.slug}".`,
      );
    }
  }

  return [...documentsBySlug.values()].sort((left, right) =>
    left.slug.localeCompare(right.slug),
  );
}

export function canonicalizeSessionWorkDocument(
  document: ParsedSessionWorkDocument,
): SessionbookCorpus {
  const tunes: TuneDocument[] = [];
  const sets: SetDocument[] = [];
  const sessions: SessionDocument[] = [];
  const sessionSections: SessionSection[] = [];

  for (const section of document.sections) {
    const setSlugs: string[] = [];

    for (const setDocument of section.sets) {
      const tuneDocuments = setDocument.tunes.map((tune) => {
        const slug = slugify(tune.title);
        const keyMode = parseKeyAndMode(tune.keyDescriptor);

        return {
          slug,
          title: tune.title,
          aliases: tune.aliases,
          tuneType: tune.tuneType,
          key: keyMode.key,
          mode: keyMode.mode,
          meter: inferMeter(tune.tuneType),
          visibility: "public" as const,
          chart: renderTuneVersionChart(tune.versions[0]!),
          versions: tune.versions,
          notes: tune.notes,
          links: tune.links,
          workingNotes: "",
          sourcePath: `content/tunes/${slug}.md`,
        };
      });

      const setSlug = tuneDocuments.map((tune) => tune.slug).join("-");
      const setTitle = tuneDocuments.map((tune) => tune.title).join(" / ");

      tunes.push(...tuneDocuments);
      sets.push({
        slug: setSlug,
        title: setTitle,
        tuneType: setDocument.tunes[0]?.tuneType,
        visibility: "public",
        tuneSlugs: tuneDocuments.map((tune) => tune.slug),
        notes: setDocument.notes,
        sourcePath: `content/sets/${setSlug}.md`,
      });
      setSlugs.push(setSlug);
    }

    sessionSections.push({
      heading: section.heading,
      setSlugs,
    });
  }

  sessions.push({
    slug: document.slug,
    title: document.title,
    date: document.date,
    visibility: "public",
    notes: document.notes,
    sections: sessionSections,
    sourcePath: `content/sessions/${document.slug}.md`,
  });

  return sessionbookCorpusSchema.parse({
    tunes: mergeBySlug("tunes", [], tunes),
    sets: mergeBySlug("sets", [], sets),
    sessions: mergeBySlug("sessions", [], sessions),
  });
}

async function loadSessionWorkFilePaths(
  sessionsRoot: string,
): Promise<string[]> {
  const entries = await readdir(sessionsRoot, { withFileTypes: true });

  return entries
    .filter(
      (entry) =>
        entry.isFile() && entry.name.toLowerCase().endsWith(sessionWorkSuffix),
    )
    .map((entry) => path.join(sessionsRoot, entry.name))
    .sort((left, right) => left.localeCompare(right));
}

export async function buildSessionWorkCorpus(options?: {
  sessionsRoot?: string;
}): Promise<SessionbookCorpus> {
  const sessionsRoot = options?.sessionsRoot ?? defaultSessionsRoot;
  const filePaths = await loadSessionWorkFilePaths(sessionsRoot);

  const parsedDocuments = await Promise.all(
    filePaths.map(async (filePath) =>
      parseSessionWorkDocument({
        source: await readFile(filePath, "utf8"),
        sourcePath: toRelativePath(filePath),
      }),
    ),
  );

  let corpus: SessionbookCorpus = {
    tunes: [],
    sets: [],
    sessions: [],
  };

  for (const document of parsedDocuments) {
    const nextCorpus = canonicalizeSessionWorkDocument(document);
    corpus = sessionbookCorpusSchema.parse({
      tunes: mergeBySlug("tunes", corpus.tunes, nextCorpus.tunes),
      sets: mergeBySlug("sets", corpus.sets, nextCorpus.sets),
      sessions: mergeBySlug("sessions", corpus.sessions, nextCorpus.sessions),
    });
  }

  return corpus;
}

function renderFrontmatterLines(
  fields: Array<[string, string | string[] | undefined]>,
): string[] {
  const lines = ["---"];

  for (const [key, value] of fields) {
    if (value === undefined) {
      continue;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        continue;
      }

      lines.push(`${key}:`);
      lines.push(...value.map((item) => `  - ${item}`));
      continue;
    }

    lines.push(`${key}: ${value}`);
  }

  lines.push("---", "");

  return lines;
}

export function renderTuneContentDocument(document: TuneDocument): string {
  return [
    ...renderFrontmatterLines([
      ["title", document.title],
      ["aliases", document.aliases],
      ["tune_type", document.tuneType],
      ["key", document.key],
      ["mode", document.mode],
      ["meter", document.meter],
      ["visibility", document.visibility],
    ]),
    "## Versions",
    "",
    renderTuneVersionBlocks(document.versions),
    "",
    "## Notes",
    "",
    document.notes,
    document.links.length > 0
      ? ["", "## Links", "", renderTuneLinksBlock(document.links)]
      : [],
    document.workingNotes
      ? ["", "## Working Notes", "", document.workingNotes]
      : [],
    "",
  ]
    .flat()
    .join("\n")
    .trimEnd()
    .concat("\n");
}

export function renderSetContentDocument(document: SetDocument): string {
  return [
    ...renderFrontmatterLines([
      ["title", document.title],
      ["tune_type", document.tuneType],
      ["visibility", document.visibility],
      ["tunes", document.tuneSlugs],
    ]),
    "## Notes",
    "",
    document.notes,
    "",
  ]
    .join("\n")
    .trimEnd()
    .concat("\n");
}

export function renderSessionContentDocument(
  document: SessionDocument,
): string {
  const lines = [
    ...renderFrontmatterLines([
      ["title", document.title],
      ["date", document.date],
      ["visibility", document.visibility],
    ]),
    "## Notes",
    "",
    document.notes,
    "",
  ];

  for (const section of document.sections) {
    lines.push(`## ${section.heading}`, "");
    lines.push(...section.setSlugs.map((setSlug) => `- ${setSlug}`), "");
  }

  return lines.join("\n").trimEnd().concat("\n");
}
