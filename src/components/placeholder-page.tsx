"use client";

import Link from "next/link";

import type { SiteSection } from "@/lib/site-navigation";

type PlaceholderPageProps = {
  section: SiteSection;
  bullets: string[];
};

export function PlaceholderPage({ section, bullets }: PlaceholderPageProps) {
  return (
    <div className="placeholder-page">
      <p className="eyebrow">{section.status}</p>
      <h1>{section.label}</h1>
      <p className="lead">{section.summary}</p>

      <div className="callout">
        <h2>What this gives us now</h2>
        <ul className="checklist">
          {bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      </div>

      <div className="callout">
        <h2>Next planned issue</h2>
        <p style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>
          This route is reserved for future implementation in issue{" "}
          {section.nextIssue}.
        </p>
      </div>

      <p className="back-link">
        <Link href="/">← Back to home</Link>
      </p>
    </div>
  );
}
