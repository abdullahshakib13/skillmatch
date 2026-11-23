export type UserRole = "candidate" | "recruiter";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Skill {
  id: number;
  name: string;
  category: string;
  created_at: Date;
}

export interface CandidateProfile {
  id: number;
  user_id: string;
  headline: string | null;
  bio: string | null;
  experience_years: number;
  resume_link: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CandidateSkill {
  candidate_id: number;
  skill_id: number;
  proficiency: "beginner" | "intermediate" | "expert";
}

export interface Job {
  id: number;
  recruiter_id: string;
  title: string;
  company_name: string;
  location: string;
  job_type: string;
  salary_range: string | null;
  description: string;
  status: "open" | "closed";
  created_at: Date;
  updated_at: Date;
}

export interface JobSkill {
  job_id: number;
  skill_id: number;
}

export type ApplicationStatus = "applied" | "shortlisted" | "rejected";

export interface Application {
  id: number;
  job_id: number;
  candidate_id: number;
  match_percentage: number;
  status: ApplicationStatus;
  cover_note: string | null;
  created_at: Date;
  updated_at: Date;
}
