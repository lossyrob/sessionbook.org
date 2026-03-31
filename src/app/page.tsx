import Link from "next/link";

import { SectionCard } from "@/components/section-card";
import { loadContentRepository } from "@/lib/content/load-repository";
import { sections } from "@/lib/site-navigation";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { repository } = await loadContentRepository();
  const summary = repository.getPublicCatalogSummary();

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

      <div className="quick-links">
        <Link className="quick-link" href="/tunes">
          All Tunes
        </Link>
        <Link className="quick-link" href="/sets">
          Sets
        </Link>
        <Link className="quick-link" href="/sessions">
          Sessions
        </Link>
        <Link className="quick-link" href="/search">
          Search
        </Link>
      </div>

      <section className="section-block">
        <h2>Browse</h2>
        <div className="section-grid">
          {sections.map((section) => (
            <SectionCard key={section.href} section={section} />
          ))}
        </div>
      </section>
    </div>
  );
}
