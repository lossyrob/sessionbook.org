export type SiteSection = {
  href: string;
  label: string;
  summary: string;
  nextIssue: string;
  status: string;
  showInHeader: boolean;
};

export const publicSections: SiteSection[] = [
  {
    href: "/tunes",
    label: "Tunes",
    summary: "Browse the first schema-backed tune index, complete with aliases, chart metadata, and set links.",
    nextIssue: "#5 and #7",
    status: "Schema-backed public catalog surface",
    showInHeader: true,
  },
  {
    href: "/sets",
    label: "Sets",
    summary: "Browse public sets as ordered, chart-linked records instead of placeholder route shells.",
    nextIssue: "#5 and #8",
    status: "Schema-backed public catalog surface",
    showInHeader: true,
  },
  {
    href: "/search",
    label: "Search",
    summary: "Keep the search entry point visible while later issues add ranking and interactions on top of the alias-backed repository.",
    nextIssue: "#5 and #9",
    status: "Planned search surface",
    showInHeader: true,
  },
];

export const ownerSections: SiteSection[] = [
  {
    href: "/login",
    label: "Owner sign in",
    summary: "Reserve the auth entry point for owner-only flows without implementing auth yet.",
    nextIssue: "#6",
    status: "Planned owner access surface",
    showInHeader: true,
  },
  {
    href: "/gigs/st-paddys-day",
    label: "St. Paddy's Day gig",
    summary: "Prove the private gig-sheet storage contract before later issues add auth enforcement and richer owner flows.",
    nextIssue: "#11",
    status: "Schema-backed private content surface",
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
