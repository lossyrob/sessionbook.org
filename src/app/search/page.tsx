import { PlaceholderPage } from "@/components/placeholder-page";
import { getSectionByPath } from "@/lib/site-navigation";

const bullets = [
  "The public search entry point exists before the actual tune-search behavior is implemented.",
  "Later search work can focus on ranking against the alias-backed repository layer instead of route scaffolding.",
  "This route keeps the public information architecture visible while interactive search behavior remains out of scope.",
];

export default function SearchPage() {
  return <PlaceholderPage bullets={bullets} section={getSectionByPath("/search")} />;
}
