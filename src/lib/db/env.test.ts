import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { loadDatabaseUrlFromEnvFile } from "./env";

describe("loadDatabaseUrlFromEnvFile", () => {
  let tempDir: string | undefined;

  afterEach(async () => {
    if (tempDir) {
      await rm(tempDir, { recursive: true, force: true });
      tempDir = undefined;
    }
  });

  it("loads DATABASE_URL from .env without truncating query params", async () => {
    tempDir = await mkdtemp(path.join(os.tmpdir(), "sessionbook-db-env-"));
    await writeFile(
      path.join(tempDir, ".env"),
      "DATABASE_URL=postgres://host/sessionbook?sslmode=require&options=endpoint%3Dus-east-1\n",
      "utf8",
    );
    expect(loadDatabaseUrlFromEnvFile(path.join(tempDir, ".env"))).toBe(
      "postgres://host/sessionbook?sslmode=require&options=endpoint%3Dus-east-1",
    );
  });
});
