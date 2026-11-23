import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getRecruiterJobs } from "@/lib/db/queries/jobs";
import { JobStatusButton } from "@/components/jobs/JobStatusButton";
import {
  Briefcase,
  Plus,
  Users,
  MapPin,
  Clock,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

export default async function RecruiterJobsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "recruiter") {
    redirect("/jobs");
  }

  const jobs = await getRecruiterJobs(user.id);

  const totalJobs = jobs.length;
  const activeJobs = jobs.filter((j) => j.status === "open").length;
  const totalApplicants = jobs.reduce((sum, j) => sum + (j.applicant_count || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Manage Job Postings
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review and monitor candidate pipelines for your open roles.
          </p>
        </div>
        <Link
          href="/recruiter/jobs/create"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-md shadow-blue-500/20 transition-all hover:shadow"
        >
          <Plus className="w-4 h-4" />
          Post New Job
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Job Postings
            </p>
            <p className="text-2xl font-black text-slate-900 mt-1">{totalJobs}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Active Open Roles
            </p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{activeJobs}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Applicants
            </p>
            <p className="text-2xl font-black text-indigo-600 mt-1">{totalApplicants}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Job Postings List */}
      {jobs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
            <Briefcase className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No jobs posted yet</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Create your first job listing and specify the required skills to start receiving
            matched applications.
          </p>
          <Link
            href="/recruiter/jobs/create"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Job Now
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h3 className="text-lg font-bold text-slate-900">{job.title}</h3>
                  <JobStatusButton jobId={job.id} currentStatus={job.status} />
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {job.job_type}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span className="font-medium text-slate-700">{job.company_name}</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {job.location}
                  </span>
                  {job.salary_range && (
                    <span className="font-semibold text-emerald-700">
                      {job.salary_range}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Posted {new Date(job.created_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Required Skills Badges */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {job.skills.map((skill) => (
                    <span
                      key={skill.id}
                      className="text-xs px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-medium border border-blue-100"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons & Applicants */}
              <div className="flex items-center gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                <Link
                  href={`/recruiter/jobs/${job.id}/applicants`}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    (job.applicant_count || 0) > 0
                      ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-500/20"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>
                    {job.applicant_count || 0}{" "}
                    {(job.applicant_count || 0) === 1 ? "Applicant" : "Applicants"}
                  </span>
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
