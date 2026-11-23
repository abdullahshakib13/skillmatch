import { Skill } from "@/types";

export interface MatchResult {
  matchPercentage: number;
  matchedSkills: Skill[];
  missingSkills: Skill[];
}

/**
 * Calculates deterministic skill match percentage between candidate skills and job requirements.
 *
 * Rules:
 * 1. If job has 0 required skills, match = 100%
 * 2. Match % = round((matched_count / required_count) * 100)
 * 3. Returns matched skills and missing skills
 */
export function calculateSkillMatch(
  requiredSkills: Skill[],
  candidateSkills: Skill[]
): MatchResult {
  if (!requiredSkills || requiredSkills.length === 0) {
    return {
      matchPercentage: 100,
      matchedSkills: [],
      missingSkills: [],
    };
  }

  const candidateSkillMap = new Map<number, Skill>();
  for (const s of candidateSkills) {
    candidateSkillMap.set(s.id, s);
  }

  const matchedSkills: Skill[] = [];
  const missingSkills: Skill[] = [];

  for (const req of requiredSkills) {
    if (candidateSkillMap.has(req.id)) {
      matchedSkills.push(req);
    } else {
      missingSkills.push(req);
    }
  }

  const matchPercentage = Math.round(
    (matchedSkills.length / requiredSkills.length) * 100
  );

  return {
    matchPercentage,
    matchedSkills,
    missingSkills,
  };
}

/**
 * Helper to determine badge color based on match percentage
 */
export function getMatchBadgeColor(percentage: number): {
  color: "success" | "warning" | "danger" | "default";
  label: string;
} {
  if (percentage >= 75) {
    return { color: "success", label: "Strong Match" };
  } else if (percentage >= 40) {
    return { color: "warning", label: "Partial Match" };
  } else {
    return { color: "danger", label: "Low Match" };
  }
}
