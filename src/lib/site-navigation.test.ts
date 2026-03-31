import { describe, expect, it } from "vitest";

import {
  allSections,
  ownerSections,
  publicSections,
} from "@/lib/site-navigation";

describe("site navigation", () => {
  it("covers the expected public browse and search surfaces", () => {
    expect(publicSections.map((section) => section.href)).toEqual([
      "/tunes",
      "/sets",
      "/sessions",
      "/search",
    ]);
  });

  it("covers the expected owner access surfaces", () => {
    expect(ownerSections.map((section) => section.href)).toEqual([
      "/preview",
      "/login",
      "/gigs/st-paddys-day",
    ]);
  });

  it("keeps route definitions unique", () => {
    const hrefs = allSections.map((section) => section.href);

    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it("marks tune and set routes as live catalog surfaces without stale roadmap labels", () => {
    expect(
      publicSections.slice(0, 3).every((section) => !section.nextIssue),
    ).toBe(true);
    expect(
      publicSections
        .slice(0, 3)
        .every((section) => section.status === "Live public catalog surface"),
    ).toBe(true);
    expect(publicSections[3]?.nextIssue).toBe("#9");
  });
});
