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
    summary: "Browse the chord-chart catalog and land on the tune pages that anchor Release 1.",
    nextIssue: "#5 and #7",
    status: "Planned public catalog surface",
    showInHeader: true,
  },
  {
    href: "/sets",
    label: "Sets",
    summary: "Surface browseable sets as first-class objects before gig-specific views arrive.",
    nextIssue: "#5 and #8",
    status: "Planned public catalog surface",
    showInHeader: true,
  },
  {
    href: "/search",
    label: "Search",
    summary: "Provide the tune search entry point that later hooks into seeded names and aliases.",
    nextIssue: "#5 and #9",
    status: "Planned public catalog surface",
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
    summary: "Hold the private gig-sheet route that later becomes the first protected owner page.",
    nextIssue: "#11",
    status: "Planned private content surface",
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
