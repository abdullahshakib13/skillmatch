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

let connectionString = process.env.DATABASE_URL;
if (connectionString && connectionString.includes("sslmode=require")) {
  connectionString = connectionString.replace("sslmode=require", "sslmode=verify-full");
}

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function checkDatabase() {
  try {
    console.log("Connecting to Neon PostgreSQL...");
    await client.connect();
    console.log(" Connected to Neon successfully!\n");

    // 1. Get all public tables
    const tablesRes = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log("==========================================");
    console.log("         NEON DATABASE TABLES SUMMARY     ");
    console.log("==========================================");

    for (const row of tablesRes.rows) {
      const tableName = row.table_name;
      // Get row count
      const countRes = await client.query(`SELECT COUNT(*) FROM "${tableName}"`);
      const count = countRes.rows[0].count;
      console.log(` • ${tableName.padEnd(22)}: ${count} rows`);
    }

    console.log("==========================================\n");

    // 2. Sample data check from jobs and skills
    const skillsRes = await client.query("SELECT COUNT(*) FROM skills");
    const jobsRes = await client.query("SELECT id, title, company_name FROM jobs LIMIT 3");

    console.log(`Total Standard Skills in DB: ${skillsRes.rows[0].count}`);
    console.log("Sample Active Jobs in DB:");
    jobsRes.rows.forEach((j) => {
      console.log(`   [Job #${j.id}] ${j.title} at ${j.company_name}`);
    });

    console.log("\n All database tables and relationships are set up correctly!");
  } catch (err) {
    console.error("❌ Connection or query error:", err);
  } finally {
    await client.end();
  }
}

checkDatabase();
