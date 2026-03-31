import Link from "next/link";

import { SetEntriesList } from "@/components/set-entries-list";
import { loadContentRepository } from "@/lib/content/load-repository";

export const dynamic = "force-dynamic";

export default async function SetsPage() {
  const { repository } = await loadContentRepository();
  const sets = repository.listPublicSets();

  return (
    <div style={{ paddingTop: "2.5rem" }}>
      <div className="index-header">
        <h1>Sets</h1>
      </div>
      <p className="index-subtitle">
        {sets.length} sets in the public catalog. Each set is an ordered group
        of tunes. Click a tune row or the Show chart button to expand it, or
        click the tune title to open its page.
      </p>

      {sets.length === 0 ? (
        <div className="callout">
          <h2>No public sets</h2>
          <p style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>
            The shared-corpus catalog is empty in this environment.
          </p>
        </div>
      ) : (
        <div>
          {sets.map((setRecord) => (
            <div className="set-row" key={setRecord.id}>
              <Link
                className="set-row__header set-row__header--link"
                href={`/sets/${setRecord.slug}`}
              >
                <span className="set-row__name">{setRecord.name}</span>
                <span className="set-row__count">
                  {setRecord.entries.length} tunes
                </span>
              </Link>
              <SetEntriesList
                entries={setRecord.entries}
                setId={setRecord.id}
              />
            </div>
          ))}
        </div>
      )}

      <p className="back-link">
        <Link href="/">← Back to home</Link>
      </p>
    </div>
  );
}
