import { SectionCard } from "@/components/section-card";
import { loadRelease1Repository } from "@/lib/release-1/load-repository";
import { ownerSections, publicSections } from "@/lib/site-navigation";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { repository, source } = await loadRelease1Repository();
  const summary = repository.getCatalogSummary();
  const storageSourceLabel =
    source === "database"
      ? "Neon/Postgres via the live runtime"
      : "the checked-in imported catalog";
  const metricCards = [
    {
      label: "Public tunes",
      value: summary.publicTuneCount,
      description: `${summary.aliasCount} aliases and ${summary.chartCount} validated charts sit behind the tune index.`,
    },
    {
      label: "Public sets",
      value: summary.publicSetCount,
      description:
        "Each set stores ordered tune-to-chart references instead of flattening the catalog.",
    },
    {
      label: "Private gig sheets",
      value: summary.privateGigSheetCount,
      description:
        "Private gig data stays distinct from the public catalog even before auth enforcement lands.",
    },
  ];

  return (
    <div className="hero">
      <section className="hero__panel">
        <p className="eyebrow">Release 1 public catalog</p>
        <h1>
          SessionBook is now a public browseable catalog for Irish trad chord
          charts.
        </h1>
        <div className="hero__summary">
          <p>
            Anonymous visitors can now understand the site from the homepage and
            browse imported public tunes and sets through the shared app shell.
            The public catalog is backed by the same Release 1 repository that
            assembles tunes, aliases, charts, sets, and private gig-sheet data.
          </p>
          <p>
            When <code>DATABASE_URL</code> is configured, the live runtime reads
            directly from Neon/Postgres. Local work can still browse the same
            catalog from the checked-in import when no database is configured.
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
        <h2>How this catalog is loaded</h2>
        <ul className="checklist">
          <li>Current response source: {storageSourceLabel}.</li>
          <li>
            The store is validated with Zod before the repository exposes public
            catalog views.
          </li>
          <li>
            <code>npm run db:setup</code> creates the Release 1 schema and seeds
            it from the checked-in imported store when a Postgres connection is
            available.
          </li>
          <li>
            Local development can still browse the catalog without Postgres, but
            configured database environments are expected to load the imported
            Release 1 store directly from Postgres.
          </li>
          <li>
            Charts stay separate from tunes even though the Release 1 seed data
            uses one chart per tune.
          </li>
          <li>
            Gig sheets remain explicitly private records so auth can layer on
            later.
          </li>
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
