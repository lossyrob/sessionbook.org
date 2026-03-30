import Link from "next/link";

import { TuneList } from "@/components/tune-list";
import { loadContentRepository } from "@/lib/content/load-repository";

export const dynamic = "force-dynamic";

export default async function PreviewTunesPage() {
  const { repository } = await loadContentRepository();
  const tunes = repository.listPreviewTunes();

  return (
    <div style={{ paddingTop: "2.5rem" }}>
      <div className="index-header">
        <h1>Draft Tunes</h1>
      </div>
      <p className="index-subtitle">
        {tunes.length} tunes in the shared markdown corpus. Expand rows to
        preview the current chart draft, or open a tune page for form, sources,
        and working notes.
      </p>

      {tunes.length === 0 ? (
        <div className="callout">
          <h2>No draft tunes</h2>
          <p style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>
            Add markdown files under <code>content/tunes</code> to preview them
            here.
          </p>
        </div>
      ) : (
        <TuneList
          tunes={tunes}
          buildTuneHref={(slug) => `/preview/tunes/${slug}`}
          buildSetHref={(slug) => `/preview/sets/${slug}`}
        />
      )}

      <p className="back-link">
        <Link href="/preview">← Back to draft previews</Link>
      </p>
    </div>
  );
}
