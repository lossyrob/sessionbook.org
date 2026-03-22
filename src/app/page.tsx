import { SectionCard } from "@/components/section-card";
import { loadRelease1Repository } from "@/lib/release-1/load-repository";
import { ownerSections, publicSections } from "@/lib/site-navigation";

export default async function HomePage() {
  const { repository, source } = await loadRelease1Repository();
  const summary = repository.getCatalogSummary();
  const storageSourceLabel = source === "database" ? "Postgres" : "checked-in imported catalog";
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
        <p className="eyebrow">Release 1 catalog import</p>
        <h1>SessionBook now ships a real imported Release 1 catalog behind the bootstrap app.</h1>
        <div className="hero__summary">
          <p>
            The app still builds as a static export, but it now carries real
            Release 1 source material through the checked-in catalog, the
            repository layer, and the Postgres seed path for tunes, aliases,
            charts, public sets, and private gig sheets.
          </p>
          <p>
            When <code>DATABASE_URL</code> is configured and seeded, the build
            reads from Postgres. When no database is configured yet, local work
            can still fall back to the checked-in imported store without
            changing the app-facing repository contract.
          </p>
        </div>
      </section>

      <section className="section-block">
        <h2>What the imported catalog proves</h2>
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
        <h2>Storage choices for this build</h2>
        <ul className="checklist">
          <li>Current build source: {storageSourceLabel}.</li>
          <li>The store is validated with Zod during build and test.</li>
          <li>
            <code>npm run db:setup</code> creates the Release 1 schema and seeds
            it from the checked-in imported store when a Postgres connection is available.
          </li>
          <li>Charts stay separate from tunes even though the Release 1 seed data uses one chart per tune.</li>
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
