import { z } from "zod";

export const tuneLinkProviderSchema = z.enum([
  "the-session",
  "youtube",
  "spotify",
  "repo",
  "external",
]);

export const tuneLinkSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
  provider: tuneLinkProviderSchema,
  theSessionTuneId: z.number().int().positive().optional(),
  theSessionSettingId: z.number().int().positive().optional(),
});

export type TuneLinkProvider = z.infer<typeof tuneLinkProviderSchema>;
export type TuneLink = z.infer<typeof tuneLinkSchema>;

function normalizeLineEndings(value: string): string {
  return value.replace(/\r\n?/g, "\n");
}

function isTheSessionHref(href: string): boolean {
  return /^https?:\/\/(?:www\.)?thesession\.org\//i.test(href);
}

function isYoutubeHref(href: string): boolean {
  return /^https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)\//i.test(href);
}

function isSpotifyHref(href: string): boolean {
  return /^https?:\/\/(?:open\.)?spotify\.com\//i.test(href);
}

function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

function getTuneLinkProvider(href: string): TuneLinkProvider {
  if (isTheSessionHref(href)) {
    return "the-session";
  }

  if (isYoutubeHref(href)) {
    return "youtube";
  }

  if (isSpotifyHref(href)) {
    return "spotify";
  }

  if (!isExternalHref(href)) {
    return "repo";
  }

  return "external";
}

function getTheSessionMetadata(href: string): {
  theSessionTuneId?: number;
  theSessionSettingId?: number;
} {
  const tuneMatch = href.match(
    /^https?:\/\/(?:www\.)?thesession\.org\/tunes\/(\d+)(?:[/?#].*)?$/i,
  );
  const settingMatch = href.match(/#setting(\d+)/i);

  return {
    theSessionTuneId: tuneMatch ? Number(tuneMatch[1]) : undefined,
    theSessionSettingId: settingMatch ? Number(settingMatch[1]) : undefined,
  };
}

function getDefaultTuneLinkLabel(args: {
  href: string;
  provider: TuneLinkProvider;
  theSessionSettingId?: number;
}): string {
  switch (args.provider) {
    case "the-session":
      return args.theSessionSettingId
        ? `The Session (setting ${args.theSessionSettingId})`
        : "The Session";
    case "youtube":
      return "YouTube";
    case "spotify":
      return "Spotify";
    case "repo":
    case "external":
      return args.href;
  }
}

export function isLikelyTuneLinkHref(value: string): boolean {
  const trimmed = value.trim();

  return (
    /^https?:\/\//i.test(trimmed) ||
    /^(?:[\w.-]+\/)+[\w./-]+(?:#[\w-]+)?$/i.test(trimmed)
  );
}

export function isExternalTuneLink(link: Pick<TuneLink, "href">): boolean {
  return isExternalHref(link.href);
}

export function parseTuneLinkValue(
  value: string,
  sourcePath: string,
): TuneLink {
  const trimmed = value.trim();

  if (!trimmed) {
    throw new Error(`${sourcePath}: expected a non-empty tune link value.`);
  }

  const separator = trimmed.match(/^(.*?)\s+\|\s+(.*)$/);
  const label = separator?.[1]?.trim();
  const href = (separator?.[2] ?? trimmed).trim();

  if (!href) {
    throw new Error(`${sourcePath}: expected a tune link target after "|".`);
  }

  const provider = getTuneLinkProvider(href);
  const theSessionMetadata =
    provider === "the-session" ? getTheSessionMetadata(href) : {};

  return tuneLinkSchema.parse({
    label:
      label ||
      getDefaultTuneLinkLabel({
        href,
        provider,
        theSessionSettingId: theSessionMetadata.theSessionSettingId,
      }),
    href,
    provider,
    ...theSessionMetadata,
  });
}

export function parseTuneLinksBlock(
  value: string | undefined,
  sourcePath: string,
): TuneLink[] {
  if (!value?.trim()) {
    return [];
  }

  return normalizeLineEndings(value)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => parseTuneLinkValue(line, sourcePath));
}

export function renderTuneLinkValue(link: TuneLink): string {
  const defaultLabel = getDefaultTuneLinkLabel({
    href: link.href,
    provider: link.provider,
    theSessionSettingId: link.theSessionSettingId,
  });

  if (link.label === defaultLabel) {
    return link.href;
  }

  return `${link.label} | ${link.href}`;
}

export function renderTuneLinksBlock(links: TuneLink[]): string {
  return links.map((link) => renderTuneLinkValue(link)).join("\n");
}
