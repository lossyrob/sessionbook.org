import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import type { Sql } from "postgres";

const migrationsDirectory = path.join(process.cwd(), "src", "lib", "db", "migrations");

export async function runDatabaseMigrations(sql: Sql): Promise<string[]> {
  await sql`
    create table if not exists schema_migrations (
      name text primary key,
      applied_at timestamptz not null default now()
    )
  `;

  const migrationFiles = (await readdir(migrationsDirectory))
    .filter((fileName) => fileName.endsWith(".sql"))
    .sort();

  const appliedRows = await sql`select name from schema_migrations order by name`;
  const appliedNames = new Set(appliedRows.map((row) => String(row.name)));
  const executedMigrations: string[] = [];

  for (const fileName of migrationFiles) {
    if (appliedNames.has(fileName)) {
      continue;
    }

    const migrationSql = await readFile(path.join(migrationsDirectory, fileName), "utf8");
    await sql.begin(async (transaction) => {
      await transaction.unsafe(migrationSql);
      await transaction.unsafe(
        `
          insert into schema_migrations (name)
          values ($1)
        `,
        [fileName],
      );
    });
    appliedNames.add(fileName);
    executedMigrations.push(fileName);
  }

  return executedMigrations;
}
