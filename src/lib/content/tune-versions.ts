import { z } from "zod";

import {
  parseTuneLinkValue,
  renderTuneLinkValue,
  tuneLinkSchema,
  type TuneLink,
} from "@/lib/content/tune-links";

export const defaultTuneVersionLabel = "Session default";
export const implicitTunePartName = "Full tune";

export const tuneVersionPartSchema = z.object({
  name: z.string().min(1),
  alternateLabel: z.string().min(1).optional(),
  chart: z.string(),
});

export const tuneVersionSchema = z.object({
  label: z.string().min(1),
  links: z.array(tuneLinkSchema),
  parts: z.array(tuneVersionPartSchema).min(1),
});

export type TuneVersionPart = z.infer<typeof tuneVersionPartSchema>;
export type TuneVersion = z.infer<typeof tuneVersionSchema>;

function normalizeLineEndings(value: string): string {
  return value.replace(/\r\n?/g, "\n");
}

function normalizeChart(value: string): string {
  return normalizeLineEndings(value)
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trim();
}

function parseVersionLabel(value: string): string | undefined {
  const match = value.match(/^=\s*version:\s*(.+)$/i);
  return match?.[1]?.trim();
}

function parsePartDefinition(
  value: string,
): Pick<TuneVersionPart, "name" | "alternateLabel"> | undefined {
  const partMatch = value.match(/^=\s*part:\s*(.+)$/i);

  if (partMatch) {
    return {
      name: partMatch[1].trim(),
    };
  }

  const altMatch = value.match(/^=\s*alt:\s*([^|]+?)(?:\s*\|\s*(.+))?$/i);

  if (altMatch) {
    return {
      name: altMatch[1].trim(),
      alternateLabel: altMatch[2]?.trim(),
    };
  }

  return undefined;
}

function formatPartLabel(part: Pick<TuneVersionPart, "name" | "alternateLabel">): string {
  if (!part.alternateLabel) {
    return part.name;
  }

  return `${part.name} alt (${part.alternateLabel})`;
}

export function isImplicitTunePart(part: TuneVersionPart): boolean {
  return part.name === implicitTunePartName && !part.alternateLabel;
}

export function versionHasExplicitPartStructure(version: TuneVersion): boolean {
  return version.parts.length > 1 || !isImplicitTunePart(version.parts[0]!);
}

export function createImplicitTuneVersion(chart: string): TuneVersion {
  return tuneVersionSchema.parse({
    label: defaultTuneVersionLabel,
    links: [],
    parts: [
      {
        name: implicitTunePartName,
        chart: normalizeChart(chart),
      },
    ],
  });
}

export function parseTuneVersionBlocks(args: {
  source: string;
  sourcePath: string;
}): TuneVersion[] {
  const lines = normalizeLineEndings(args.source).split("\n");
  const versions: Array<{
    label: string;
    links: TuneLink[];
    parts: TuneVersionPart[];
  }> = [];
  let currentVersion:
    | {
        label: string;
        links: TuneLink[];
        parts: TuneVersionPart[];
      }
    | null = null;
  let pendingPart: Pick<TuneVersionPart, "name" | "alternateLabel"> | null = null;

  const ensureCurrentVersion = () => {
    if (!currentVersion) {
      throw new Error(`${args.sourcePath}: expected "= version:" before version content.`);
    }

    return currentVersion;
  };

  for (let index = 0; index < lines.length; index += 1) {
    const rawLine = lines[index] ?? "";
    const trimmed = rawLine.trim();

    if (!trimmed) {
      continue;
    }

    const versionLabel = parseVersionLabel(trimmed);

    if (versionLabel) {
      if (pendingPart) {
        throw new Error(
          `${args.sourcePath}: expected a chart fence for ${formatPartLabel(pendingPart)} before the next version.`,
        );
      }

      currentVersion = {
        label: versionLabel,
        links: [],
        parts: [],
      };
      versions.push(currentVersion);
      continue;
    }

    if (trimmed.startsWith("=>")) {
      ensureCurrentVersion().links.push(
        parseTuneLinkValue(trimmed.slice(2).trim(), args.sourcePath),
      );
      continue;
    }

    const partDefinition = parsePartDefinition(trimmed);

    if (partDefinition) {
      ensureCurrentVersion();

      if (pendingPart) {
        throw new Error(
          `${args.sourcePath}: expected a chart fence for ${formatPartLabel(pendingPart)} before the next part marker.`,
        );
      }

      pendingPart = partDefinition;
      continue;
    }

    if (trimmed === "```") {
      const version = ensureCurrentVersion();
      const chartLines: string[] = [];

      for (index += 1; index < lines.length; index += 1) {
        const chartLine = (lines[index] ?? "").trimEnd();

        if (chartLine.trim() === "```") {
          break;
        }

        chartLines.push(chartLine);
      }

      if (pendingPart) {
        version.parts.push({
          name: pendingPart.name,
          alternateLabel: pendingPart.alternateLabel,
          chart: normalizeChart(chartLines.join("\n")),
        });
        pendingPart = null;
        continue;
      }

      if (version.parts.length > 0) {
        throw new Error(
          `${args.sourcePath}: chart fence requires "= part:" or "= alt:" once the version already has parts.`,
        );
      }

      version.parts.push({
        name: implicitTunePartName,
        chart: normalizeChart(chartLines.join("\n")),
      });
      continue;
    }

    throw new Error(
      `${args.sourcePath}: unsupported line inside tune versions block: "${trimmed}".`,
    );
  }

  if (pendingPart) {
    throw new Error(
      `${args.sourcePath}: expected a chart fence for ${formatPartLabel(pendingPart)} before the end of the tune.`,
    );
  }

  return versions.map((version) => tuneVersionSchema.parse(version));
}

export function renderTuneVersionBlocks(versions: TuneVersion[]): string {
  const lines: string[] = [];

  versions.forEach((version, versionIndex) => {
    if (versionIndex > 0) {
      lines.push("");
    }

    lines.push(`= version: ${version.label}`);

    if (version.links.length > 0) {
      lines.push(...version.links.map((link) => `=> ${renderTuneLinkValue(link)}`));
    }

    for (const part of version.parts) {
      lines.push("");
      lines.push(
        part.alternateLabel
          ? `= alt: ${part.name} | ${part.alternateLabel}`
          : `= part: ${part.name}`,
      );
      lines.push("```");
      lines.push(part.chart);
      lines.push("```");
    }
  });

  return lines.join("\n").trim();
}

export function renderTuneVersionChart(version: TuneVersion): string {
  if (version.parts.length === 1 && isImplicitTunePart(version.parts[0]!)) {
    return version.parts[0]!.chart;
  }

  return version.parts
    .map((part) => `${formatPartLabel(part)}:\n${part.chart}`.trimEnd())
    .join("\n\n");
}
