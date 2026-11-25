import { readFileSync } from "node:fs";
import { Pool } from "pg";

// A schema of its own for each run, from the local stack's Postgres, so runs
// never share data.
export async function testDatabase(): Promise<Pool> {
  const schema = `test_${Date.now()}`;
  const db = new Pool({ connectionString: process.env.DATABASE_URL, options: `-c search_path=${schema}` });
  await db.query(`CREATE SCHEMA ${schema}`);
  await db.query(readFileSync("db/migrations/001_bookings.sql", "utf8"));
  return db;
}
