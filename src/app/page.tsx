import { SectionCard } from "@/components/section-card";
import { release1Repository } from "@/lib/release-1/repository";
import { ownerSections, publicSections } from "@/lib/site-navigation";

export default function HomePage() {
  const summary = release1Repository.getCatalogSummary();
  const metricCards = [
    {
      label: "Public tunes",
      value: summary.publicTuneCount,
      description: `${summary.aliasCount} aliases and ${summary.chartCount} validated charts sit behind the tune index.`,
    },
    {
      label: "Public sets",
      value: summary.publicSetCount,
      description: "Each set stores ordered tune-to-chart references instead of flattening the catalog.",
    },
    {
      label: "Private gig sheets",
      value: summary.privateGigSheetCount,
      description: "Private gig data stays distinct from the public catalog even before auth enforcement lands.",
    },
  ];

  return (
    <div className="hero">
      <section className="hero__panel">
        <p className="eyebrow">Release 1 catalog schema</p>
        <h1>SessionBook now has a concrete storage contract behind the bootstrap app.</h1>
        <div className="hero__summary">
          <p>
            The app still builds as a static export, but it now validates a typed
            Release 1 store for tunes, aliases, charts, public sets, and private
            gig sheets during build and test.
          </p>
          <p>
            The data is deliberately fixture-backed for now. Issue #4 can swap in
            real imported chart/set/gig content later without rewriting the app-
            facing repository layer introduced here.
          </p>
        </div>
      </section>

      <section className="section-block">
        <h2>What the persistence layer proves</h2>
        <div className="section-grid">
          {metricCards.map((card) => (
            <article className="section-card" key={card.label}>
              <p className="section-card__status">{card.label}</p>
              <p className="section-card__metric">{card.value}</p>
              <p>{card.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="callout">
        <h2>Storage choices for this issue</h2>
        <ul className="checklist">
          <li>The store is validated with Zod during build and test.</li>
          <li>Catalog fixtures load from checked-in TypeScript modules, not external seed files.</li>
          <li>Charts stay separate from tunes even though the Release 1 fixtures use one chart per tune.</li>
          <li>Gig sheets remain explicitly private records so auth can layer on later.</li>
        </ul>
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
