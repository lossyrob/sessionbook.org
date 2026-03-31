import Link from "next/link";

import { SessionList } from "@/components/session-list";
import { loadContentRepository } from "@/lib/content/load-repository";

export const dynamic = "force-dynamic";

export default async function SessionsPage() {
  const { repository } = await loadContentRepository();
  const sessions = repository.listPublicSessions();

  return (
    <div style={{ paddingTop: "2.5rem" }}>
      <div className="index-header">
        <h1>Sessions</h1>
      </div>
      <p className="index-subtitle">
        {sessions.length} public session pages in the shared catalog.
      </p>

      {sessions.length === 0 ? (
        <div className="callout">
          <h2>No public sessions</h2>
          <p style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>
            Add public session documents under <code>content/sessions</code> to
            publish them here.
          </p>
        </div>
      ) : (
        <SessionList sessions={sessions} />
      )}

      <p className="back-link">
        <Link href="/">← Back to home</Link>
      </p>
    </div>
  );
}
