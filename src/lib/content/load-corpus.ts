import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import {
  contentSlugSchema,
  sessionbookCorpusSchema,
  sessionDocumentSchema,
  setDocumentSchema,
  tuneDocumentSchema,
  type SessionDocument,
  type SessionbookCorpus,
  type SetDocument,
  type TuneDocument,
} from "@/lib/content/schema";
import { parseTuneLinksBlock } from "@/lib/content/tune-links";
import {
  createImplicitTuneVersion,
  parseTuneVersionBlocks,
  renderTuneVersionChart,
} from "@/lib/content/tune-versions";

type FrontmatterValue = string | string[];

type FrontmatterRecord = Record<string, FrontmatterValue>;

type MarkdownSection = {
  heading: string;
  content: string;
};

const defaultContentRoot = path.join(process.cwd(), "content");

function normalizeLineEndings(value: string): string {
  return value.replace(/\r\n?/g, "\n");
}

function toRelativePath(absolutePath: string): string {
  return path.relative(process.cwd(), absolutePath).replace(/\\/g, "/");
}

function trimSectionContent(value: string): string {
  return value.replace(/^\n+/, "").replace(/\n+$/, "");
}

function parseFrontmatter(
  source: string,
  sourcePath: string,
): { data: FrontmatterRecord; body: string } {
  const lines = normalizeLineEndings(source).split("\n");

  if (lines[0] !== "---") {
    throw new Error(`${sourcePath}: expected opening frontmatter delimiter.`);
  }

  const closingIndex = lines.indexOf("---", 1);

  if (closingIndex === -1) {
    throw new Error(`${sourcePath}: expected closing frontmatter delimiter.`);
  }

  const data: FrontmatterRecord = {};
  const frontmatterLines = lines.slice(1, closingIndex);

  for (let index = 0; index < frontmatterLines.length; ) {
    const line = frontmatterLines[index] ?? "";

    if (!line.trim()) {
      index += 1;
      continue;
    }

    const match = line.match(/^([a-z0-9_]+):(?:\s*(.*))?$/);

    if (!match) {
      throw new Error(
        `${sourcePath}: invalid frontmatter line "${line}" at line ${index + 2}.`,
      );
    }

    const [, key, inlineValue = ""] = match;
    index += 1;

    if (inlineValue) {
      data[key] = inlineValue;
      continue;
    }

    const items: string[] = [];

    while (index < frontmatterLines.length) {
      const itemLine = frontmatterLines[index] ?? "";
      const itemMatch = itemLine.match(/^\s*-\s+(.+)$/);

      if (!itemMatch) {
        break;
      }

      items.push(itemMatch[1].trim());
      index += 1;
    }

    data[key] = items;
  }

  return {
    data,
    body: lines
      .slice(closingIndex + 1)
      .join("\n")
      .replace(/^\n+/, ""),
  };
}

function parseMarkdownSections(
  source: string,
  sourcePath: string,
): MarkdownSection[] {
  const lines = normalizeLineEndings(source).split("\n");
  const sections: MarkdownSection[] = [];
  const preludeLines: string[] = [];
  let currentHeading: string | null = null;
  let currentContentLines: string[] = [];

  const finalizeCurrentSection = () => {
    if (!currentHeading) {
      return;
    }

    sections.push({
      heading: currentHeading,
      content: trimSectionContent(currentContentLines.join("\n")),
    });
  };

  for (const line of lines) {
    const headingMatch = line.match(/^##\s+(.+)$/);

    if (headingMatch) {
      if (!currentHeading && preludeLines.join("\n").trim()) {
        throw new Error(
          `${sourcePath}: expected markdown sections immediately after frontmatter.`,
        );
      }

      finalizeCurrentSection();
      currentHeading = headingMatch[1].trim();
      currentContentLines = [];
      continue;
    }

    if (!currentHeading) {
      preludeLines.push(line);
      continue;
    }

    currentContentLines.push(line);
  }

  finalizeCurrentSection();

  if (!sections.length) {
    throw new Error(`${sourcePath}: expected at least one ## section.`);
  }

  return sections;
}

function buildSectionMap(
  sections: MarkdownSection[],
  sourcePath: string,
): Map<string, string> {
  const sectionMap = new Map<string, string>();

  for (const section of sections) {
    if (sectionMap.has(section.heading)) {
      throw new Error(
        `${sourcePath}: duplicate section heading "${section.heading}".`,
      );
    }

    sectionMap.set(section.heading, section.content);
  }

  return sectionMap;
}

function assertAllowedKeys(
  data: FrontmatterRecord,
  allowedKeys: string[],
  sourcePath: string,
): void {
  const allowed = new Set(allowedKeys);
  const unexpectedKeys = Object.keys(data).filter((key) => !allowed.has(key));

  if (unexpectedKeys.length) {
    throw new Error(
      `${sourcePath}: unexpected frontmatter keys ${unexpectedKeys.join(", ")}.`,
    );
  }
}

function readRequiredString(
  data: FrontmatterRecord,
  key: string,
  sourcePath: string,
): string {
  const value = data[key];

  if (typeof value !== "string" || !value.trim()) {
    throw new Error(
      `${sourcePath}: expected "${key}" to be a non-empty string.`,
    );
  }

  return value.trim();
}

function readOptionalString(
  data: FrontmatterRecord,
  key: string,
  sourcePath: string,
): string | undefined {
  const value = data[key];

  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new Error(`${sourcePath}: expected "${key}" to be a string.`);
  }

  const trimmedValue = value.trim();

  return trimmedValue ? trimmedValue : undefined;
}

function readStringArray(
  data: FrontmatterRecord,
  key: string,
  sourcePath: string,
): string[] {
  const value = data[key];

  if (value === undefined) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new Error(`${sourcePath}: expected "${key}" to be a list.`);
  }

  return value.map((item) => item.trim()).filter(Boolean);
}

function readRequiredSection(
  sectionMap: Map<string, string>,
  heading: string,
  sourcePath: string,
): string {
  const value = sectionMap.get(heading);

  if (value === undefined) {
    throw new Error(`${sourcePath}: missing required "## ${heading}" section.`);
  }

  return value;
}

function readOptionalSection(
  sectionMap: Map<string, string>,
  heading: string,
): string {
  return sectionMap.get(heading) ?? "";
}

function parseSlugList(content: string, sourcePath: string): string[] {
  const slugs: string[] = [];

  for (const line of normalizeLineEndings(content).split("\n")) {
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      continue;
    }

    const bulletMatch = trimmedLine.match(/^- ([a-z0-9]+(?:-[a-z0-9]+)*)$/);

    if (!bulletMatch) {
      throw new Error(
        `${sourcePath}: expected a bullet list of slugs, found "${trimmedLine}".`,
      );
    }

    slugs.push(bulletMatch[1]);
  }

  if (!slugs.length) {
    throw new Error(`${sourcePath}: expected at least one slug entry.`);
  }

  return slugs;
}

function getSlugFromPath(absolutePath: string): string {
  return path.basename(absolutePath, path.extname(absolutePath));
}

async function loadMarkdownFilePaths(directoryPath: string): Promise<string[]> {
  const entries = await readdir(directoryPath, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => path.join(directoryPath, entry.name))
    .sort((left, right) => left.localeCompare(right));
}

async function parseTuneDocument(absolutePath: string): Promise<TuneDocument> {
  const source = await readFile(absolutePath, "utf8");
  const sourcePath = toRelativePath(absolutePath);
  const slug = getSlugFromPath(absolutePath);
  const { data, body } = parseFrontmatter(source, sourcePath);
  const sectionMap = buildSectionMap(
    parseMarkdownSections(body, sourcePath),
    sourcePath,
  );
  const versionsSection = readOptionalSection(sectionMap, "Versions");
  const versions = versionsSection
    ? parseTuneVersionBlocks({
        source: versionsSection,
        sourcePath: `${sourcePath}#Versions`,
      })
    : [
        createImplicitTuneVersion(
          readRequiredSection(sectionMap, "Chart", sourcePath),
        ),
      ];
  const chart = renderTuneVersionChart(versions[0]!);

  assertAllowedKeys(
    data,
    ["title", "aliases", "tune_type", "key", "mode", "meter", "visibility"],
    sourcePath,
  );

  return tuneDocumentSchema.parse({
    slug,
    title: readRequiredString(data, "title", sourcePath),
    aliases: readStringArray(data, "aliases", sourcePath),
    tuneType: readRequiredString(data, "tune_type", sourcePath),
    key: readRequiredString(data, "key", sourcePath),
    mode: readRequiredString(data, "mode", sourcePath),
    meter: readOptionalString(data, "meter", sourcePath),
    visibility: readRequiredString(data, "visibility", sourcePath),
    chart,
    versions,
    notes:
      readOptionalSection(sectionMap, "Notes") ||
      readOptionalSection(sectionMap, "Form / Structure Notes"),
    links: parseTuneLinksBlock(
      readOptionalSection(sectionMap, "Links") ||
        readOptionalSection(sectionMap, "Source Links"),
      sourcePath,
    ),
    workingNotes: readOptionalSection(sectionMap, "Working Notes"),
    sourcePath,
  });
}

async function parseSetDocument(absolutePath: string): Promise<SetDocument> {
  const source = await readFile(absolutePath, "utf8");
  const sourcePath = toRelativePath(absolutePath);
  const slug = getSlugFromPath(absolutePath);
  const { data, body } = parseFrontmatter(source, sourcePath);
  const sectionMap = buildSectionMap(
    parseMarkdownSections(body, sourcePath),
    sourcePath,
  );

  assertAllowedKeys(
    data,
    ["title", "tune_type", "visibility", "tunes"],
    sourcePath,
  );

  return setDocumentSchema.parse({
    slug,
    title: readRequiredString(data, "title", sourcePath),
    tuneType: readOptionalString(data, "tune_type", sourcePath),
    visibility: readRequiredString(data, "visibility", sourcePath),
    tuneSlugs: readStringArray(data, "tunes", sourcePath),
    notes: readRequiredSection(sectionMap, "Notes", sourcePath),
    sourcePath,
  });
}

async function parseSessionDocument(
  absolutePath: string,
): Promise<SessionDocument> {
  const source = await readFile(absolutePath, "utf8");
  const sourcePath = toRelativePath(absolutePath);
  const slug = getSlugFromPath(absolutePath);
  const { data, body } = parseFrontmatter(source, sourcePath);
  const sectionMap = buildSectionMap(
    parseMarkdownSections(body, sourcePath),
    sourcePath,
  );
  const notes = readOptionalSection(sectionMap, "Notes");
  const sections = [...sectionMap.entries()]
    .filter(([heading]) => heading !== "Notes")
    .map(([heading, content]) => ({
      heading,
      setSlugs: parseSlugList(content, sourcePath),
    }));

  assertAllowedKeys(data, ["title", "date", "visibility"], sourcePath);

  return sessionDocumentSchema.parse({
    slug,
    title: readRequiredString(data, "title", sourcePath),
    date: readOptionalString(data, "date", sourcePath),
    visibility: readRequiredString(data, "visibility", sourcePath),
    notes,
    sections,
    sourcePath,
  });
}

function assertUniqueSlugs(
  collectionName: string,
  documents: Array<{ slug: string; sourcePath: string }>,
): void {
  const seen = new Map<string, string>();

  for (const document of documents) {
    const existingSourcePath = seen.get(document.slug);

    if (existingSourcePath) {
      throw new Error(
        `${collectionName}: duplicate slug "${document.slug}" in ${existingSourcePath} and ${document.sourcePath}.`,
      );
    }

    seen.set(document.slug, document.sourcePath);
  }
}

function assertCrossReferences(corpus: SessionbookCorpus): void {
  const tuneSlugs = new Set(corpus.tunes.map((tune) => tune.slug));
  const setSlugs = new Set(corpus.sets.map((setDocument) => setDocument.slug));

  for (const setDocument of corpus.sets) {
    for (const tuneSlug of setDocument.tuneSlugs) {
      if (!tuneSlugs.has(tuneSlug)) {
        throw new Error(
          `${setDocument.sourcePath}: references missing tune slug "${tuneSlug}".`,
        );
      }
    }
  }

  for (const session of corpus.sessions) {
    for (const section of session.sections) {
      for (const setSlug of section.setSlugs) {
        if (!setSlugs.has(setSlug)) {
          throw new Error(
            `${session.sourcePath}: section "${section.heading}" references missing set slug "${setSlug}".`,
          );
        }
      }
    }
  }
}

export async function loadSessionbookCorpus(options?: {
  contentRoot?: string;
}): Promise<SessionbookCorpus> {
  const contentRoot = options?.contentRoot ?? defaultContentRoot;
  const [tunePaths, setPaths, sessionPaths] = await Promise.all([
    loadMarkdownFilePaths(path.join(contentRoot, "tunes")),
    loadMarkdownFilePaths(path.join(contentRoot, "sets")),
    loadMarkdownFilePaths(path.join(contentRoot, "sessions")),
  ]);

  const [tunes, sets, sessions] = await Promise.all([
    Promise.all(tunePaths.map((tunePath) => parseTuneDocument(tunePath))),
    Promise.all(setPaths.map((setPath) => parseSetDocument(setPath))),
    Promise.all(
      sessionPaths.map((sessionPath) => parseSessionDocument(sessionPath)),
    ),
  ]);

  assertUniqueSlugs("tunes", tunes);
  assertUniqueSlugs("sets", sets);
  assertUniqueSlugs("sessions", sessions);

  const corpus = sessionbookCorpusSchema.parse({
    tunes: tunes.map((tune) => ({
      ...tune,
      slug: contentSlugSchema.parse(tune.slug),
    })),
    sets: sets.map((setDocument) => ({
      ...setDocument,
      slug: contentSlugSchema.parse(setDocument.slug),
    })),
    sessions: sessions.map((session) => ({
      ...session,
      slug: contentSlugSchema.parse(session.slug),
    })),
  });

  assertCrossReferences(corpus);

  return corpus;
}
