import { describe, expect, it } from "vitest";

import { sections } from "@/lib/site-navigation";

describe("site navigation", () => {
  it("covers the expected browse and search surfaces", () => {
    expect(sections.map((section) => section.href)).toEqual([
      "/tunes",
      "/sets",
      "/sessions",
      "/search",
      "/about",
    ]);
  });

  it("keeps route definitions unique", () => {
    const hrefs = sections.map((section) => section.href);

    expect(new Set(hrefs).size).toBe(hrefs.length);
  });
});
