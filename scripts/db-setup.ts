import { createDatabaseClient } from "../src/lib/db/client";
import { getDatabaseUrl } from "../src/lib/db/env";
import { runDatabaseMigrations } from "../src/lib/db/migrate";
import { seedRelease1Catalog } from "../src/lib/db/seed";

async function main() {
  const databaseUrl = getDatabaseUrl();

  if (!databaseUrl) {
    console.log("DATABASE_URL is not configured; skipping db:setup.");
    return;
  }

  const sql = createDatabaseClient(databaseUrl);

  try {
    const executedMigrations = await runDatabaseMigrations(sql);

    if (executedMigrations.length === 0) {
      console.log("No new database migrations were required.");
    } else {
      console.log(`Applied migrations: ${executedMigrations.join(", ")}`);
    }

    await seedRelease1Catalog(sql);
    console.log("Seeded the Release 1 catalog fixtures into Postgres.");
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
