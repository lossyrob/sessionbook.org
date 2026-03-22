import { describe, expect, it } from "vitest";

import { allSections, ownerSections, publicSections } from "@/lib/site-navigation";

describe("site navigation", () => {
  it("covers the expected public bootstrap surfaces", () => {
    expect(publicSections.map((section) => section.href)).toEqual([
      "/tunes",
      "/sets",
      "/search",
    ]);
  });

  it("covers the expected owner bootstrap surfaces", () => {
    expect(ownerSections.map((section) => section.href)).toEqual([
      "/login",
      "/gigs/st-paddys-day",
    ]);
  });

  it("keeps route definitions unique", () => {
    const hrefs = allSections.map((section) => section.href);

    expect(new Set(hrefs).size).toBe(hrefs.length);
  });
});
