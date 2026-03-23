import { cache } from "react";

import { release1FixtureStore } from "@/data/release-1/fixture-store";
import { hasDatabaseUrl } from "@/lib/db/env";
import { loadRelease1StoreFromDatabase } from "@/lib/db/release-1-store";
import type { Release1Store } from "@/lib/release-1/schema";
import { createRelease1Repository } from "@/lib/release-1/repository";

export type Release1RepositorySource = "fixtures" | "database";

type LoadRelease1StoreSourceDeps = {
  hasConfiguredDatabaseUrl: () => boolean;
  loadDatabaseStore: () => Promise<Release1Store | null>;
  fixtureStore: Release1Store;
};

export async function loadRelease1StoreSource({
  hasConfiguredDatabaseUrl,
  loadDatabaseStore,
  fixtureStore,
}: LoadRelease1StoreSourceDeps): Promise<{
  source: Release1RepositorySource;
  store: Release1Store;
}> {
  if (!hasConfiguredDatabaseUrl()) {
    return {
      source: "fixtures",
      store: fixtureStore,
    };
  }

  const databaseStore = await loadDatabaseStore();

  if (!databaseStore) {
    throw new Error(
      "DATABASE_URL is configured but the Release 1 catalog could not be loaded from Postgres.",
    );
  }

  return {
    source: "database",
    store: databaseStore,
  };
}

export const loadRelease1Repository = cache(async () => {
  const { source, store } = await loadRelease1StoreSource({
    hasConfiguredDatabaseUrl: hasDatabaseUrl,
    loadDatabaseStore: loadRelease1StoreFromDatabase,
    fixtureStore: release1FixtureStore,
  });

  return {
    repository: createRelease1Repository(store),
    source,
  };
});
