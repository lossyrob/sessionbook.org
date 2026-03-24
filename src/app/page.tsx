import Link from "next/link";

import { SectionCard } from "@/components/section-card";
import { loadRelease1Repository } from "@/lib/release-1/load-repository";
import { ownerSections, publicSections } from "@/lib/site-navigation";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { repository } = await loadRelease1Repository();
  const summary = repository.getCatalogSummary();

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
      </div>

      <div className="quick-links">
        <Link className="quick-link" href="/tunes">
          All Tunes
        </Link>
        <Link className="quick-link" href="/sets">
          Sets
        </Link>
        <Link className="quick-link" href="/search">
          Search
        </Link>
      </div>

      <section className="section-block">
        <h2>Public catalog</h2>
        <div className="section-grid">
          {publicSections.map((section) => (
            <SectionCard key={section.href} section={section} />
          ))}
        </div>
      </section>

      <section className="section-block">
        <h2>Owner access</h2>
        <div className="section-grid">
          {ownerSections.map((section) => (
            <SectionCard key={section.href} section={section} />
          ))}
        </div>
      </section>
    </div>
  );
}
