import Link from "next/link";

import { release1Repository } from "@/lib/release-1/repository";
import { getSectionByPath } from "@/lib/site-navigation";

export default function SetsPage() {
  const section = getSectionByPath("/sets");
  const sets = release1Repository.listPublicSets();

  return (
    <div className="placeholder-page">
      <p className="eyebrow">{section.status}</p>
      <h1>{section.label}</h1>
      <p className="lead">{section.summary}</p>

      <section className="callout">
        <h2>What issue #3 wires up here</h2>
        <ul className="checklist">
          <li>Sets are now first-class stored records instead of route placeholders.</li>
          <li>Each set entry preserves tune order while pointing at explicit chart IDs.</li>
          <li>The public set catalog stays separate from the private gig-sheet layer that reuses it.</li>
        </ul>
      </section>

      <section className="section-block">
        <h2>Fixture-backed set index</h2>
        <div className="section-grid">
          {sets.map((setRecord) => (
            <article className="section-card" key={setRecord.id}>
              <p className="section-card__status">{setRecord.entries.length} tune set</p>
              <h3>{setRecord.name}</h3>
              <p>{setRecord.summary}</p>
              <ol className="entry-list">
                {setRecord.entries.map((entry) => (
                  <li key={`${setRecord.id}-${entry.position}`}>
                    <strong>{entry.tuneName}</strong> - {entry.chartTitle} in {entry.key}{" "}
                    {entry.mode} ({entry.meter})
                  </li>
                ))}
              </ol>
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
