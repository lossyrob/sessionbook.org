"use client";

import Link from "next/link";
import { type MouseEvent, useState } from "react";

import type { PublicTuneView } from "@/lib/release-1/repository";

type TuneListProps = {
  tunes: PublicTuneView[];
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

  function stopRowToggle(event: MouseEvent<HTMLAnchorElement>) {
    event.stopPropagation();
  }

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
              <Link
                className="tune-name"
                href={`/tunes/${tune.slug}`}
                onClick={stopRowToggle}
              >
                {tune.name}
              </Link>
              <div className="tune-sub">
                {tune.aliases.length > 0 ? (
                  <div>Aliases: {tune.aliases.join(", ")}</div>
                ) : null}
                {tune.setMemberships.length > 0 ? (
                  <div>
                    Sets:{" "}
                    {tune.setMemberships.map((setMembership, index) => (
                      <span key={`${tune.id}-${setMembership.slug}`}>
                        {index > 0 ? ", " : null}
                        <Link
                          href={`/sets/${setMembership.slug}`}
                          onClick={stopRowToggle}
                        >
                          {setMembership.name}
                        </Link>
                      </span>
                    ))}
                  </div>
                ) : null}
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
