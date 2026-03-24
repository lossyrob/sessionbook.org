export function tuneTypeBadgeClass(tuneType: string): string {
  const normalized = tuneType.toLowerCase();

  if (normalized === "jig") return "type-badge type-badge--jig";
  if (normalized === "reel") return "type-badge type-badge--reel";
  if (normalized === "hornpipe") return "type-badge type-badge--hornpipe";
  if (normalized === "polka") return "type-badge type-badge--polka";

  return "type-badge type-badge--jig";
}
