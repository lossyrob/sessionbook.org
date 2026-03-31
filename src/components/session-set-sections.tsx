"use client";

import Link from "next/link";
import { useState } from "react";

import { SetEntriesList } from "@/components/set-entries-list";
import type { PublicSessionView } from "@/lib/content/repository";

type SessionSetSectionsProps = {
  sections: PublicSessionView["sections"];
  pdfHref?: string | null;
};

export function SessionSetSections({
  sections,
  pdfHref,
}: SessionSetSectionsProps) {
  const [expandAll, setExpandAll] = useState(true);
  const [resetVersion, setResetVersion] = useState(0);

  function applyExpansionState(nextExpanded: boolean) {
    setExpandAll(nextExpanded);
    setResetVersion((version) => version + 1);
  }

  return (
    <>
      <div
        className="hero__actions"
        style={{
          marginTop: "1rem",
          marginBottom: "1.5rem",
          justifyContent: "flex-start",
        }}
      >
        <button
          className="btn btn-secondary"
          onClick={() => applyExpansionState(true)}
          type="button"
        >
          Expand all
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => applyExpansionState(false)}
          type="button"
        >
          Collapse all
        </button>
        {pdfHref ? (
          <a
            className="btn btn-secondary"
            href={pdfHref}
            download
            style={{ marginLeft: "auto" }}
          >
            Download PDF
          </a>
        ) : null}
      </div>

      {sections.map((section) => (
        <section className="section-block" key={section.heading}>
          <h2>{section.heading}</h2>
          <div
            style={{
              display: "grid",
              gap: "1rem",
            }}
          >
            {section.sets.map((setRecord) => (
              <div className="set-row" key={setRecord.slug}>
                <Link
                  className="set-row__header set-row__header--link"
                  href={`/sets/${setRecord.slug}`}
                >
                  <span className="set-row__name">{setRecord.name}</span>
                  <span className="set-row__count">
                    {setRecord.tuneCount}{" "}
                    {setRecord.tuneCount === 1 ? "tune" : "tunes"}
                  </span>
                </Link>
                {setRecord.notes ? (
                  <div
                    style={{
                      padding: "0.75rem 1rem 0",
                      fontSize: "0.8125rem",
                      color: "var(--muted)",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {setRecord.notes}
                  </div>
                ) : null}
                <SetEntriesList
                  defaultExpanded={expandAll}
                  entries={setRecord.entries}
                  key={`${setRecord.slug}-${resetVersion}-${expandAll ? "expanded" : "collapsed"}`}
                  setId={setRecord.slug}
                />
              </div>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
