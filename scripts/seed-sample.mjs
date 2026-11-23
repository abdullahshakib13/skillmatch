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

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  try {
    await client.connect();
    console.log("Connected to Neon DB for sample data seeding...");

    // 1. Create a demo recruiter user if not exists
    const recruiterEmail = "recruiter@demo.com";
    let userRes = await client.query('SELECT id FROM "user" WHERE email = $1', [recruiterEmail]);
    let recruiterId;

    if (userRes.rows.length === 0) {
      const insertUser = await client.query(
        `INSERT INTO "user" (id, name, email, role, "emailVerified", "createdAt", "updatedAt")
         VALUES ('demo-recruiter-id-001', 'Sarah Connor (Tech Talent)', $1, 'recruiter', true, NOW(), NOW())
         RETURNING id`,
        [recruiterEmail]
      );
      recruiterId = insertUser.rows[0].id;
    } else {
      recruiterId = userRes.rows[0].id;
    }

    // Check if jobs exist
    const jobsCount = await client.query("SELECT COUNT(*) FROM jobs");
    if (parseInt(jobsCount.rows[0].count) > 0) {
      console.log("Jobs already exist in database. Skipping sample job creation.");
      return;
    }

    // Get skill IDs
    const skillsRes = await client.query("SELECT id, name FROM skills");
    const skillMap = new Map();
    skillsRes.rows.forEach((s) => skillMap.set(s.name.toLowerCase(), s.id));

    // Sample Job 1
    const job1 = await client.query(
      `INSERT INTO jobs (recruiter_id, title, company_name, location, job_type, salary_range, description, status)
       VALUES ($1, 'Senior Full-Stack Engineer', 'Vercel Ecosystem', 'Remote (Global)', 'Full-time', '$130,000 - $160,000',
       'We are looking for a Senior Full-Stack Engineer with solid experience in Next.js, React, TypeScript, and modern relational databases (PostgreSQL). You will design scalable web applications and high-throughput APIs.', 'open')
       RETURNING id`,
      [recruiterId]
    );
    const j1Skills = ["react", "next.js", "typescript", "postgresql"].map((s) => skillMap.get(s)).filter(Boolean);
    for (const sid of j1Skills) {
      await client.query("INSERT INTO job_skills (job_id, skill_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [job1.rows[0].id, sid]);
    }

    // Sample Job 2
    const job2 = await client.query(
      `INSERT INTO jobs (recruiter_id, title, company_name, location, job_type, salary_range, description, status)
       VALUES ($1, 'Backend Node.js & Database Architect', 'FinTech Labs', 'San Francisco, CA / Remote', 'Full-time', '$140,000 - $175,000',
       'Seeking a Backend Architect to lead database optimization, REST/GraphQL microservices, and high-performance serverless services using Node.js, Express, PostgreSQL, and Redis caching.', 'open')
       RETURNING id`,
      [recruiterId]
    );
    const j2Skills = ["node.js", "postgresql", "redis", "rest api", "docker"].map((s) => skillMap.get(s)).filter(Boolean);
    for (const sid of j2Skills) {
      await client.query("INSERT INTO job_skills (job_id, skill_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [job2.rows[0].id, sid]);
    }

    // Sample Job 3
    const job3 = await client.query(
      `INSERT INTO jobs (recruiter_id, title, company_name, location, job_type, salary_range, description, status)
       VALUES ($1, 'Frontend UI/UX Engineer', 'DesignCraft Studio', 'New York, NY', 'Contract', '$90,000 - $115,000',
       'Looking for a passionate frontend engineer skilled in React, Tailwind CSS, and TypeScript. You will build delighting interactive client interfaces, accessible component design systems, and fast web experiences.', 'open')
       RETURNING id`,
      [recruiterId]
    );
    const j3Skills = ["react", "typescript", "tailwind css", "html/css"].map((s) => skillMap.get(s)).filter(Boolean);
    for (const sid of j3Skills) {
      await client.query("INSERT INTO job_skills (job_id, skill_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [job3.rows[0].id, sid]);
    }

    console.log("✅ 3 sample jobs with skill tags seeded successfully!");
  } catch (err) {
    console.error("Error seeding sample data:", err);
  } finally {
    await client.end();
  }
}

main();
