-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================================
-- 1. BETTER AUTH CORE TABLES
-- ========================================================
CREATE TABLE IF NOT EXISTS "user" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL UNIQUE,
    "emailVerified" BOOLEAN NOT NULL DEFAULT FALSE,
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'candidate', -- 'candidate' or 'recruiter'
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "session" (
    "id" TEXT PRIMARY KEY,
    "expiresAt" TIMESTAMP NOT NULL,
    "token" TEXT NOT NULL UNIQUE,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "account" (
    "id" TEXT PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP,
    "refreshTokenExpiresAt" TIMESTAMP,
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "verification" (
    "id" TEXT PRIMARY KEY,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- ========================================================
-- 2. SKILLMATCH DOMAIN TABLES
-- ========================================================

-- Master list of skills
CREATE TABLE IF NOT EXISTS skills (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    category VARCHAR(50) DEFAULT 'General',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Candidate profiles
CREATE TABLE IF NOT EXISTS candidate_profiles (
    id SERIAL PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    headline VARCHAR(150),
    bio TEXT,
    experience_years INT DEFAULT 0,
    resume_link TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Candidate <-> Skills (Many-to-Many)
CREATE TABLE IF NOT EXISTS candidate_skills (
    candidate_id INT NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    skill_id INT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    proficiency VARCHAR(20) DEFAULT 'intermediate', -- 'beginner', 'intermediate', 'expert'
    PRIMARY KEY (candidate_id, skill_id)
);

-- Recruiter Job Postings
CREATE TABLE IF NOT EXISTS jobs (
    id SERIAL PRIMARY KEY,
    recruiter_id TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    company_name VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    job_type VARCHAR(30) DEFAULT 'Full-time', -- 'Full-time', 'Part-time', 'Contract', 'Remote'
    salary_range VARCHAR(50),
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'open', -- 'open', 'closed'
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Job <-> Required Skills (Many-to-Many)
CREATE TABLE IF NOT EXISTS job_skills (
    job_id INT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    skill_id INT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    PRIMARY KEY (job_id, skill_id)
);

-- Job Applications
CREATE TABLE IF NOT EXISTS applications (
    id SERIAL PRIMARY KEY,
    job_id INT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    candidate_id INT NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    match_percentage INT NOT NULL DEFAULT 0,
    status VARCHAR(20) DEFAULT 'applied', -- 'applied', 'shortlisted', 'rejected'
    cover_note TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unique_job_candidate UNIQUE (job_id, candidate_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_jobs_recruiter ON jobs(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_applications_job ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_candidate ON applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_skills_cand ON candidate_skills(candidate_id);
CREATE INDEX IF NOT EXISTS idx_job_skills_job ON job_skills(job_id);

-- Seed initial standardized skills
INSERT INTO skills (name, category) VALUES
('JavaScript', 'Frontend'),
('TypeScript', 'Frontend'),
('React', 'Frontend'),
('Next.js', 'Frontend'),
('Vue.js', 'Frontend'),
('Angular', 'Frontend'),
('HTML/CSS', 'Frontend'),
('Tailwind CSS', 'Frontend'),
('Node.js', 'Backend'),
('Express.js', 'Backend'),
('NestJS', 'Backend'),
('Python', 'Backend'),
('Django', 'Backend'),
('FastAPI', 'Backend'),
('Java', 'Backend'),
('Spring Boot', 'Backend'),
('Go', 'Backend'),
('PostgreSQL', 'Database'),
('MySQL', 'Database'),
('MongoDB', 'Database'),
('Redis', 'Database'),
('Docker', 'DevOps'),
('Kubernetes', 'DevOps'),
('AWS', 'Cloud'),
('GraphQL', 'API'),
('REST API', 'API'),
('Git', 'Tools')
ON CONFLICT (name) DO NOTHING;
