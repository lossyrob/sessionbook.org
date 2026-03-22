import { cache } from "react";

import { release1FixtureStore } from "@/data/release-1/fixture-store";
import { hasDatabaseUrl } from "@/lib/db/env";
import { loadRelease1StoreFromDatabase } from "@/lib/db/release-1-store";
import { createRelease1Repository } from "@/lib/release-1/repository";

export type Release1RepositorySource = "fixtures" | "database";

export const loadRelease1Repository = cache(async () => {
  if (!hasDatabaseUrl()) {
    return {
      repository: createRelease1Repository(release1FixtureStore),
      source: "fixtures" as const satisfies Release1RepositorySource,
    };
  }

  const databaseStore = await loadRelease1StoreFromDatabase();

  if (!databaseStore) {
    return {
      repository: createRelease1Repository(release1FixtureStore),
      source: "fixtures" as const satisfies Release1RepositorySource,
    };
  }

  return {
    repository: createRelease1Repository(databaseStore),
    source: "database" as const satisfies Release1RepositorySource,
  };
});
