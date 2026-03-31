import Link from "next/link";

import { TuneList } from "@/components/tune-list";
import { loadContentRepository } from "@/lib/content/load-repository";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { repository } = await loadContentRepository();
  const summary = repository.getPublicCatalogSummary();
  const tunes = repository.listPublicTunes();

  return (
    <div className="hero">
      <h1>Chord charts for the session</h1>
      <div className="hero__summary">
        <p>
          Quick-reference chord progressions for Irish traditional tunes. Built
          for guitarists, bouzouki players, and anyone comping at the session.
        </p>
      </div>

      <div className="hero__actions">
        <Link className="btn btn-primary" href="/tunes">
          Browse Tunes
        </Link>
        <Link className="btn btn-secondary" href="/sets">
          View Sets
        </Link>
      </div>

      <div className="stats-bar">
        <span>
          <strong>{summary.publicTuneCount}</strong> tunes
        </span>
        <span>
          <strong>{summary.publicSetCount}</strong> sets
        </span>
        <span>
          <strong>{summary.chartCount}</strong> charts
        </span>
        <span>
          <strong>{summary.publicSessionCount}</strong> sessions
        </span>
      </div>

      {tunes.length > 0 ? <TuneList tunes={tunes} searchable /> : null}
    </div>
  );
}
