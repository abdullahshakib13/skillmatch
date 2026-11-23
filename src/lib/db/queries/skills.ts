import { query } from "@/lib/db";
import { Skill } from "@/types";

/**
 * Fetch all available skills sorted by name
 */
export async function getAllSkills(): Promise<Skill[]> {
  const result = await query<Skill>(
    "SELECT id, name, category, created_at FROM skills ORDER BY category ASC, name ASC"
  );
  return result.rows;
}

/**
 * Fetch skills by an array of IDs
 */
export async function getSkillsByIds(ids: number[]): Promise<Skill[]> {
  if (!ids || ids.length === 0) return [];
  const result = await query<Skill>(
    "SELECT id, name, category, created_at FROM skills WHERE id = ANY($1::int[]) ORDER BY name ASC",
    [ids]
  );
  return result.rows;
}
