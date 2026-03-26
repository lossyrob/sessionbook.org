import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { isExternalTuneLink } from "@/lib/content/tune-links";
import { loadContentRepository } from "@/lib/content/load-repository";
import type { PreviewTuneView } from "@/lib/content/repository";
import { tuneTypeBadgeClass } from "@/lib/tune-type-badge";

export const dynamic = "force-dynamic";

type PreviewTuneDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function buildPreviewTuneDescription(tune: PreviewTuneView): string {
  return `Draft preview for ${tune.name} in ${tune.chart.key} ${tune.chart.mode} (${tune.chart.meter}) from the shared markdown corpus.`;
}

async function getPreviewTuneBySlug(slug: string): Promise<PreviewTuneView> {
  const { repository } = await loadContentRepository();
  const tune = repository.getPreviewTuneBySlug(slug);

  if (!tune) {
    notFound();
  }

  return tune;
}

export async function generateMetadata({
  params,
}: PreviewTuneDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tune = await getPreviewTuneBySlug(slug);

  return {
    title: `${tune.name} draft preview`,
    description: buildPreviewTuneDescription(tune),
  };
}

function renderTextBlock(content: string, emptyLabel: string) {
  return (
    <pre
      style={{
        margin: 0,
        whiteSpace: "pre-wrap",
        fontFamily: "inherit",
        fontSize: "0.875rem",
        color: "var(--muted)",
      }}
    >
      {content || emptyLabel}
    </pre>
  );
}

function renderTuneLink(link: PreviewTuneView["links"][number]) {
  if (isExternalTuneLink(link)) {
    return (
      <a href={link.href} rel="noreferrer" target="_blank">
        {link.label}
      </a>
    );
  }

  if (link.label === link.href) {
    return <code>{link.href}</code>;
  }

  return (
    <>
      <span>{link.label}: </span>
      <code>{link.href}</code>
    </>
  );
}

function renderVersionPartLabel(part: PreviewTuneView["versions"][number]["parts"][number]) {
  if (!part.alternateLabel) {
    return part.name;
  }

  return `${part.name} alt (${part.alternateLabel})`;
}

export default async function PreviewTuneDetailPage({
  params,
}: PreviewTuneDetailPageProps) {
  const { slug } = await params;
  const tune = await getPreviewTuneBySlug(slug);
  const additionalLinks = tune.links.filter(
    (link) => link.provider !== "the-session",
  );

  return (
    <div style={{ paddingTop: "2.5rem" }}>
      <p className="eyebrow">Draft tune preview</p>
      <div className="index-header" style={{ marginBottom: "0.5rem" }}>
        <h1>{tune.name}</h1>
      </div>

      {tune.aliases.length > 0 ? (
        <p className="index-subtitle" style={{ marginBottom: "0.5rem" }}>
          Also known as {tune.aliases.join(", ")}.
        </p>
      ) : null}

      <p className="lead">
        Backed by <code>{tune.sourcePath}</code>.
      </p>

      <div
        className="callout"
        style={{
          display: "grid",
          gap: "0.75rem",
          marginTop: "1rem",
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
          <div>
            <div className="tune-meta__key">{tune.setMemberships.length}</div>
            <div className="tune-sub">Linked sets</div>
          </div>
        </div>
      </div>

      {!tune.hasStructuredVersions ? (
        <div
          className="tune-chart"
          data-expanded="true"
          style={{ marginTop: "1rem" }}
        >
          <span className="tune-chart__label">Chord Chart</span>
          {tune.chart.contentMarkdown}
        </div>
      ) : null}

      <div className="callout">
        <h2>Notes</h2>
        {renderTextBlock(tune.notes, "No published tune notes yet.")}
      </div>

      {tune.theSessionLink ? (
        <div className="callout">
          <h2>The Session</h2>
          <p>{renderTuneLink(tune.theSessionLink)}</p>
          {tune.theSessionLink.theSessionTuneId ? (
            <p style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>
              Tune {tune.theSessionLink.theSessionTuneId}
              {tune.theSessionLink.theSessionSettingId
                ? ` · setting ${tune.theSessionLink.theSessionSettingId}`
                : ""}
            </p>
          ) : null}
        </div>
      ) : null}

      {additionalLinks.length > 0 ? (
        <div className="callout">
          <h2>Links</h2>
          <ul className="checklist">
            {additionalLinks.map((link) => (
              <li key={`${link.provider}:${link.href}`}>{renderTuneLink(link)}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {tune.hasStructuredVersions ? (
        <div className="callout" style={{ display: "grid", gap: "1rem" }}>
          <h2>Versions</h2>
          {tune.versions.map((version, index) => {
            const versionLinks = version.links.filter(
              (link) => link.provider !== "the-session",
            );

            return (
              <div
                key={`${version.label}-${index}`}
                style={{
                  display: "grid",
                  gap: "0.75rem",
                  paddingTop: index > 0 ? "1rem" : 0,
                  borderTop:
                    index > 0 ? "1px solid color-mix(in srgb, var(--border) 80%, transparent)" : "none",
                }}
              >
                <div>
                  <div className="tune-name">
                    {version.label}
                    {index === 0 ? " (default)" : ""}
                  </div>
                  <div className="tune-sub">Tune version</div>
                </div>

                {version.theSessionLink ? (
                  <div>
                    <div>{renderTuneLink(version.theSessionLink)}</div>
                    {version.theSessionLink.theSessionTuneId ? (
                      <div
                        style={{ fontSize: "0.8125rem", color: "var(--muted)" }}
                      >
                        Tune {version.theSessionLink.theSessionTuneId}
                        {version.theSessionLink.theSessionSettingId
                          ? ` · setting ${version.theSessionLink.theSessionSettingId}`
                          : ""}
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {versionLinks.length > 0 ? (
                  <ul className="checklist">
                    {versionLinks.map((link) => (
                      <li key={`${link.provider}:${link.href}`}>{renderTuneLink(link)}</li>
                    ))}
                  </ul>
                ) : null}

                {version.parts.map((part, partIndex) => (
                  <div
                    key={`${version.label}-${part.name}-${part.alternateLabel ?? "primary"}-${partIndex}`}
                    className="tune-chart"
                    data-expanded="true"
                    style={{ marginTop: 0 }}
                  >
                    <span className="tune-chart__label">
                      {renderVersionPartLabel(part)}
                    </span>
                    {part.contentMarkdown}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      ) : null}

      {tune.workingNotes ? (
        <div className="callout">
          <h2>Working Notes</h2>
          {renderTextBlock(tune.workingNotes, "No working notes yet.")}
        </div>
      ) : null}

      <div className="callout">
        <h2>Preview sets</h2>
        {tune.setMemberships.length > 0 ? (
          <ul className="checklist">
            {tune.setMemberships.map((setMembership) => (
              <li key={setMembership.slug}>
                <Link
                  className="catalog-link"
                  href={`/preview/sets/${setMembership.slug}`}
                >
                  {setMembership.name}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>
            This tune is not linked from a preview set yet.
          </p>
        )}
      </div>

      <p className="back-link">
        <Link href="/preview/tunes">← Back to draft tunes</Link>
      </p>
    </div>
  );
}
