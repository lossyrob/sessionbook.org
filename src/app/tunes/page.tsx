import Link from "next/link";

import { TuneList } from "@/components/tune-list";
import { loadRelease1Repository } from "@/lib/release-1/load-repository";

export const dynamic = "force-dynamic";

export default async function TunesPage() {
  const { repository } = await loadRelease1Repository();
  const tunes = repository.listPublicTunes();

  return (
    <div style={{ paddingTop: "2.5rem" }}>
      <div className="index-header">
        <h1>Tunes</h1>
      </div>
      <p className="index-subtitle">
        {tunes.length} tunes in the public catalog. Click a row to view its
        chord chart.
      </p>

      {tunes.length === 0 ? (
        <div className="callout">
          <h2>No public tunes</h2>
          <p style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>
            The imported catalog is empty in this environment.
          </p>
        </div>
      ) : (
        <TuneList tunes={tunes} />
      )}

      <p className="back-link">
        <Link href="/">← Back to home</Link>
      </p>
    </div>
  );
}
