import fs from "fs";
import path from "path";
import pg from "pg";
const { Client } = pg;

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  content.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  });
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("❌ DATABASE_URL is not set");
  process.exit(1);
}

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function main() {
  try {
    console.log("Connecting to Neon PostgreSQL...");
    await client.connect();
    console.log("Connected successfully!");

    const schemaPath = path.resolve(process.cwd(), "src/lib/db/schema.sql");
    const sql = fs.readFileSync(schemaPath, "utf-8");

    console.log("Applying schema...");
    await client.query(sql);
    console.log("✅ Schema applied & skills seeded successfully!");
  } catch (err) {
    console.error("❌ Error initializing database:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
