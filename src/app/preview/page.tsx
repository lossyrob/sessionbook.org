import Link from "next/link";

import { loadContentRepository } from "@/lib/content/load-repository";

export const dynamic = "force-dynamic";

export default async function PreviewIndexPage() {
  const { repository } = await loadContentRepository();
  const summary = repository.getCatalogSummary();

  return (
    <div className="hero">
      <h1>Draft corpus previews</h1>
      <div className="hero__summary">
        <p>
          Browse tune, set, and session previews backed directly by the shared
          markdown corpus under <code>content/</code>.
        </p>
      </div>

      <div className="hero__actions">
        <Link className="btn btn-primary" href="/preview/tunes">
          Preview Tunes
        </Link>
        <Link className="btn btn-secondary" href="/preview/sessions">
          Preview Sessions
        </Link>
      </div>

      <div className="stats-bar">
        <span>
          <strong>{summary.tuneCount}</strong> draft tunes
        </span>
        <span>
          <strong>{summary.setCount}</strong> draft sets
        </span>
        <span>
          <strong>{summary.sessionCount}</strong> draft sessions
        </span>
      </div>

      <div className="quick-links">
        <Link className="quick-link" href="/preview/tunes">
          Draft Tunes
        </Link>
        <Link className="quick-link" href="/preview/sets">
          Draft Sets
        </Link>
        <Link className="quick-link" href="/preview/sessions">
          Draft Sessions
        </Link>
      </div>

      <section className="section-block">
        <h2>How to use this</h2>
        <div className="callout">
          <p className="lead" style={{ marginBottom: "0.75rem" }}>
            These routes are the author-facing preview surfaces for the shared
            corpus.
          </p>
          <p style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
            The live public tunes, sets, and sessions now publish from the same
            shared markdown corpus. These preview routes stay useful because
            they expose the broader corpus without the public-route visibility
            filter.
          </p>
        </div>
      </section>
    </div>
  );
}
