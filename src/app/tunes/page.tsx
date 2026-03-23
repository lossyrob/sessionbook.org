import Link from "next/link";

import { loadRelease1Repository } from "@/lib/release-1/load-repository";
import { getSectionByPath } from "@/lib/site-navigation";

export const dynamic = "force-dynamic";

export default async function TunesPage() {
  const section = getSectionByPath("/tunes");
  const { repository, source } = await loadRelease1Repository();
  const tunes = repository.listPublicTunes();
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
        <h2>What this tune index surfaces</h2>
        <ul className="checklist">
          <li>Current response source: {storageSourceLabel}.</li>
          <li>
            Each public tune loads through the Release 1 repository instead of a
            placeholder route shell.
          </li>
          <li>
            Aliases stay separate from tune records but resolve back into the
            visible tune view.
          </li>
          <li>
            The runtime uses the same tune view model whether local development
            falls back to fixtures or deployed environments read from Postgres.
          </li>
        </ul>
      </section>

      <section className="section-block">
        <h2>Imported tune index</h2>
        <div className="section-grid">
          {tunes.length === 0 ? (
            <article className="section-card">
              <p className="section-card__status">No public tunes</p>
              <h3>The imported catalog is empty in this environment.</h3>
              <p>
                The public tune index is in place, but there are no imported
                tunes available to display right now.
              </p>
            </article>
          ) : (
            tunes.map((tune) => (
              <article className="section-card" key={tune.id}>
                <p className="section-card__status">{tune.tuneType}</p>
                <h3>{tune.name}</h3>
                <p>{tune.summary}</p>
                <ul className="meta-list">
                  <li>
                    <strong>Aliases:</strong> {tune.aliases.join(", ")}
                  </li>
                  <li>
                    <strong>Chart:</strong> {tune.chart.title} in{" "}
                    {tune.chart.key} {tune.chart.mode} ({tune.chart.meter})
                  </li>
                  <li>
                    <strong>Used in sets:</strong> {tune.setNames.join(", ")}
                  </li>
                </ul>
                <pre className="chart-preview">
                  {tune.chart.contentMarkdown}
                </pre>
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
