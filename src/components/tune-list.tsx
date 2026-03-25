"use client";

import Link from "next/link";
import { Fragment, type MouseEvent, useState } from "react";

import { tuneTypeBadgeClass } from "@/lib/tune-type-badge";

type TuneListItem = {
  id: string;
  slug: string;
  name: string;
  aliases: string[];
  tuneType: string;
  setMemberships: Array<{
    slug: string;
    name: string;
  }>;
  chart: {
    key: string;
    mode: string;
    meter: string;
    contentMarkdown: string;
  };
};

type TuneListProps = {
  tunes: TuneListItem[];
  buildTuneHref?: (slug: string) => string;
  buildSetHref?: (slug: string) => string;
};

export function TuneList({
  tunes,
  buildTuneHref = (slug) => `/tunes/${slug}`,
  buildSetHref = (slug) => `/sets/${slug}`,
}: TuneListProps) {
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
                  className="tune-name catalog-link"
                  href={buildTuneHref(tune.slug)}
                  onClick={stopRowToggle}
                >
                {tune.name}
              </Link>
              <div className="tune-sub">
                {tune.aliases.length > 0 ? tune.aliases.join(", ") : null}
                {tune.aliases.length > 0 && tune.setMemberships.length > 0
                  ? " · "
                  : null}
                {tune.setMemberships.length > 0 ? (
                  <>
                    Sets:{" "}
                    {tune.setMemberships.map((setMembership, index) => (
                      <Fragment key={`${tune.id}-${setMembership.slug}`}>
                        {index > 0 ? ", " : null}
                        <Link
                          className="catalog-link"
                          href={buildSetHref(setMembership.slug)}
                          onClick={stopRowToggle}
                        >
                          {setMembership.name}
                        </Link>
                      </Fragment>
                    ))}
                  </>
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
