export const stPaddysDayGigMetadata = {
  id: "st-paddys-day",
  slug: "st-paddys-day",
  name: "St. Paddy's Day 2026",
  summary:
    "Derived from the checked-in St. Paddy's Day PDF by reusing the non-[drop] public source groups from Sessions/chyunes_mbys.md in source order.",
  sourcePdf: "Sessions/StPaddyDayJam-2026-chords.pdf",
  includeDropMarkedSourceGroups: false,
} as const;

export const expectedExcludedSourceTitles = [
  "Kitty Lie Over",
  "Up in the Air",
  "The Rolling Waves",
  "The Highlander's Farewell to Ireland",
  "Farewell to Erin",
  "Put Me in the Big Chest",
  "Josefin's Waltz",
] as const;
