import { describe, expect, it } from "vitest";

import { release1FixtureStore } from "@/data/release-1/fixture-store";
import { loadRelease1StoreSource } from "@/lib/release-1/load-repository";

describe("loadRelease1StoreSource", () => {
  it("falls back to fixtures when no database url is configured", async () => {
    const result = await loadRelease1StoreSource({
      hasConfiguredDatabaseUrl: () => false,
      loadDatabaseStore: async () => {
        throw new Error("database loader should not run without DATABASE_URL");
      },
      fixtureStore: release1FixtureStore,
    });

    expect(result).toEqual({
      source: "fixtures",
      store: release1FixtureStore,
    });
  });

  it("returns the database store when it is available", async () => {
    const result = await loadRelease1StoreSource({
      hasConfiguredDatabaseUrl: () => true,
      loadDatabaseStore: async () => release1FixtureStore,
      fixtureStore: release1FixtureStore,
    });

    expect(result).toEqual({
      source: "database",
      store: release1FixtureStore,
    });
  });

  it("throws when DATABASE_URL is configured but the catalog cannot be loaded", async () => {
    await expect(
      loadRelease1StoreSource({
        hasConfiguredDatabaseUrl: () => true,
        loadDatabaseStore: async () => null,
        fixtureStore: release1FixtureStore,
      }),
    ).rejects.toThrow(
      "DATABASE_URL is configured but the Release 1 catalog could not be loaded from Postgres.",
    );
  });
});
