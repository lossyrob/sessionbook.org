"use client";

import Link from "next/link";
import { useState } from "react";

import { matchesSearch } from "@/lib/search/search-tunes";

type SessionListItem = {
  id: string;
  slug: string;
  name: string;
  date?: string;
  sectionCount: number;
  setCount: number;
  tuneNames: string[];
};

type SessionListProps = {
  sessions: SessionListItem[];
};

export function SessionList({ sessions }: SessionListProps) {
  const [query, setQuery] = useState("");

  const displaySessions =
    query.trim().length > 0
      ? sessions.filter((session) =>
          matchesSearch(query, [session.name, ...session.tuneNames]),
        )
      : sessions;

  return (
    <div>
      <input
        className="search-input"
        type="search"
        placeholder="Filter sessions by name or tune…"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        autoFocus
      />
      {query.trim().length > 0 && displaySessions.length === 0 ? (
        <p className="search-empty">
          No sessions match &ldquo;{query.trim()}&rdquo;
        </p>
      ) : null}
      {displaySessions.length > 0 ? (
        <div className="section-grid">
          {displaySessions.map((session) => (
            <article className="section-card" key={session.id}>
              <p className="section-card__status">Live public session</p>
              <h3>
                <Link href={`/sessions/${session.slug}`}>{session.name}</Link>
              </h3>
              <p>
                {session.setCount} sets across {session.sectionCount} sections.
              </p>
              <p className="section-card__issue">
                {session.date
                  ? `Session date: ${session.date}`
                  : "Shared corpus"}
              </p>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}
