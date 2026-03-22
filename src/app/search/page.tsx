import { PlaceholderPage } from "@/components/placeholder-page";
import { getSectionByPath } from "@/lib/site-navigation";

const bullets = [
  "The public search entry point exists before the actual tune-search behavior is implemented.",
  "Later search work can focus on seeded names, aliases, and result ranking instead of route scaffolding.",
  "This route keeps the public information architecture visible while the catalog remains unseeded.",
];

export default function SearchPage() {
  return <PlaceholderPage bullets={bullets} section={getSectionByPath("/search")} />;
}
