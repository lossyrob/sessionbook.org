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
      "/search",
    ]);
  });

  it("covers the expected owner access surfaces", () => {
    expect(ownerSections.map((section) => section.href)).toEqual([
      "/login",
      "/gigs/st-paddys-day",
    ]);
  });

  it("keeps route definitions unique", () => {
    const hrefs = allSections.map((section) => section.href);

    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it("marks tune and set routes as the live public catalog surfaces", () => {
    expect(
      publicSections.slice(0, 2).map((section) => section.nextIssue),
    ).toEqual(["#7", "#8"]);
    expect(
      publicSections
        .slice(0, 2)
        .every((section) => section.status === "Live public catalog surface"),
    ).toBe(true);
  });
});
