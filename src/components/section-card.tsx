import Link from "next/link";

import type { SiteSection } from "@/lib/site-navigation";

type SectionCardProps = {
  section: SiteSection;
};

export function SectionCard({ section }: SectionCardProps) {
  return (
    <article className="section-card">
      <h3>
        <Link href={section.href}>{section.label}</Link>
      </h3>
      <p>{section.summary}</p>
    </article>
  );
}
