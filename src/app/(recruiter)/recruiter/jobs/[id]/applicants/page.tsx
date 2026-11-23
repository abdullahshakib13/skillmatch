import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getJobById } from "@/lib/db/queries/jobs";
import { getJobApplicants } from "@/lib/db/queries/applications";
import { SkillMatchBadge } from "@/components/jobs/SkillMatchBadge";
import { ApplicantStatusActions } from "@/components/applications/ApplicantStatusActions";
import {
  Users,
  Briefcase,
  MapPin,
  ArrowLeft,
  Check,
  X,
  ExternalLink,
  Award,
  Sparkles,
} from "lucide-react";

interface JobApplicantsPageProps {
  params: Promise<{ id: string }>;
}

export default async function JobApplicantsPage({ params }: JobApplicantsPageProps) {
  const { id } = await params;
  const jobId = parseInt(id, 10);
  if (isNaN(jobId)) notFound();

  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "recruiter") redirect("/jobs");

  const job = await getJobById(jobId);
  if (!job) notFound();

  // Verify job ownership
  if (job.recruiter_id !== user.id) {
    redirect("/recruiter/jobs");
  }

  const applicants = await getJobApplicants(job.id, user.id);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back Link */}
      <Link
        href="/recruiter/jobs"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to my jobs
      </Link>

      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700">
                {job.job_type}
              </span>
              <span className="text-xs font-medium text-slate-500">
                {applicants.length} {applicants.length === 1 ? "Applicant" : "Applicants"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {job.title}
            </h1>
            <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {job.location} • Posted {new Date(job.created_at).toLocaleDateString()}
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 max-w-sm">
            {job.skills.map((s) => (
              <span
                key={s.id}
                className="text-xs px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium"
              >
                {s.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Applicants List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Applicant Candidates
          </h2>
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
            Ranked by Skill Match %
          </span>
        </div>

        {applicants.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No applicants yet</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              Candidates who apply will appear here automatically sorted by their skill match
              compatibility score.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {applicants.map((applicant) => (
              <div
                key={applicant.id}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4"
              >
                {/* Candidate header info + match badge */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-extrabold flex items-center justify-center text-lg flex-shrink-0">
                      {applicant.candidate_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">
                          {applicant.candidate_name}
                        </h3>
                        {applicant.candidate_resume && (
                          <a
                            href={applicant.candidate_resume}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:underline"
                          >
                            Resume / Link
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <p className="text-xs font-medium text-slate-600 mt-0.5">
                        {applicant.candidate_headline || "Candidate"} •{" "}
                        {applicant.candidate_experience} yrs experience
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {applicant.candidate_email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <SkillMatchBadge percentage={applicant.match_percentage} size="md" />
                  </div>
                </div>

                {/* Matched vs Missing Skills */}
                <div className="pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="font-semibold text-emerald-800 flex items-center gap-1 mb-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      Matched Skills ({applicant.matched_skills.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {applicant.matched_skills.map((s) => (
                        <span
                          key={s.id}
                          className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium"
                        >
                          {s.name}
                        </span>
                      ))}
                      {applicant.matched_skills.length === 0 && (
                        <span className="text-slate-400 italic">None</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="font-semibold text-slate-500 flex items-center gap-1 mb-1.5">
                      <X className="w-3.5 h-3.5 text-slate-400" />
                      Missing Skills ({applicant.missing_skills.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {applicant.missing_skills.map((s) => (
                        <span
                          key={s.id}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium"
                        >
                          {s.name}
                        </span>
                      ))}
                      {applicant.missing_skills.length === 0 && (
                        <span className="text-emerald-700 font-medium">
                          All required skills present!
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Candidate Cover Note */}
                {applicant.cover_note && (
                  <div className="bg-slate-50 p-3 rounded-xl text-xs text-slate-600">
                    <span className="font-bold text-slate-700 block mb-1">
                      Applicant Note:
                    </span>
                    &quot;{applicant.cover_note}&quot;
                  </div>
                )}

                {/* Bottom Decision Bar */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-400">
                    Applied on {new Date(applicant.created_at).toLocaleDateString()}
                  </span>
                  <ApplicantStatusActions
                    applicationId={applicant.id}
                    initialStatus={applicant.status}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
