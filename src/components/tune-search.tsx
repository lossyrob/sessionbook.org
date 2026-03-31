"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { TuneList } from "@/components/tune-list";
import { searchTunes } from "@/lib/search/search-tunes";

type TuneSearchItem = {
  id: string;
  slug: string;
  name: string;
  aliases: string[];
  tuneType: string;
  setMemberships: Array<{ slug: string; name: string }>;
  chart: {
    key: string;
    mode: string;
    meter: string;
    contentMarkdown: string;
  };
};

type TuneSearchProps = {
  tunes: TuneSearchItem[];
};

export function TuneSearch({ tunes }: TuneSearchProps) {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");

  const results = searchTunes(query, tunes);

  function handleChange(value: string) {
    setQuery(value);

    const url = new URL(window.location.href);
    if (value.trim()) {
      url.searchParams.set("q", value);
    } else {
      url.searchParams.delete("q");
    }
    window.history.replaceState(null, "", url.toString());
  }

  return (
    <div className="search-page">
      <div className="index-header">
        <h1>Search</h1>
      </div>
      <p className="index-subtitle">
        Search {tunes.length} tunes by name or alias.
      </p>

      <input
        className="search-input"
        type="search"
        placeholder="Search tunes…"
        value={query}
        onChange={(event) => handleChange(event.target.value)}
        autoFocus
      />

      {query.trim().length > 0 && results.length === 0 ? (
        <p className="search-empty">
          No tunes match &ldquo;{query.trim()}&rdquo;. Try a different name or
          alias.
        </p>
      ) : null}

      {results.length > 0 ? (
        <>
          <p className="index-subtitle" style={{ marginBottom: "0.5rem" }}>
            {results.length} {results.length === 1 ? "result" : "results"}
          </p>
          <TuneList tunes={results.map((result) => result.item)} />
        </>
      ) : null}

      <p className="back-link">
        <Link href="/">← Back to home</Link>
      </p>
    </div>
  );
}
