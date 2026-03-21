import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { getServerEnv } from "@/lib/server/env";
import * as schema from "@/db/schema";

const env = getServerEnv();
const sql = neon(env.databaseUrl);

export const db = drizzle(sql, { schema });

export type Database = typeof db;
