import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { loadContentRepository } from "@/lib/content/load-repository";
import type { PublicTuneView } from "@/lib/content/repository";
import { tuneTypeBadgeClass } from "@/lib/tune-type-badge";

export const dynamic = "force-dynamic";

type TuneDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function buildTuneDescription({
  name,
  summary,
  tuneType,
  chart,
  setMemberships,
}: PublicTuneView) {
  if (summary) {
    return summary;
  }

  const setCount = setMemberships.length;
  const setSummary =
    setCount === 0
      ? "No linked sets yet."
      : `Appears in ${setCount} ${setCount === 1 ? "set" : "sets"}.`;

  return `${name} is a ${tuneType.toLowerCase()} chord chart in ${chart.key} ${chart.mode} (${chart.meter}). ${setSummary}`;
}

async function getTuneBySlug(slug: string): Promise<PublicTuneView> {
  const { repository } = await loadContentRepository();
  const tune = repository.getPublicTuneBySlug(slug);

  if (!tune) {
    notFound();
  }

  return tune;
}

export async function generateMetadata({
  params,
}: TuneDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tune = await getTuneBySlug(slug);

  return {
    title: tune.name,
    description: buildTuneDescription(tune),
  };
}

export default async function TuneDetailPage({ params }: TuneDetailPageProps) {
  const { slug } = await params;
  const tune = await getTuneBySlug(slug);

  return (
    <div style={{ paddingTop: "2.5rem" }}>
      <p className="eyebrow">{tune.tuneType}</p>
      <div className="index-header" style={{ marginBottom: "0.5rem" }}>
        <h1>{tune.name}</h1>
      </div>

      {tune.aliases.length > 0 ? (
        <p className="index-subtitle" style={{ marginBottom: "0.5rem" }}>
          Also known as {tune.aliases.join(", ")}.
        </p>
      ) : null}

      {tune.summary ? <p className="lead">{tune.summary}</p> : null}

      <div
        className="callout"
        style={{
          display: "grid",
          gap: "0.75rem",
          marginTop: tune.summary ? "1.5rem" : "1rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            flexWrap: "wrap",
          }}
        >
          <span className={tuneTypeBadgeClass(tune.tuneType)}>
            {tune.tuneType.slice(0, 4)}
          </span>
          <div>
            <div className="tune-name">{tune.chart.title}</div>
            <div className="tune-sub">Chart title</div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div className="tune-meta__key">
              {tune.chart.key} {tune.chart.mode}
            </div>
            <div className="tune-sub">Key / mode</div>
          </div>
          <div>
            <div className="tune-meta__key">{tune.chart.meter}</div>
            <div className="tune-sub">Meter</div>
          </div>
        </div>
      </div>

      <div
        className="tune-chart"
        data-expanded="true"
        style={{ marginTop: "1rem" }}
      >
        <span className="tune-chart__label">Chord Chart</span>
        {tune.chart.contentMarkdown}
      </div>

      <div className="callout">
        <h2>Sets</h2>
        {tune.setMemberships.length > 0 ? (
          <ul className="checklist">
            {tune.setMemberships.map((setMembership) => (
              <li key={setMembership.slug}>
                <Link
                  className="catalog-link"
                  href={`/sets/${setMembership.slug}`}
                >
                  {setMembership.name}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>
            This tune is not part of any set yet.
          </p>
        )}
      </div>

      <p className="back-link">
        <Link href="/tunes">← Back to tunes</Link>
      </p>
    </div>
  );
}
