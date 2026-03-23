import postgres, { type Sql } from "postgres";

import { getDatabaseUrl } from "./env";

let cachedDatabaseClient: Sql | undefined;
let shutdownHandlersRegistered = false;

function registerDatabaseShutdownHandlers() {
  if (shutdownHandlersRegistered || typeof process === "undefined") {
    return;
  }

  shutdownHandlersRegistered = true;

  const shutdown = (signal: NodeJS.Signals) => {
    void closeDatabaseClient()
      .catch((error) => {
        console.error(`Failed to close Postgres client on ${signal}.`, error);
      });
  };

  process.once("SIGTERM", () => shutdown("SIGTERM"));
  process.once("SIGINT", () => shutdown("SIGINT"));
}

export function createDatabaseClient(databaseUrl = getDatabaseUrl()): Sql {
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }

  return postgres(databaseUrl, {
    idle_timeout: 5,
    // Keep the first Cloud Run rollout conservative so one instance does not
    // claim a large share of a small Neon connection budget.
    max: 1,
    onnotice: () => undefined,
  });
}

export function getDatabaseClient(): Sql {
  if (!cachedDatabaseClient) {
    registerDatabaseShutdownHandlers();
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
