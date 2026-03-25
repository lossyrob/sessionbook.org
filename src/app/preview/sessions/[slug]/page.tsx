import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { loadContentRepository } from "@/lib/content/load-repository";
import type { PreviewSessionView } from "@/lib/content/repository";

export const dynamic = "force-dynamic";

type PreviewSessionDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

async function getPreviewSessionBySlug(
  slug: string,
): Promise<PreviewSessionView> {
  const { repository } = await loadContentRepository();
  const session = repository.getPreviewSessionBySlug(slug);

  if (!session) {
    notFound();
  }

  return session;
}

export async function generateMetadata({
  params,
}: PreviewSessionDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const session = await getPreviewSessionBySlug(slug);

  return {
    title: `${session.name} draft preview`,
    description: `Draft session preview for ${session.name} from the shared markdown corpus.`,
  };
}

export default async function PreviewSessionDetailPage({
  params,
}: PreviewSessionDetailPageProps) {
  const { slug } = await params;
  const session = await getPreviewSessionBySlug(slug);

  return (
    <div style={{ paddingTop: "2.5rem" }}>
      <p className="eyebrow">Draft session preview</p>
      <div className="index-header" style={{ marginBottom: "0.5rem" }}>
        <h1>{session.name}</h1>
      </div>
      <p className="lead">
        Backed by <code>{session.sourcePath}</code>.
      </p>
      {session.date ? (
        <p className="index-subtitle">Session date: {session.date}</p>
      ) : null}

      {session.notes ? (
        <div className="callout">
          <h2>Session Notes</h2>
          <pre
            style={{
              margin: 0,
              whiteSpace: "pre-wrap",
              fontFamily: "inherit",
              fontSize: "0.875rem",
              color: "var(--muted)",
            }}
          >
            {session.notes}
          </pre>
        </div>
      ) : null}

      {session.sections.map((section) => (
        <section className="section-block" key={section.heading}>
          <h2>{section.heading}</h2>
          <div
            style={{
              display: "grid",
              gap: "1rem",
            }}
          >
            {section.sets.map((setRecord) => (
              <div className="callout" key={setRecord.slug}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "1rem",
                    alignItems: "baseline",
                    flexWrap: "wrap",
                  }}
                >
                  <Link
                    className="catalog-link"
                    href={`/preview/sets/${setRecord.slug}`}
                  >
                    {setRecord.name}
                  </Link>
                  <span className="tune-sub">
                    {setRecord.tuneCount}{" "}
                    {setRecord.tuneCount === 1 ? "tune" : "tunes"}
                  </span>
                </div>
                <p className="index-subtitle" style={{ marginTop: "0.5rem" }}>
                  {setRecord.tuneNames.join(" / ")}
                </p>
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
            ))}
          </div>
        </section>
      ))}

      <p className="back-link">
        <Link href="/preview/sessions">← Back to draft sessions</Link>
      </p>
    </div>
  );
}
