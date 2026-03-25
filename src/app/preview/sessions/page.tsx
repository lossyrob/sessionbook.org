import Link from "next/link";

import { loadContentRepository } from "@/lib/content/load-repository";

export const dynamic = "force-dynamic";

export default async function PreviewSessionsPage() {
  const { repository } = await loadContentRepository();
  const sessions = repository.listPreviewSessions();

  return (
    <div style={{ paddingTop: "2.5rem" }}>
      <div className="index-header">
        <h1>Draft Sessions</h1>
      </div>
      <p className="index-subtitle">
        {sessions.length} public session previews derived from the shared
        markdown corpus.
      </p>

      {sessions.length === 0 ? (
        <div className="callout">
          <h2>No draft sessions</h2>
          <p style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>
            Add markdown files under <code>content/sessions</code> to preview
            them here.
          </p>
        </div>
      ) : (
        <div className="section-grid">
          {sessions.map((session) => (
            <article className="section-card" key={session.id}>
              <p className="section-card__status">Draft session preview</p>
              <h3>
                <Link href={`/preview/sessions/${session.slug}`}>
                  {session.name}
                </Link>
              </h3>
              <p>
                {session.setCount} sets across {session.sectionCount} sections.
              </p>
              <p className="section-card__issue">
                {session.date ? `Session date: ${session.date}` : session.sourcePath}
              </p>
            </article>
          ))}
        </div>
      )}

      <p className="back-link">
        <Link href="/preview">← Back to draft previews</Link>
      </p>
    </div>
  );
}
