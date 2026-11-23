import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getAllOpenJobs } from "@/lib/db/queries/jobs";
import { getCandidateProfileWithSkills } from "@/lib/db/queries/candidates";
import { getCandidateApplications } from "@/lib/db/queries/applications";
import { calculateSkillMatch } from "@/lib/utils/matching";
import { JobsFeedClient } from "@/components/jobs/JobsFeedClient";
import { JobWithMatch } from "@/types";
import { Sparkles, ArrowRight } from "lucide-react";

export default async function JobsPage() {
  const user = await getCurrentUser();
  const openJobs = await getAllOpenJobs();

  let isCandidate = false;
  let candidateSkills: import("@/types").Skill[] = [];
  const appliedJobIds = new Set<number>();

  if (user && user.role === "candidate") {
    isCandidate = true;
    const profile = await getCandidateProfileWithSkills(user.id);
    if (profile) {
      candidateSkills = profile.skills;
      const apps = await getCandidateApplications(profile.id);
      apps.forEach((a) => appliedJobIds.add(a.job_id));
    }
  }

  // Calculate match percentage for each job
  const jobsWithMatch: JobWithMatch[] = openJobs.map((job) => {
    const { matchPercentage, matchedSkills, missingSkills } = calculateSkillMatch(
      job.skills,
      candidateSkills
    );

    return {
      ...job,
      match_percentage: isCandidate ? matchPercentage : 0,
      matched_skills: isCandidate ? matchedSkills : [],
      missing_skills: isCandidate ? missingSkills : job.skills,
      has_applied: appliedJobIds.has(job.id),
    };
  });

  // Sort by match percentage DESC if candidate, otherwise by created_at
  if (isCandidate) {
    jobsWithMatch.sort((a, b) => b.match_percentage - a.match_percentage);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Banner if not signed in as candidate */}
      {!isCandidate && (
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-300" />
              See Your Live Skill Match Percentage
            </h2>
            <p className="text-xs text-blue-100 max-w-xl">
              Sign in as a candidate to automatically see how your technical skills score
              against every job post below in real time.
            </p>
          </div>
          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-blue-600 font-bold text-xs hover:bg-blue-50 transition-colors shadow-sm"
          >
            Create Candidate Profile
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Main Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Explore Open Roles
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Discover opportunities scored against your tech stack and experience.
        </p>
      </div>

      <JobsFeedClient initialJobs={jobsWithMatch} isCandidate={isCandidate} />
    </div>
  );
}
