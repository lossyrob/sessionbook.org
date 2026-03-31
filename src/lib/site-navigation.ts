export type SiteSection = {
  href: string;
  label: string;
  summary: string;
  showInHeader: boolean;
};

export const sections: SiteSection[] = [
  {
    href: "/tunes",
    label: "Tunes",
    summary:
      "Browse the tune catalog, open tune detail pages, and follow linked sets from each chart entry.",
    showInHeader: true,
  },
  {
    href: "/sets",
    label: "Sets",
    summary:
      "Browse sets, open ordered set detail pages, and jump straight to the tunes they contain.",
    showInHeader: true,
  },
  {
    href: "/sessions",
    label: "Sessions",
    summary:
      "Browse session pages built from the shared corpus and jump into the ordered sets prepared for each session.",
    showInHeader: true,
  },
  {
    href: "/search",
    label: "Search",
    summary:
      "Search the tune catalog by name or alias and jump straight to tune detail pages.",
    showInHeader: true,
  },
  {
    href: "/about",
    label: "About",
    summary:
      "What SessionBook is, where it's headed, and how it relates to thesession.org.",
    showInHeader: true,
  },
];

export function getSectionByPath(pathname: string): SiteSection {
  const section = sections.find((candidate) => candidate.href === pathname);

  if (!section) {
    throw new Error(`Unknown site section: ${pathname}`);
  }

  return section;
}
