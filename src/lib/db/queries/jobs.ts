import { query, pool } from "@/lib/db";
import { Job, JobWithSkills, Skill } from "@/types";

/**
 * Fetch all open jobs with attached skills
 */
export async function getAllOpenJobs(): Promise<JobWithSkills[]> {
  const jobsRes = await query<Job>(
    `SELECT id, recruiter_id, title, company_name, location, job_type, salary_range, description, status, created_at, updated_at
     FROM jobs
     WHERE status = 'open'
     ORDER BY created_at DESC`
  );

  if (jobsRes.rows.length === 0) return [];

  const jobIds = jobsRes.rows.map((j) => j.id);

  const skillsRes = await query<Skill & { job_id: number }>(
    `SELECT s.id, s.name, s.category, s.created_at, js.job_id
     FROM job_skills js
     JOIN skills s ON js.skill_id = s.id
     WHERE js.job_id = ANY($1::int[])
     ORDER BY s.name ASC`,
    [jobIds]
  );

  const skillMap = new Map<number, Skill[]>();
  for (const s of skillsRes.rows) {
    const list = skillMap.get(s.job_id) || [];
    list.push({
      id: s.id,
      name: s.name,
      category: s.category,
      created_at: s.created_at,
    });
    skillMap.set(s.job_id, list);
  }

  return jobsRes.rows.map((job) => ({
    ...job,
    skills: skillMap.get(job.id) || [],
  }));
}

/**
 * Fetch a single job by ID with required skills
 */
export async function getJobById(jobId: number): Promise<JobWithSkills | null> {
  const jobRes = await query<Job>(
    `SELECT id, recruiter_id, title, company_name, location, job_type, salary_range, description, status, created_at, updated_at
     FROM jobs
     WHERE id = $1`,
    [jobId]
  );

  if (jobRes.rows.length === 0) return null;

  const skillsRes = await query<Skill>(
    `SELECT s.id, s.name, s.category, s.created_at
     FROM job_skills js
     JOIN skills s ON js.skill_id = s.id
     WHERE js.job_id = $1
     ORDER BY s.name ASC`,
    [jobId]
  );

  return {
    ...jobRes.rows[0],
    skills: skillsRes.rows,
  };
}

/**
 * Fetch all jobs posted by a specific recruiter with applicant count
 */
export async function getRecruiterJobs(
  recruiterId: string
): Promise<JobWithSkills[]> {
  const jobsRes = await query<Job & { applicant_count: string }>(
    `SELECT j.id, j.recruiter_id, j.title, j.company_name, j.location, j.job_type, j.salary_range,
            j.description, j.status, j.created_at, j.updated_at,
            COUNT(a.id)::int as applicant_count
     FROM jobs j
     LEFT JOIN applications a ON j.id = a.job_id
     WHERE j.recruiter_id = $1
     GROUP BY j.id
     ORDER BY j.created_at DESC`,
    [recruiterId]
  );

  if (jobsRes.rows.length === 0) return [];

  const jobIds = jobsRes.rows.map((j) => j.id);

  const skillsRes = await query<Skill & { job_id: number }>(
    `SELECT s.id, s.name, s.category, s.created_at, js.job_id
     FROM job_skills js
     JOIN skills s ON js.skill_id = s.id
     WHERE js.job_id = ANY($1::int[])
     ORDER BY s.name ASC`,
    [jobIds]
  );

  const skillMap = new Map<number, Skill[]>();
  for (const s of skillsRes.rows) {
    const list = skillMap.get(s.job_id) || [];
    list.push({
      id: s.id,
      name: s.name,
      category: s.category,
      created_at: s.created_at,
    });
    skillMap.set(s.job_id, list);
  }

  return jobsRes.rows.map((job) => ({
    ...job,
    applicant_count: Number(job.applicant_count) || 0,
    skills: skillMap.get(job.id) || [],
  }));
}

/**
 * Create a new job with required skills in a single transaction
 */
export async function createJob(
  recruiterId: string,
  data: {
    title: string;
    company_name: string;
    location: string;
    job_type: string;
    salary_range?: string;
    description: string;
  },
  skillIds: number[]
): Promise<Job> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const jobRes = await client.query<Job>(
      `INSERT INTO jobs (recruiter_id, title, company_name, location, job_type, salary_range, description, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'open')
       RETURNING id, recruiter_id, title, company_name, location, job_type, salary_range, description, status, created_at, updated_at`,
      [
        recruiterId,
        data.title,
        data.company_name,
        data.location,
        data.job_type,
        data.salary_range || null,
        data.description,
      ]
    );

    const job = jobRes.rows[0];

    if (skillIds.length > 0) {
      const values = skillIds
        .map((_, idx) => `($1, $${idx + 2})`)
        .join(", ");
      await client.query(
        `INSERT INTO job_skills (job_id, skill_id) VALUES ${values}`,
        [job.id, ...skillIds]
      );
    }

    await client.query("COMMIT");
    return job;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Toggle job status between open and closed
 */
export async function updateJobStatus(
  jobId: number,
  recruiterId: string,
  status: "open" | "closed"
): Promise<boolean> {
  const result = await query(
    `UPDATE jobs SET status = $1, updated_at = NOW()
     WHERE id = $2 AND recruiter_id = $3`,
    [status, jobId, recruiterId]
  );
  return (result.rowCount ?? 0) > 0;
}
