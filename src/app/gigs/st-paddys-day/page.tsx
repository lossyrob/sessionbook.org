import { PlaceholderPage } from "@/components/placeholder-page";
import { getSectionByPath } from "@/lib/site-navigation";

const bullets = [
  "The first private gig-sheet path already exists in the app structure.",
  "Future owner-only work can add auth guards and seeded private content without renaming routes.",
  "The placeholder keeps the milestone's first protected surface visible while remaining out of scope for this bootstrap issue.",
];

export default function StPaddysDayGigPage() {
  return (
    <PlaceholderPage
      bullets={bullets}
      section={getSectionByPath("/gigs/st-paddys-day")}
    />
  );
}
