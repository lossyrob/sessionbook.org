import { describe, expect, it } from "vitest";

import { normalizeSearchTerm } from "@/lib/release-1/normalize-search-term";

describe("normalizeSearchTerm", () => {
  it("normalizes whitespace and punctuation", () => {
    expect(normalizeSearchTerm("  The Kesh  Jig  ")).toBe("the kesh jig");
    expect(normalizeSearchTerm("Green Mountain!!!")).toBe("green mountain");
  });

  it("folds accented characters to their ASCII search form", () => {
    expect(normalizeSearchTerm("Tabhair Dom Do Lámh")).toBe(
      "tabhair dom do lamh",
    );
    expect(normalizeSearchTerm("Tabhair Dom Do Lamh")).toBe(
      "tabhair dom do lamh",
    );
  });
});
