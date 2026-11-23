import { Application, CandidateProfile, Job, Skill, UserRole } from "./database";

export * from "./database";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  image?: string | null;
}

export interface JobWithSkills extends Job {
  skills: Skill[];
  applicant_count?: number;
}

export interface JobWithMatch extends JobWithSkills {
  match_percentage: number;
  matched_skills: Skill[];
  missing_skills: Skill[];
  has_applied?: boolean;
}

export interface CandidateWithSkills extends CandidateProfile {
  name: string;
  email: string;
  skills: (Skill & { proficiency: string })[];
}

export interface ApplicantWithDetails extends Application {
  candidate_name: string;
  candidate_email: string;
  candidate_headline: string | null;
  candidate_experience: number;
  candidate_resume: string | null;
  matched_skills: Skill[];
  missing_skills: Skill[];
}

export interface ServerActionResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
