"use client";

import Link from "next/link";
import { type MouseEvent, useState } from "react";

import type { PublicSetView } from "@/lib/release-1/repository";
import { tuneTypeBadgeClass } from "@/lib/tune-type-badge";

type SetEntriesListProps = {
  setId: string;
  entries: PublicSetView["entries"];
};

export function SetEntriesList({ setId, entries }: SetEntriesListProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function stopRowToggle(event: MouseEvent<HTMLAnchorElement>) {
    event.stopPropagation();
  }

  function toggle(entryKey: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(entryKey)) {
        next.delete(entryKey);
      } else {
        next.add(entryKey);
      }
      return next;
    });
  }

  return (
    <ol className="set-row__entries">
      {entries.map((entry) => {
        const entryKey = `${setId}-${entry.position}`;
        const chartId = `${entryKey}-chart`;
        const isExpanded = expanded.has(entryKey);

        return (
          <li key={entryKey}>
            <div
              className="set-entry set-entry--interactive"
              data-expanded={isExpanded ? "true" : undefined}
              onClick={() => toggle(entryKey)}
            >
              <span className="set-entry__pos">{entry.position}</span>
              <span className={tuneTypeBadgeClass(entry.tuneType)}>
                {entry.tuneType.slice(0, 4)}
              </span>
              <div className="set-entry__details">
                <Link
                  className="set-entry__name catalog-link"
                  href={`/tunes/${entry.tuneSlug}`}
                  onClick={stopRowToggle}
                >
                  {entry.tuneName}
                </Link>
              </div>
              <div className="set-entry__meta">
                <span className="set-entry__key">
                  {entry.key} {entry.mode} · {entry.meter}
                </span>
                <button
                  aria-controls={chartId}
                  aria-expanded={isExpanded}
                  className="set-entry__toggle"
                  onClick={(event) => {
                    event.stopPropagation();
                    toggle(entryKey);
                  }}
                  type="button"
                >
                  {isExpanded ? "Hide chart" : "Show chart"}
                </button>
              </div>
            </div>
            <div
              id={chartId}
              className="set-entry__chart tune-chart"
              data-expanded={isExpanded ? "true" : undefined}
            >
              <span className="tune-chart__label">{entry.chartTitle}</span>
              {entry.contentMarkdown}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
