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

      <section className="callout">
        <h2>What this scaffold gives us now</h2>
        <ul className="checklist">
          {bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      </section>

      <section className="callout">
        <h2>Next planned issue</h2>
        <p>This route is reserved for future implementation in issue {section.nextIssue}.</p>
      </section>

      <p className="back-link">
        <Link href="/">Back to the bootstrap overview</Link>
      </p>
    </div>
  );
}
