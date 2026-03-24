import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { loadRelease1Repository } from "@/lib/release-1/load-repository";

export const dynamic = "force-dynamic";

type SetDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const plainLinkStyle = {
  color: "inherit",
  textDecoration: "none",
};

async function getSetRecord(slug: string) {
  const { repository } = await loadRelease1Repository();
  const setRecord = repository.getPublicSetBySlug(slug);

  if (!setRecord) {
    notFound();
  }

  return setRecord;
}

export async function generateMetadata({
  params,
}: SetDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const setRecord = await getSetRecord(slug);

  return {
    title: setRecord.name,
    description:
      setRecord.summary ||
      `${setRecord.entries.length} tunes in the ${setRecord.name} set.`,
  };
}

export default async function SetDetailPage({ params }: SetDetailPageProps) {
  const { slug } = await params;
  const setRecord = await getSetRecord(slug);

  return (
    <div style={{ paddingTop: "2.5rem" }}>
      <p className="eyebrow">Public set</p>
      <h1
        style={{
          fontSize: "1.35rem",
          fontWeight: 700,
          letterSpacing: "-0.015em",
          marginBottom: "0.25rem",
        }}
      >
        {setRecord.name}
      </h1>
      {setRecord.summary ? <p className="lead">{setRecord.summary}</p> : null}

      <div className="set-row">
        <div className="set-row__header">
          <span className="set-row__name">Tune order</span>
          <span className="set-row__count">
            {setRecord.entries.length} tunes
          </span>
        </div>
        <ol className="set-row__entries">
          {setRecord.entries.map((entry) => (
            <li className="set-entry" key={`${setRecord.id}-${entry.position}`}>
              <span className="set-entry__pos">{entry.position}</span>
              <span
                aria-hidden="true"
                className="set-entry__badge type-badge--jig"
              />
              <Link
                className="set-entry__name"
                href={`/tunes/${entry.tuneSlug}`}
                style={plainLinkStyle}
              >
                {entry.tuneName}
              </Link>
              <span className="set-entry__key">
                {entry.key} {entry.mode} · {entry.meter}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <p className="back-link">
        <Link href="/sets">← Back to sets</Link>
      </p>
    </div>
  );
}
