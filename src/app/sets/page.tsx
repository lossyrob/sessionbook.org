import { PlaceholderPage } from "@/components/placeholder-page";
import { getSectionByPath } from "@/lib/site-navigation";

const bullets = [
  "The set browser now has a reserved route in the app shell.",
  "Shared navigation and styling are in place before set-specific content and linking land.",
  "Later Release 1 work can add seeded set data without rearranging the top-level app structure.",
];

export default function SetsPage() {
  return <PlaceholderPage bullets={bullets} section={getSectionByPath("/sets")} />;
}
