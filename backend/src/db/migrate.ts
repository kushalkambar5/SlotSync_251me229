import "dotenv/config";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { client, db } from "./client.js";

const currentDir = dirname(fileURLToPath(import.meta.url));
const sqlDir = join(currentDir, "sql");

async function applyRawSqlFiles(): Promise<void> {
  const files = readdirSync(sqlDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();
  for (const file of files) {
    const statement = readFileSync(join(sqlDir, file), "utf8");
    await db.execute(sql.raw(statement));
    console.log(`Applied ${file}`);
  }
}

async function main(): Promise<void> {
  await migrate(db, { migrationsFolder: "drizzle" });
  // Drizzle cannot express the §17 EXCLUDE constraint — apply it afterwards.
  await applyRawSqlFiles();
  await client.end();
  console.log("Migration complete");
}

void main().catch(async (err: unknown) => {
  console.error(err);
  await client.end();
  process.exit(1);
});
