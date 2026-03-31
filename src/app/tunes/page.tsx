import Link from "next/link";

import { TuneList } from "@/components/tune-list";
import { loadContentRepository } from "@/lib/content/load-repository";

export const dynamic = "force-dynamic";

export default async function TunesPage() {
  const { repository } = await loadContentRepository();
  const tunes = repository.listPublicTunes();

  return (
    <div style={{ paddingTop: "2.5rem" }}>
      <div className="index-header">
        <h1>Tunes</h1>
      </div>
      <p className="index-subtitle">
        {tunes.length} tunes in the catalog. Click a row to expand its chord
        chart, or follow tune and set links for detail pages.
      </p>

      {tunes.length === 0 ? (
        <div className="callout">
          <h2>No tunes yet</h2>
          <p style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>
            The shared-corpus catalog is empty in this environment.
          </p>
        </div>
      ) : (
        <TuneList tunes={tunes} searchable />
      )}

      <p className="back-link">
        <Link href="/">← Back to home</Link>
      </p>
    </div>
  );
}
