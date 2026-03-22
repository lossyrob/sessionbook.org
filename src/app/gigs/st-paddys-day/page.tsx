import Link from "next/link";
import { notFound } from "next/navigation";

import { loadRelease1Repository } from "@/lib/release-1/load-repository";
import { getSectionByPath } from "@/lib/site-navigation";

export default async function StPaddysDayGigPage() {
  const section = getSectionByPath("/gigs/st-paddys-day");
  const { repository } = await loadRelease1Repository();
  const gigSheet = repository.getPrivateGigSheetBySlug("st-paddys-day");

  if (!gigSheet) {
    notFound();
  }

  return (
    <div className="placeholder-page">
      <p className="eyebrow">{section.status}</p>
      <h1>{gigSheet.name}</h1>
      <p className="lead">{gigSheet.summary}</p>

      <section className="callout">
        <h2>Why this still counts as private content</h2>
        <ul className="checklist">
          <li>The stored gig-sheet record is marked <code>private</code> in the repository.</li>
          <li>Its ordered entries point back to public sets by stable IDs instead of copying tune data into a one-off page.</li>
          <li>
            Auth can enforce access later without replacing the imported
            Release 1 storage contract or the Postgres seed path behind it.
          </li>
        </ul>
      </section>

      <section className="section-block">
        <h2>Imported gig-sheet structure</h2>
        <div className="section-grid">
          {gigSheet.entries.map((entry) => (
            <article className="section-card" key={`${gigSheet.id}-${entry.position}`}>
              <p className="section-card__status">Set slot {entry.position}</p>
              <h3>{entry.setName}</h3>
              <p>{entry.setSummary}</p>
              <p className="section-card__issue">Tunes: {entry.tuneNames.join(" -> ")}</p>
              {entry.transitionNotes ? (
                <p>
                  <strong>Transition note:</strong> {entry.transitionNotes}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <p className="data-note">
        This route is still ungated until the auth issue lands. The storage
        contract is complete here; access control is intentionally deferred.
      </p>

      <p className="back-link">
        <Link href="/">Back to the catalog overview</Link>
      </p>
    </div>
  );
}
