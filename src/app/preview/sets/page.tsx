import Link from "next/link";

import { SetEntriesList } from "@/components/set-entries-list";
import { loadContentRepository } from "@/lib/content/load-repository";

export const dynamic = "force-dynamic";

export default async function PreviewSetsPage() {
  const { repository } = await loadContentRepository();
  const sets = repository.listPreviewSets();

  return (
    <div style={{ paddingTop: "2.5rem" }}>
      <div className="index-header">
        <h1>Draft Sets</h1>
      </div>
      <p className="index-subtitle">
        {sets.length} sets in the shared markdown corpus. Open a set for notes
        and source file context, or expand a tune row here to preview its chart.
      </p>

      {sets.length === 0 ? (
        <div className="callout">
          <h2>No draft sets</h2>
          <p style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>
            Add markdown files under <code>content/sets</code> to preview them
            here.
          </p>
        </div>
      ) : (
        <div>
          {sets.map((setRecord) => (
            <div className="set-row" key={setRecord.id}>
              <Link
                className="set-row__header set-row__header--link"
                href={`/preview/sets/${setRecord.slug}`}
              >
                <span className="set-row__name">{setRecord.name}</span>
                <span className="set-row__count">
                  {setRecord.entries.length} tunes
                </span>
              </Link>
              <SetEntriesList
                entries={setRecord.entries}
                setId={setRecord.id}
                buildTuneHref={(slug) => `/preview/tunes/${slug}`}
              />
            </div>
          ))}
        </div>
      )}

      <p className="back-link">
        <Link href="/preview">← Back to draft previews</Link>
      </p>
    </div>
  );
}
