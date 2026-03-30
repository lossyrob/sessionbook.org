import {
  defaultTuneVersionLabel,
  isAlternateTunePart,
  isImplicitTunePart,
  versionHasExplicitPartStructure,
  type TuneVersion,
  type TuneVersionPart,
} from "@/lib/content/tune-versions";
import type { ParsedSessionWorkDocument } from "@/lib/session-work/workflow";

export type SessionPdfRenderOptions = {
  includeAlternateParts?: boolean;
  includeNotes?: boolean;
};

export type SessionPdfTunePart = {
  label?: string;
  chartLines: string[];
};

export type SessionPdfTune = {
  title: string;
  versionLabel?: string;
  notes: string;
  parts: SessionPdfTunePart[];
};

export type SessionPdfSet = {
  sectionHeading?: string;
  notes: string;
  tunes: SessionPdfTune[];
};

export type SessionPdfDocument = {
  title: string;
  notes: string;
  sets: SessionPdfSet[];
};

function renderPartLabel(
  part: Pick<TuneVersionPart, "name" | "isAlternate" | "alternateLabel">,
): string {
  if (!isAlternateTunePart(part)) {
    return part.name;
  }

  if (!part.alternateLabel) {
    return `${part.name} alt`;
  }

  return `${part.name} alt (${part.alternateLabel})`;
}

function splitChartLines(chart: string): string[] {
  return chart.split("\n").map((line) => line.trimEnd());
}

export function buildSessionPdfTuneParts(
  version: TuneVersion,
  options: SessionPdfRenderOptions = {},
): SessionPdfTunePart[] {
  const includeAlternateParts = options.includeAlternateParts ?? false;
  const visibleParts = version.parts.filter(
    (part) => includeAlternateParts || !isAlternateTunePart(part),
  );
  const partsToRender =
    visibleParts.length > 0 ? visibleParts : version.parts.slice(0, 1);
  const shouldLabelParts = versionHasExplicitPartStructure(version);

  return partsToRender.map((part) => ({
    label:
      shouldLabelParts && !isImplicitTunePart(part)
        ? renderPartLabel(part)
        : undefined,
    chartLines: splitChartLines(part.chart),
  }));
}

export function buildSessionPdfDocument(
  document: ParsedSessionWorkDocument,
  options: SessionPdfRenderOptions = {},
): SessionPdfDocument {
  const includeNotes = options.includeNotes ?? false;
  const sets: SessionPdfSet[] = [];

  for (const section of document.sections) {
    section.sets.forEach((setDocument, setIndex) => {
      sets.push({
        sectionHeading: setIndex === 0 ? section.heading : undefined,
        notes: includeNotes ? setDocument.notes : "",
        tunes: setDocument.tunes.map((tune) => {
          const defaultVersion = tune.versions[0];

          if (!defaultVersion) {
            throw new Error(
              `Missing default version for tune "${tune.displayTitle}".`,
            );
          }

          return {
            title: tune.displayTitle,
            versionLabel:
              tune.versions.length > 1 &&
              defaultVersion.label !== defaultTuneVersionLabel
                ? defaultVersion.label
                : undefined,
            notes: includeNotes ? tune.notes : "",
            parts: buildSessionPdfTuneParts(defaultVersion, options),
          };
        }),
      });
    });
  }

  return {
    title: document.title,
    notes: includeNotes ? document.notes : "",
    sets,
  };
}
