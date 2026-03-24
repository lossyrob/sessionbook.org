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
    <div style={{ paddingTop: "2.5rem" }}>
      <p className="eyebrow">{section.status}</p>
      <h1
        style={{
          fontSize: "1.35rem",
          fontWeight: 700,
          letterSpacing: "-0.015em",
          marginBottom: "0.25rem",
        }}
      >
        {gigSheet.name}
      </h1>
      <p className="lead">{gigSheet.summary}</p>

      <div className="callout">
        <h2>Private content</h2>
        <ul className="checklist">
          <li>
            This gig-sheet record is marked <code>private</code> in the
            repository.
          </li>
          <li>
            Entries reference public sets by stable IDs instead of copying tune
            data.
          </li>
          <li>Auth enforcement will gate access in a later issue.</li>
        </ul>
      </div>

      <div className="gig-entries">
        {gigSheet.entries.map((entry) => (
          <div className="gig-slot" key={`${gigSheet.id}-${entry.position}`}>
            <div className="gig-slot__header">
              <span className="gig-slot__pos">Set {entry.position}</span>
              <span className="gig-slot__name">{entry.setName}</span>
            </div>
            <div className="gig-slot__body">
              <p style={{ marginBottom: "0.25rem" }}>{entry.setSummary}</p>
              <p className="gig-slot__tunes">{entry.tuneNames.join(" → ")}</p>
              {entry.transitionNotes ? (
                <p style={{ marginTop: "0.35rem", fontStyle: "italic" }}>
                  Note: {entry.transitionNotes}
                </p>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <p className="data-note">
        This route is ungated until auth enforcement lands. The storage contract
        is complete; access control is deferred.
      </p>

      <p className="back-link">
        <Link href="/">← Back to home</Link>
      </p>
    </div>
  );
}
