import { query } from "@/lib/db";
import { ApplicantWithDetails, Application, Skill } from "@/types";

/**
 * Submit an application to a job
 */
export async function createApplication(
  jobId: number,
  candidateId: number,
  matchPercentage: number,
  coverNote?: string
): Promise<Application> {
  const result = await query<Application>(
    `INSERT INTO applications (job_id, candidate_id, match_percentage, status, cover_note)
     VALUES ($1, $2, $3, 'applied', $4)
     RETURNING id, job_id, candidate_id, match_percentage, status, cover_note, created_at, updated_at`,
    [jobId, candidateId, matchPercentage, coverNote || null]
  );
  return result.rows[0];
}

/**
 * Check if candidate has already applied to a job
 */
export async function hasCandidateApplied(
  jobId: number,
  candidateId: number
): Promise<boolean> {
  const result = await query(
    `SELECT 1 FROM applications WHERE job_id = $1 AND candidate_id = $2`,
    [jobId, candidateId]
  );
  return result.rows.length > 0;
}

/**
 * Get all applications submitted by a candidate (for candidate dashboard)
 */
export async function getCandidateApplications(candidateId: number) {
  const result = await query<{
    id: number;
    job_id: number;
    job_title: string;
    company_name: string;
    location: string;
    job_type: string;
    salary_range: string | null;
    job_status: string;
    match_percentage: number;
    status: "applied" | "shortlisted" | "rejected";
    cover_note: string | null;
    applied_at: Date;
  }>(
    `SELECT a.id, a.job_id, j.title as job_title, j.company_name, j.location,
            j.job_type, j.salary_range, j.status as job_status,
            a.match_percentage, a.status, a.cover_note, a.created_at as applied_at
     FROM applications a
     JOIN jobs j ON a.job_id = j.id
     WHERE a.candidate_id = $1
     ORDER BY a.created_at DESC`,
    [candidateId]
  );
  return result.rows;
}

/**
 * Get all applicants for a job (for recruiter review), sorted by match_percentage DESC
 */
export async function getJobApplicants(
  jobId: number,
  recruiterId: string
): Promise<ApplicantWithDetails[]> {
  // First verify recruiter owns the job
  const jobCheck = await query(
    `SELECT id FROM jobs WHERE id = $1 AND recruiter_id = $2`,
    [jobId, recruiterId]
  );
  if (jobCheck.rows.length === 0) {
    throw new Error("Job not found or unauthorized");
  }

  // Fetch job required skills
  const reqSkillsRes = await query<Skill>(
    `SELECT s.id, s.name, s.category, s.created_at
     FROM job_skills js
     JOIN skills s ON js.skill_id = s.id
     WHERE js.job_id = $1`,
    [jobId]
  );
  const requiredSkills = reqSkillsRes.rows;
  const requiredSkillIds = new Set(requiredSkills.map((s) => s.id));

  // Fetch applications with candidate details
  const appRes = await query<{
    id: number;
    job_id: number;
    candidate_id: number;
    match_percentage: number;
    status: "applied" | "shortlisted" | "rejected";
    cover_note: string | null;
    created_at: Date;
    updated_at: Date;
    candidate_name: string;
    candidate_email: string;
    candidate_headline: string | null;
    candidate_experience: number;
    candidate_resume: string | null;
  }>(
    `SELECT a.id, a.job_id, a.candidate_id, a.match_percentage, a.status, a.cover_note,
            a.created_at, a.updated_at,
            u.name as candidate_name, u.email as candidate_email,
            cp.headline as candidate_headline, cp.experience_years as candidate_experience,
            cp.resume_link as candidate_resume
     FROM applications a
     JOIN candidate_profiles cp ON a.candidate_id = cp.id
     JOIN "user" u ON cp.user_id = u.id
     WHERE a.job_id = $1
     ORDER BY a.match_percentage DESC, a.created_at ASC`,
    [jobId]
  );

  if (appRes.rows.length === 0) return [];

  const candidateIds = appRes.rows.map((r) => r.candidate_id);

  // Fetch skills of all applicants
  const candSkillsRes = await query<Skill & { candidate_id: number }>(
    `SELECT s.id, s.name, s.category, s.created_at, cs.candidate_id
     FROM candidate_skills cs
     JOIN skills s ON cs.skill_id = s.id
     WHERE cs.candidate_id = ANY($1::int[])`,
    [candidateIds]
  );

  const candSkillMap = new Map<number, Skill[]>();
  for (const cs of candSkillsRes.rows) {
    const list = candSkillMap.get(cs.candidate_id) || [];
    list.push({
      id: cs.id,
      name: cs.name,
      category: cs.category,
      created_at: cs.created_at,
    });
    candSkillMap.set(cs.candidate_id, list);
  }

  return appRes.rows.map((row) => {
    const candidateSkills = candSkillMap.get(row.candidate_id) || [];
    const matched: Skill[] = [];
    const missing: Skill[] = [];

    const candidateSkillIds = new Set(candidateSkills.map((s) => s.id));

    for (const req of requiredSkills) {
      if (candidateSkillIds.has(req.id)) {
        matched.push(req);
      } else {
        missing.push(req);
      }
    }

    return {
      ...row,
      matched_skills: matched,
      missing_skills: missing,
    };
  });
}

/**
 * Update applicant status (shortlist or reject)
 */
export async function updateApplicationStatus(
  applicationId: number,
  recruiterId: string,
  status: "applied" | "shortlisted" | "rejected"
): Promise<boolean> {
  const result = await query(
    `UPDATE applications
     SET status = $1, updated_at = NOW()
     WHERE id = $2
       AND job_id IN (SELECT id FROM jobs WHERE recruiter_id = $3)`,
    [status, applicationId, recruiterId]
  );
  return (result.rowCount ?? 0) > 0;
}
