import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Create a .env file with DATABASE_URL=postgresql://..."
  );
}

const sql = neon(connectionString);
export const db = drizzle(sql, { schema });
