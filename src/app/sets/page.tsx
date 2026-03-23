import Link from "next/link";

import { loadRelease1Repository } from "@/lib/release-1/load-repository";
import { getSectionByPath } from "@/lib/site-navigation";

export const dynamic = "force-dynamic";

export default async function SetsPage() {
  const section = getSectionByPath("/sets");
  const { repository, source } = await loadRelease1Repository();
  const sets = repository.listPublicSets();
  const storageSourceLabel =
    source === "database"
      ? "Neon/Postgres via the live runtime"
      : "the checked-in imported catalog";

  return (
    <div className="placeholder-page">
      <p className="eyebrow">{section.status}</p>
      <h1>{section.label}</h1>
      <p className="lead">{section.summary}</p>

      <section className="callout">
        <h2>What this set index surfaces</h2>
        <ul className="checklist">
          <li>Current response source: {storageSourceLabel}.</li>
          <li>
            Sets load from the imported Release 1 source groups instead of
            placeholder route content.
          </li>
          <li>
            Each set entry preserves tune order while pointing at explicit chart
            IDs.
          </li>
          <li>
            The public set catalog stays separate from the private gig-sheet
            layer that reuses it, whether the repository source is Postgres or
            the checked-in imported catalog.
          </li>
        </ul>
      </section>

      <section className="section-block">
        <h2>Imported set index</h2>
        <div className="section-grid">
          {sets.length === 0 ? (
            <article className="section-card">
              <p className="section-card__status">No public sets</p>
              <h3>The imported catalog is empty in this environment.</h3>
              <p>
                The public set index is ready, but there are no imported public
                sets available to display right now.
              </p>
            </article>
          ) : (
            sets.map((setRecord) => (
              <article className="section-card" key={setRecord.id}>
                <p className="section-card__status">
                  {setRecord.entries.length} tune set
                </p>
                <h3>{setRecord.name}</h3>
                <p>{setRecord.summary}</p>
                <ol className="entry-list">
                  {setRecord.entries.map((entry) => (
                    <li key={`${setRecord.id}-${entry.position}`}>
                      <strong>{entry.tuneName}</strong> - {entry.chartTitle} in{" "}
                      {entry.key} {entry.mode} ({entry.meter})
                    </li>
                  ))}
                </ol>
              </article>
            ))
          )}
        </div>
      </section>

      <p className="back-link">
        <Link href="/">Back to the catalog overview</Link>
      </p>
    </div>
  );
}
