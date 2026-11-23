import { Pool, QueryResult, QueryResultRow } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
}

// Ensure Neon connection string uses modern libpq-compatible SSL mode
let connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set in environment variables");
}

// Normalize sslmode=require to sslmode=verify-full to prevent Node security warning
if (connectionString.includes("sslmode=require")) {
  connectionString = connectionString.replace("sslmode=require", "sslmode=verify-full");
}

export const pool: Pool =
  global.__pgPool ||
  new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

if (process.env.NODE_ENV !== "production") {
  global.__pgPool = pool;
}

/**
 * Execute a parameterized SQL query
 */
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  const start = Date.now();
  const res = await pool.query<T>(text, params);
  const duration = Date.now() - start;
  if (process.env.NODE_ENV === "development" && duration > 500) {
    console.warn(`[Slow Query ${duration}ms]: ${text.substring(0, 80)}...`);
  }
  return res;
}
