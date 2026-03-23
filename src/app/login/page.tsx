import { PlaceholderPage } from "@/components/placeholder-page";
import { getSectionByPath } from "@/lib/site-navigation";

const bullets = [
  "The owner auth entry point is visible in the scaffold without implementing a provider yet.",
  "Later auth work can wire the chosen provider into a stable route and shell.",
  "Anonymous browsing remains frictionless because the catalog routes stay separate from the sign-in flow.",
];

export default function LoginPage() {
  return (
    <PlaceholderPage bullets={bullets} section={getSectionByPath("/login")} />
  );
}
