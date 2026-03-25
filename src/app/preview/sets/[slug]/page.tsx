import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SetEntriesList } from "@/components/set-entries-list";
import { loadContentRepository } from "@/lib/content/load-repository";
import type { PreviewSetView } from "@/lib/content/repository";

export const dynamic = "force-dynamic";

type PreviewSetDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

async function getPreviewSetBySlug(slug: string): Promise<PreviewSetView> {
  const { repository } = await loadContentRepository();
  const setRecord = repository.getPreviewSetBySlug(slug);

  if (!setRecord) {
    notFound();
  }

  return setRecord;
}

export async function generateMetadata({
  params,
}: PreviewSetDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const setRecord = await getPreviewSetBySlug(slug);

  return {
    title: `${setRecord.name} draft preview`,
    description:
      setRecord.notes ||
      `${setRecord.entries.length} tunes in the ${setRecord.name} preview set.`,
  };
}

export default async function PreviewSetDetailPage({
  params,
}: PreviewSetDetailPageProps) {
  const { slug } = await params;
  const setRecord = await getPreviewSetBySlug(slug);

  return (
    <div style={{ paddingTop: "2.5rem" }}>
      <p className="eyebrow">Draft set preview</p>
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
      <p className="lead">
        Backed by <code>{setRecord.sourcePath}</code>.
      </p>

      <div className="callout">
        <h2>Set Notes</h2>
        <pre
          style={{
            margin: 0,
            whiteSpace: "pre-wrap",
            fontFamily: "inherit",
            fontSize: "0.875rem",
            color: "var(--muted)",
          }}
        >
          {setRecord.notes || "No set notes yet."}
        </pre>
      </div>

      <div className="set-row">
        <div className="set-row__header set-row__header--static">
          <span className="set-row__name">Tune order</span>
          <span className="set-row__count">
            {setRecord.entries.length} tunes
          </span>
        </div>
        <SetEntriesList
          entries={setRecord.entries}
          setId={setRecord.id}
          buildTuneHref={(entrySlug) => `/preview/tunes/${entrySlug}`}
        />
      </div>

      <p className="back-link">
        <Link href="/preview/sets">← Back to draft sets</Link>
      </p>
    </div>
  );
}
