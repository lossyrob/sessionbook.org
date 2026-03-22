import Link from "next/link";

import { release1Repository } from "@/lib/release-1/repository";
import { getSectionByPath } from "@/lib/site-navigation";

export default function TunesPage() {
  const section = getSectionByPath("/tunes");
  const tunes = release1Repository.listPublicTunes();

  return (
    <div className="placeholder-page">
      <p className="eyebrow">{section.status}</p>
      <h1>{section.label}</h1>
      <p className="lead">{section.summary}</p>

      <section className="callout">
        <h2>What issue #3 wires up here</h2>
        <ul className="checklist">
          <li>Each public tune now loads from the validated Release 1 repository.</li>
          <li>Aliases stay separate from tune records but are resolved back into the tune view.</li>
          <li>Each tune proves the one-chart-per-tune Release 1 assumption without baking charts into the tune schema.</li>
        </ul>
      </section>

      <section className="section-block">
        <h2>Fixture-backed tune index</h2>
        <div className="section-grid">
          {tunes.map((tune) => (
            <article className="section-card" key={tune.id}>
              <p className="section-card__status">{tune.tuneType}</p>
              <h3>{tune.name}</h3>
              <p>{tune.summary}</p>
              <ul className="meta-list">
                <li>
                  <strong>Aliases:</strong> {tune.aliases.join(", ")}
                </li>
                <li>
                  <strong>Chart:</strong> {tune.chart.title} in {tune.chart.key}{" "}
                  {tune.chart.mode} ({tune.chart.meter})
                </li>
                <li>
                  <strong>Used in sets:</strong> {tune.setNames.join(", ")}
                </li>
              </ul>
              <pre className="chart-preview">{tune.chart.contentMarkdown}</pre>
            </article>
          ))}
        </div>
      </section>

      <p className="back-link">
        <Link href="/">Back to the catalog overview</Link>
      </p>
    </div>
  );
}
