import postgres, { type Sql } from "postgres";

import { getDatabaseUrl } from "./env";

let cachedDatabaseClient: Sql | undefined;

export function createDatabaseClient(databaseUrl = getDatabaseUrl()): Sql {
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }

  return postgres(databaseUrl, {
    max: 1,
    onnotice: () => undefined,
  });
}

export function getDatabaseClient(): Sql {
  if (!cachedDatabaseClient) {
    cachedDatabaseClient = createDatabaseClient();
  }

  return cachedDatabaseClient;
}

export async function closeDatabaseClient() {
  if (!cachedDatabaseClient) {
    return;
  }

  const sql = cachedDatabaseClient;
  cachedDatabaseClient = undefined;
  await sql.end({ timeout: 5 });
}
