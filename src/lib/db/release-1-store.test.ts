import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createDatabaseClient } from "./client";
import { getDatabaseUrl } from "./env";
import { runDatabaseMigrations } from "./migrate";
import { loadRelease1StoreFromDatabase } from "./release-1-store";
import { seedRelease1Catalog } from "./seed";

const runDatabaseTests = Boolean(getDatabaseUrl());
const describeIfDatabase = runDatabaseTests ? describe : describe.skip;

describeIfDatabase("loadRelease1StoreFromDatabase", () => {
  let sql: ReturnType<typeof createDatabaseClient>;

  beforeAll(async () => {
    sql = createDatabaseClient();
    await runDatabaseMigrations(sql);
    await seedRelease1Catalog(sql);
  });

  afterAll(async () => {
    await sql.end({ timeout: 5 });
  });

  it("loads the seeded Release 1 store from Postgres", async () => {
    const store = await loadRelease1StoreFromDatabase();

    expect(store).not.toBeNull();
    expect(store?.tunes).toHaveLength(35);
    expect(store?.tuneAliases).toHaveLength(2);
    expect(store?.charts).toHaveLength(35);
    expect(store?.sets).toHaveLength(14);
    expect(store?.gigSheets).toHaveLength(1);
  });
});
