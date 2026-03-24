import Link from "next/link";

import { loadRelease1Repository } from "@/lib/release-1/load-repository";

export const dynamic = "force-dynamic";

export default async function SetsPage() {
  const { repository } = await loadRelease1Repository();
  const sets = repository.listPublicSets();

  return (
    <div style={{ paddingTop: "2.5rem" }}>
      <div className="index-header">
        <h1>Sets</h1>
      </div>
      <p className="index-subtitle">
        {sets.length} sets in the public catalog. Each set is an ordered group
        of tunes.
      </p>

      {sets.length === 0 ? (
        <div className="callout">
          <h2>No public sets</h2>
          <p style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>
            The imported catalog is empty in this environment.
          </p>
        </div>
      ) : (
        <div>
          {sets.map((setRecord) => (
            <div className="set-row" key={setRecord.id}>
              <div className="set-row__header">
                <span className="set-row__name">{setRecord.name}</span>
                <span className="set-row__count">
                  {setRecord.entries.length} tunes
                </span>
              </div>
              <ul className="set-row__entries">
                {setRecord.entries.map((entry) => (
                  <li
                    className="set-entry"
                    key={`${setRecord.id}-${entry.position}`}
                  >
                    <span className="set-entry__pos">{entry.position}</span>
                    <span className="set-entry__badge type-badge--jig">
                      {/* Tune type not available on set entries; omit text */}
                    </span>
                    <span className="set-entry__name">{entry.tuneName}</span>
                    <span className="set-entry__key">
                      {entry.key} {entry.mode} · {entry.meter}
                    </span>
                  </li>
                ))}
              </ul>
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
