import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getJobById } from "@/lib/db/queries/jobs";
import { getCandidateProfileWithSkills } from "@/lib/db/queries/candidates";
import { hasCandidateApplied, getCandidateApplications } from "@/lib/db/queries/applications";
import { calculateSkillMatch } from "@/lib/utils/matching";
import { SkillMatchBadge } from "@/components/jobs/SkillMatchBadge";
import { ApplyForm } from "@/components/forms/ApplyForm";
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Building2,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

interface JobDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function JobDetailsPage({ params }: JobDetailsPageProps) {
  const { id } = await params;
  const jobId = parseInt(id, 10);
  if (isNaN(jobId)) notFound();

  const job = await getJobById(jobId);
  if (!job) notFound();

  const user = await getCurrentUser();
  const isCandidate = user?.role === "candidate";

  let matchResult = {
    matchPercentage: 0,
    matchedSkills: [] as import("@/types").Skill[],
    missingSkills: job.skills,
  };
  let alreadyApplied = false;
  let applicationStatus: string | null = null;

  if (isCandidate && user) {
    const profile = await getCandidateProfileWithSkills(user.id);
    if (profile) {
      matchResult = calculateSkillMatch(job.skills, profile.skills);
      alreadyApplied = await hasCandidateApplied(job.id, profile.id);
      if (alreadyApplied) {
        const apps = await getCandidateApplications(profile.id);
        const thisApp = apps.find((a) => a.job_id === job.id);
        applicationStatus = thisApp?.status || "applied";
      }
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back Button */}
      <Link
        href="/jobs"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to all jobs
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Job Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {job.job_type}
                </span>
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                    job.status === "open"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {job.status === "open" ? "Active" : "Closed"}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {job.title}
              </h1>
              <p className="text-base font-semibold text-slate-700 mt-1 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-slate-400" />
                {job.company_name}
              </p>
            </div>

            {/* Meta Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl text-xs text-slate-600">
              <div>
                <span className="text-slate-400 block mb-0.5">Location</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {job.location}
                </span>
              </div>
              {job.salary_range && (
                <div>
                  <span className="text-slate-400 block mb-0.5">Compensation</span>
                  <span className="font-semibold text-emerald-700 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5" />
                    {job.salary_range}
                  </span>
                </div>
              )}
              <div>
                <span className="text-slate-400 block mb-0.5">Posted</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  {new Date(job.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-3">About the Role</h3>
              <div className="prose prose-sm text-slate-600 whitespace-pre-line leading-relaxed">
                {job.description}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Skill Match & Apply Box */}
        <div className="lg:col-span-1 space-y-6">
          {/* Skill Match Breakdown Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                Skill Compatibility
              </h3>
              {isCandidate && (
                <SkillMatchBadge percentage={matchResult.matchPercentage} size="sm" />
              )}
            </div>

            {isCandidate ? (
              <div className="space-y-4">
                {/* Matched Skills */}
                <div>
                  <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1 mb-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    Matched Skills ({matchResult.matchedSkills.length})
                  </span>
                  {matchResult.matchedSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {matchResult.matchedSkills.map((s) => (
                        <span
                          key={s.id}
                          className="text-xs px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium"
                        >
                          {s.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No skills matched yet</p>
                  )}
                </div>

                {/* Missing Skills */}
                <div>
                  <span className="text-xs font-semibold text-slate-600 flex items-center gap-1 mb-2">
                    <XCircle className="w-3.5 h-3.5 text-slate-400" />
                    Missing Skills ({matchResult.missingSkills.length})
                  </span>
                  {matchResult.missingSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {matchResult.missingSkills.map((s) => (
                        <span
                          key={s.id}
                          className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 font-medium"
                        >
                          {s.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-emerald-600 font-medium">
                      You possess 100% of the required skills!
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <p className="text-xs text-slate-500 mb-3">
                  This role requires the following core competencies:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {job.skills.map((s) => (
                    <span
                      key={s.id}
                      className="text-xs px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-medium border border-blue-100"
                    >
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Apply Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Application</h3>

            {alreadyApplied ? (
              <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 space-y-2">
                <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                  <CheckCircle className="w-4 h-4 text-indigo-600" />
                  Application Submitted
                </div>
                <p className="text-xs text-indigo-700">
                  Current Status:{" "}
                  <strong className="capitalize uppercase">{applicationStatus}</strong>
                </p>
                <Link
                  href="/dashboard"
                  className="block text-xs font-bold text-blue-600 hover:underline pt-1"
                >
                  View in My Applications →
                </Link>
              </div>
            ) : isCandidate ? (
              job.status === "open" ? (
                <ApplyForm
                  jobId={job.id}
                  matchPercentage={matchResult.matchPercentage}
                />
              ) : (
                <p className="text-xs text-slate-500">
                  This position is currently closed to new applicants.
                </p>
              )
            ) : !user ? (
              <div className="space-y-3 text-center">
                <p className="text-xs text-slate-500">
                  Sign in or create a candidate account to check your skill match and apply.
                </p>
                <Link
                  href="/login"
                  className="block w-full py-2.5 px-4 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Sign In to Apply
                </Link>
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                You are currently signed in as a recruiter. To apply for jobs, please sign
                in with a candidate account.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
