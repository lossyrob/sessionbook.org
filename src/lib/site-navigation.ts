export type SiteSection = {
  href: string;
  label: string;
  summary: string;
  nextIssue?: string;
  status: string;
  showInHeader: boolean;
};

export const publicSections: SiteSection[] = [
  {
    href: "/tunes",
    label: "Tunes",
    summary:
      "Browse the live public tune catalog, open tune detail pages, and follow linked sets from each chart entry.",
    status: "Live public catalog surface",
    showInHeader: true,
  },
  {
    href: "/sets",
    label: "Sets",
    summary:
      "Browse public sets, open ordered set detail pages, and jump straight to the tunes they contain.",
    status: "Live public catalog surface",
    showInHeader: true,
  },
  {
    href: "/sessions",
    label: "Sessions",
    summary:
      "Browse public session pages built from the shared corpus and jump into the ordered sets prepared for each session.",
    status: "Live public catalog surface",
    showInHeader: true,
  },
  {
    href: "/search",
    label: "Search",
    summary:
      "Keep the search entry point visible while later issues add ranking and interactions on top of the alias-backed repository.",
    nextIssue: "#9",
    status: "Upcoming public search surface",
    showInHeader: true,
  },
];

export const ownerSections: SiteSection[] = [
  {
    href: "/preview",
    label: "Draft previews",
    summary:
      "Preview tune, set, and session pages backed by the shared markdown corpus while draft authoring stays distinct from the live public catalog.",
    status: "Live draft preview surface",
    showInHeader: true,
  },
  {
    href: "/login",
    label: "Owner sign in",
    summary:
      "Reserve the auth entry point for owner-only flows without implementing auth yet.",
    nextIssue: "#6",
    status: "Upcoming owner access surface",
    showInHeader: true,
  },
  {
    href: "/gigs/st-paddys-day",
    label: "St. Paddy's Day gig",
    summary:
      "Hold the private gig-sheet route while later issues add auth enforcement and the owner workflow.",
    nextIssue: "#11",
    status: "Upcoming private gig surface",
    showInHeader: false,
  },
];

export const allSections = [...publicSections, ...ownerSections];

export function getSectionByPath(pathname: string): SiteSection {
  const section = allSections.find((candidate) => candidate.href === pathname);

  if (!section) {
    throw new Error(`Unknown site section: ${pathname}`);
  }

  return section;
}
