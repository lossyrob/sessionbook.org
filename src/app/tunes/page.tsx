import { PlaceholderPage } from "@/components/placeholder-page";
import { getSectionByPath } from "@/lib/site-navigation";

const bullets = [
  "A dedicated public route exists for the upcoming tune index and tune detail work.",
  "Navigation and shared layout already point here, so later tune issues can focus on data and UX.",
  "Tests cover the route metadata that keeps this surface wired into the bootstrap shell.",
];

export default function TunesPage() {
  return <PlaceholderPage bullets={bullets} section={getSectionByPath("/tunes")} />;
}
