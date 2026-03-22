import Link from "next/link";

import type { SiteSection } from "@/lib/site-navigation";

type SectionCardProps = {
  section: SiteSection;
};

export function SectionCard({ section }: SectionCardProps) {
  return (
    <article className="section-card">
      <p className="section-card__status">{section.status}</p>
      <h3>
        <Link href={section.href}>{section.label}</Link>
      </h3>
      <p>{section.summary}</p>
      <p className="section-card__issue">Next planned work: {section.nextIssue}</p>
    </article>
  );
}
