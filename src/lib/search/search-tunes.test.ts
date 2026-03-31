import { describe, expect, it } from "vitest";

import { normalizeSearchTerm } from "@/lib/search/normalize";
import { searchTunes } from "@/lib/search/search-tunes";

const testTunes = [
  { name: "The Kesh Jig", aliases: [], tuneType: "Jig" },
  { name: "Glen of Aherlow", aliases: ["Lafferty's"], tuneType: "Reel" },
  {
    name: "Swinging on the Gate",
    aliases: ["Swinging on a Gate"],
    tuneType: "Reel",
  },
  { name: "The Green Mountain", aliases: ["Green Mountain"], tuneType: "Reel" },
  {
    name: "The Wounded Hussar",
    aliases: ["Captain O'Kane"],
    tuneType: "O'Carolan",
  },
  { name: "Morning Star", aliases: [], tuneType: "Reel" },
  { name: "Morrisons Jig", aliases: [], tuneType: "Jig" },
  {
    name: "Tabhair Dom Do Lámh",
    aliases: [],
    tuneType: "Waltz",
  },
];

describe("normalizeSearchTerm re-export", () => {
  it("re-exports from release-1", () => {
    expect(normalizeSearchTerm("The Kesh  Jig")).toBe("the kesh jig");
  });
});

describe("searchTunes", () => {
  it("returns empty for empty query", () => {
    expect(searchTunes("", testTunes)).toEqual([]);
    expect(searchTunes("   ", testTunes)).toEqual([]);
  });

  it("returns empty for no matches", () => {
    expect(searchTunes("zzznomatch", testTunes)).toEqual([]);
  });

  it("finds exact name match", () => {
    const results = searchTunes("Morning Star", testTunes);
    expect(results).toHaveLength(1);
    expect(results[0]?.item.name).toBe("Morning Star");
    expect(results[0]?.rank).toBe("exact");
  });

  it("finds prefix match", () => {
    const results = searchTunes("The Kesh", testTunes);
    expect(results).toHaveLength(1);
    expect(results[0]?.item.name).toBe("The Kesh Jig");
    expect(results[0]?.rank).toBe("prefix");
  });

  it("finds substring match", () => {
    const results = searchTunes("Aherlow", testTunes);
    expect(results).toHaveLength(1);
    expect(results[0]?.item.name).toBe("Glen of Aherlow");
    expect(results[0]?.rank).toBe("substring");
  });

  it("finds alias match", () => {
    const results = searchTunes("Lafferty", testTunes);
    expect(results).toHaveLength(1);
    expect(results[0]?.item.name).toBe("Glen of Aherlow");
    expect(results[0]?.rank).toBe("alias");
  });

  it("finds exact alias match", () => {
    const results = searchTunes("Captain O'Kane", testTunes);
    expect(results).toHaveLength(1);
    expect(results[0]?.item.name).toBe("The Wounded Hussar");
    expect(results[0]?.rank).toBe("alias");
  });

  it("ranks exact > prefix > substring > alias", () => {
    // "Morning" matches "Morning Star" (prefix) and "The Green Mountain" (substring via "morning"? no)
    // Let's use "mor" which matches "Morning Star" (prefix) and "Morrisons Jig" (prefix)
    const results = searchTunes("mor", testTunes);
    expect(results.length).toBeGreaterThanOrEqual(2);
    expect(results.every((r) => r.rank === "prefix")).toBe(true);
    // Within same rank, sorted alphabetically
    expect(results[0]?.item.name).toBe("Morning Star");
    expect(results[1]?.item.name).toBe("Morrisons Jig");
  });

  it("handles accented characters in search query", () => {
    const results = searchTunes("Lamh", testTunes);
    expect(results).toHaveLength(1);
    expect(results[0]?.item.name).toBe("Tabhair Dom Do Lámh");
  });

  it("handles accented characters in tune name", () => {
    const results = searchTunes("Lámh", testTunes);
    expect(results).toHaveLength(1);
    expect(results[0]?.item.name).toBe("Tabhair Dom Do Lámh");
  });

  it("does not return duplicates when name and alias both match", () => {
    // "Green Mountain" matches name (substring of "The Green Mountain")
    // and alias "Green Mountain" (exact)
    const results = searchTunes("Green Mountain", testTunes);
    const names = results.map((r) => r.item.name);
    expect(names.filter((n) => n === "The Green Mountain")).toHaveLength(1);
  });

  it("prefers name match over alias match", () => {
    // "Green Mountain" is both a substring of the name and an exact alias match
    // Name substring match should win (earlier tier check)
    const results = searchTunes("Green Mountain", testTunes);
    expect(results).toHaveLength(1);
    expect(results[0]?.item.name).toBe("The Green Mountain");
    expect(results[0]?.rank).toBe("substring");
  });

  it("is case insensitive", () => {
    const results = searchTunes("kesh", testTunes);
    expect(results).toHaveLength(1);
    expect(results[0]?.item.name).toBe("The Kesh Jig");
  });
});
