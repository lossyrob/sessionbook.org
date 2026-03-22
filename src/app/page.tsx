import { SectionCard } from "@/components/section-card";
import { ownerSections, publicSections } from "@/lib/site-navigation";

export default function HomePage() {
  return (
    <div className="hero">
      <section className="hero__panel">
        <p className="eyebrow">Release 1 bootstrap</p>
        <h1>SessionBook is now an app scaffold instead of a hand-built static page.</h1>
        <div className="hero__summary">
          <p>
            This baseline introduces the Next.js app shell, shared route metadata,
            local scripts, and deployment contract that later Release 1 issues
            will extend.
          </p>
          <p>
            The public catalog, owner auth, private gig sheet, seeded content, and
            search behavior are still future issue work. For now, this page shows
            the routes and responsibilities the repo is ready to grow into.
          </p>
        </div>
      </section>

      <section className="section-block">
        <h2>Public catalog surfaces</h2>
        <div className="section-grid">
          {publicSections.map((section) => (
            <SectionCard key={section.href} section={section} />
          ))}
        </div>
      </section>

      <section className="section-block">
        <h2>Owner-only path</h2>
        <div className="section-grid">
          {ownerSections.map((section) => (
            <SectionCard key={section.href} section={section} />
          ))}
        </div>
      </section>
    </div>
  );
}
