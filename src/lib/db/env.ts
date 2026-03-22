import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const databaseUrlPrefix = "DATABASE_URL=";

function stripWrappingQuotes(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

export function loadDatabaseUrlFromEnvFile(
  envPath = path.join(process.cwd(), ".env"),
): string | undefined {
  if (!existsSync(envPath)) {
    return undefined;
  }

  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    if (line.startsWith(databaseUrlPrefix)) {
      return stripWrappingQuotes(line.slice(databaseUrlPrefix.length));
    }
  }

  return undefined;
}

export function getDatabaseUrl(): string | undefined {
  const processValue = process.env.DATABASE_URL?.trim();

  if (processValue) {
    return processValue;
  }

  const envFileValue = loadDatabaseUrlFromEnvFile();

  if (envFileValue) {
    process.env.DATABASE_URL = envFileValue;
    return envFileValue;
  }

  return undefined;
}

export function hasDatabaseUrl(): boolean {
  return Boolean(getDatabaseUrl());
}
