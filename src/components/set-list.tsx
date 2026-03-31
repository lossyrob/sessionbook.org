"use client";

import Link from "next/link";
import { useState } from "react";

import { SetEntriesList } from "@/components/set-entries-list";
import { matchesSearch } from "@/lib/search/search-tunes";

type SetListEntry = {
  position: number;
  tuneSlug: string;
  tuneName: string;
  tuneType: string;
  key: string;
  mode: string;
  meter: string;
  chartTitle: string;
  contentMarkdown: string;
};

type SetListItem = {
  id: string;
  slug: string;
  name: string;
  entries: SetListEntry[];
};

type SetListProps = {
  sets: SetListItem[];
};

export function SetList({ sets }: SetListProps) {
  const [query, setQuery] = useState("");

  const displaySets =
    query.trim().length > 0
      ? sets.filter((setRecord) =>
          matchesSearch(query, [
            setRecord.name,
            ...setRecord.entries.map((entry) => entry.tuneName),
          ]),
        )
      : sets;

  return (
    <div>
      <input
        className="search-input"
        type="search"
        placeholder="Filter sets by name or tune…"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        autoFocus
      />
      {query.trim().length > 0 && displaySets.length === 0 ? (
        <p className="search-empty">
          No sets match &ldquo;{query.trim()}&rdquo;
        </p>
      ) : null}
      {displaySets.map((setRecord) => (
        <div className="set-row" key={setRecord.id}>
          <Link
            className="set-row__header set-row__header--link"
            href={`/sets/${setRecord.slug}`}
          >
            <span className="set-row__name">{setRecord.name}</span>
            <span className="set-row__count">
              {setRecord.entries.length} tunes
            </span>
          </Link>
          <SetEntriesList entries={setRecord.entries} setId={setRecord.id} />
        </div>
      ))}
    </div>
  );
}
