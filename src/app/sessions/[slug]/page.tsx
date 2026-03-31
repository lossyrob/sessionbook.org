import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SessionSetSections } from "@/components/session-set-sections";
import { loadContentRepository } from "@/lib/content/load-repository";
import type { PublicSessionView } from "@/lib/content/repository";

export const dynamic = "force-dynamic";

type SessionDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

async function getSessionBySlug(slug: string): Promise<PublicSessionView> {
  const { repository } = await loadContentRepository();
  const session = repository.getPublicSessionBySlug(slug);

  if (!session) {
    notFound();
  }

  return session;
}

export async function generateMetadata({
  params,
}: SessionDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const session = await getSessionBySlug(slug);

  return {
    title: session.name,
    description:
      session.notes ||
      `Session page for ${session.name} — sets and chord charts for the session.`,
  };
}

export default async function SessionDetailPage({
  params,
}: SessionDetailPageProps) {
  const { slug } = await params;
  const session = await getSessionBySlug(slug);

  return (
    <div style={{ paddingTop: "2.5rem" }}>
      <p className="eyebrow">Session</p>
      <div className="index-header" style={{ marginBottom: "0.5rem" }}>
        <h1>{session.name}</h1>
      </div>
      {session.date ? (
        <p className="index-subtitle">Session date: {session.date}</p>
      ) : null}
      <p className="index-subtitle">
        This session opens with every chart expanded so it can double as a
        play-from-the-screen set list. Use Expand all or Collapse all to reset
        every tune chart at once.
      </p>

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

      <SessionSetSections sections={session.sections} />

      <p className="back-link">
        <Link href="/sessions">← Back to sessions</Link>
      </p>
    </div>
  );
}
