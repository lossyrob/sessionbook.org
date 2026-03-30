import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SetEntriesList } from "@/components/set-entries-list";
import { loadContentRepository } from "@/lib/content/load-repository";

export const dynamic = "force-dynamic";

type SetDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

async function getSetRecord(slug: string) {
  const { repository } = await loadContentRepository();
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
      <p className="index-subtitle">
        Click a tune row or the Show chart button to expand it, or click the
        tune title to open its page.
      </p>

      <div className="set-row">
        <div className="set-row__header set-row__header--static">
          <span className="set-row__name">Tune order</span>
          <span className="set-row__count">
            {setRecord.entries.length} tunes
          </span>
        </div>
        <SetEntriesList entries={setRecord.entries} setId={setRecord.id} />
      </div>

      <p className="back-link">
        <Link href="/sets">← Back to sets</Link>
      </p>
    </div>
  );
}
