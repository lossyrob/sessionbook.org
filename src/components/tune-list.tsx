"use client";

import { useState } from "react";

type TuneView = {
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

type TuneListProps = {
  tunes: TuneView[];
};

function tuneTypeBadgeClass(tuneType: string): string {
  const normalized = tuneType.toLowerCase();
  if (normalized === "jig") return "type-badge type-badge--jig";
  if (normalized === "reel") return "type-badge type-badge--reel";
  if (normalized === "hornpipe") return "type-badge type-badge--hornpipe";
  if (normalized === "polka") return "type-badge type-badge--polka";
  return "type-badge type-badge--jig";
}

export function TuneList({ tunes }: TuneListProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <div className="tune-list">
      {tunes.map((tune) => (
        <div key={tune.id}>
          <div className="tune-row" onClick={() => toggle(tune.id)}>
            <div className={tuneTypeBadgeClass(tune.tuneType)}>
              {tune.tuneType.slice(0, 4)}
            </div>
            <div>
              <div className="tune-name">{tune.name}</div>
              <div className="tune-sub">
                {[
                  tune.aliases.length > 0 ? tune.aliases.join(", ") : null,
                  tune.setNames.length > 0
                    ? `Sets: ${tune.setNames.join(", ")}`
                    : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </div>
            </div>
            <div className="tune-meta">
              <div className="tune-meta__key">
                {tune.chart.key} {tune.chart.mode}
              </div>
              <div className="tune-meta__meter">{tune.chart.meter}</div>
            </div>
          </div>
          <div
            className="tune-chart"
            data-expanded={expanded.has(tune.id) ? "true" : undefined}
          >
            <span className="tune-chart__label">Chord Chart</span>
            {tune.chart.contentMarkdown}
          </div>
        </div>
      ))}
    </div>
  );
}
