import { query, pool } from "@/lib/db";
import { CandidateProfile, CandidateWithSkills, Skill } from "@/types";

/**
 * Get or create candidate profile for a user
 */
export async function getOrCreateCandidateProfile(
  userId: string
): Promise<CandidateProfile> {
  // First attempt to fetch
  const existing = await query<CandidateProfile>(
    "SELECT id, user_id, headline, bio, experience_years, resume_link, created_at, updated_at FROM candidate_profiles WHERE user_id = $1",
    [userId]
  );

  if (existing.rows.length > 0) {
    return existing.rows[0];
  }

  // Insert default profile
  const inserted = await query<CandidateProfile>(
    `INSERT INTO candidate_profiles (user_id, headline, bio, experience_years, resume_link)
     VALUES ($1, 'Software Developer', '', 0, '')
     RETURNING id, user_id, headline, bio, experience_years, resume_link, created_at, updated_at`,
    [userId]
  );

  return inserted.rows[0];
}

/**
 * Get candidate profile with associated skills
 */
export async function getCandidateProfileWithSkills(
  userId: string
): Promise<CandidateWithSkills | null> {
  const profile = await getOrCreateCandidateProfile(userId);

  const userRes = await query<{ name: string; email: string }>(
    `SELECT name, email FROM "user" WHERE id = $1`,
    [userId]
  );

  const skillsRes = await query<Skill & { proficiency: string }>(
    `SELECT s.id, s.name, s.category, s.created_at, cs.proficiency
     FROM candidate_skills cs
     JOIN skills s ON cs.skill_id = s.id
     WHERE cs.candidate_id = $1
     ORDER BY s.name ASC`,
    [profile.id]
  );

  return {
    ...profile,
    name: userRes.rows[0]?.name || "",
    email: userRes.rows[0]?.email || "",
    skills: skillsRes.rows,
  };
}

/**
 * Update candidate personal profile fields
 */
export async function updateCandidateProfile(
  userId: string,
  data: {
    headline: string;
    bio: string;
    experience_years: number;
    resume_link?: string;
  }
): Promise<CandidateProfile> {
  const result = await query<CandidateProfile>(
    `UPDATE candidate_profiles
     SET headline = $1, bio = $2, experience_years = $3, resume_link = $4, updated_at = NOW()
     WHERE user_id = $5
     RETURNING id, user_id, headline, bio, experience_years, resume_link, created_at, updated_at`,
    [data.headline, data.bio, data.experience_years, data.resume_link || "", userId]
  );
  return result.rows[0];
}

/**
 * Sync candidate skills (replaces previous skill set)
 */
export async function updateCandidateSkills(
  candidateId: number,
  skillIds: number[]
): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // Clear old skills
    await client.query("DELETE FROM candidate_skills WHERE candidate_id = $1", [candidateId]);

    // Insert new skills
    if (skillIds.length > 0) {
      const values = skillIds
        .map((_, idx) => `($1, $${idx + 2}, 'intermediate')`)
        .join(", ");
      await client.query(
        `INSERT INTO candidate_skills (candidate_id, skill_id, proficiency) VALUES ${values}`,
        [candidateId, ...skillIds]
      );
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
