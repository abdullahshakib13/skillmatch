import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getOrCreateCandidateProfile } from "@/lib/db/queries/candidates";
import { getCandidateApplications } from "@/lib/db/queries/applications";
import { SkillMatchBadge } from "@/components/jobs/SkillMatchBadge";
import {
  FileText,
  Building2,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Briefcase,
} from "lucide-react";

export default async function CandidateDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "candidate") {
    redirect("/recruiter/jobs");
  }

  const profile = await getOrCreateCandidateProfile(user.id);
  const applications = await getCandidateApplications(profile.id);

  const total = applications.length;
  const shortlisted = applications.filter((a) => a.status === "shortlisted").length;
  const inReview = applications.filter((a) => a.status === "applied").length;
  const rejected = applications.filter((a) => a.status === "rejected").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            My Applications
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track your job applications, recruiter review statuses, and skill match scores.
          </p>
        </div>
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-md shadow-blue-500/20 transition-all"
        >
          <Briefcase className="w-4 h-4" />
          Find More Jobs
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-500">Total Applied</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{total}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-500">Shortlisted</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{shortlisted}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-500">In Review</p>
          <p className="text-2xl font-black text-blue-600 mt-1">{inReview}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-500">Archived / Rejected</p>
          <p className="text-2xl font-black text-slate-400 mt-1">{rejected}</p>
        </div>
      </div>

      {/* Applications List */}
      {applications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">
            No applications submitted yet
          </h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Browse jobs with high skill match percentages and submit your application with a
            single click.
          </p>
          <Link
            href="/jobs"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Explore Jobs Now
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href={`/jobs/${app.job_id}`}
                    className="text-lg font-bold text-slate-900 hover:text-blue-600 transition-colors"
                  >
                    {app.job_title}
                  </Link>
                  <SkillMatchBadge percentage={app.match_percentage} size="sm" />
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span className="font-semibold text-slate-700 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    {app.company_name}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {app.location}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                    {app.job_type}
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    Applied {new Date(app.applied_at).toLocaleDateString()}
                  </span>
                </div>

                {app.cover_note && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg italic">
                    &quot;{app.cover_note}&quot;
                  </p>
                )}
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                <div>
                  {app.status === "applied" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      <Clock className="w-3.5 h-3.5 text-blue-500" />
                      In Review
                    </span>
                  )}
                  {app.status === "shortlisted" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Shortlisted by Recruiter!
                    </span>
                  )}
                  {app.status === "rejected" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                      <XCircle className="w-3.5 h-3.5 text-slate-400" />
                      Not Selected
                    </span>
                  )}
                </div>

                <Link
                  href={`/jobs/${app.job_id}`}
                  className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                  title="View Job"
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
