import Link from "next/link";
import { SkillMatchBadge } from "@/components/jobs/SkillMatchBadge";
import { JobWithSkills, Skill } from "@/types";
import {
  MapPin,
  Clock,
  Briefcase,
  Check,
  Plus,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

interface JobCardProps {
  job: JobWithSkills;
  matchPercentage?: number;
  matchedSkills?: Skill[];
  missingSkills?: Skill[];
  hasApplied?: boolean;
}

export function JobCard({
  job,
  matchPercentage,
  matchedSkills,
  missingSkills,
  hasApplied,
}: JobCardProps) {
  const isCandidateScored = typeof matchPercentage === "number";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        {/* Top Header with Title and Match Badge */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                {job.job_type}
              </span>
              {hasApplied && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-indigo-600" />
                  Applied
                </span>
              )}
            </div>
            <Link
              href={`/jobs/${job.id}`}
              className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1"
            >
              {job.title}
            </Link>
            <p className="text-sm font-medium text-slate-600 mt-0.5">
              {job.company_name}
            </p>
          </div>

          {/* Skill Match Badge */}
          {isCandidateScored && (
            <SkillMatchBadge percentage={matchPercentage} size="md" />
          )}
        </div>

        {/* Details row: Location, Salary */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 my-3">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            {job.location}
          </span>
          {job.salary_range && (
            <span className="font-semibold text-emerald-700">
              {job.salary_range}
            </span>
          )}
          <span className="flex items-center gap-1 text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            {new Date(job.created_at).toLocaleDateString()}
          </span>
        </div>

        {/* Short description */}
        <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
          {job.description}
        </p>

        {/* Matched vs Missing Skills breakdown */}
        {isCandidateScored ? (
          <div className="space-y-2 pt-3 border-t border-slate-100">
            {matchedSkills && matchedSkills.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-semibold text-emerald-700 mr-1 flex items-center gap-0.5">
                  <Check className="w-3 h-3 text-emerald-600" /> Matched:
                </span>
                {matchedSkills.map((s) => (
                  <span
                    key={s.id}
                    className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200"
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            )}

            {missingSkills && missingSkills.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-0.5">
                  <Plus className="w-3 h-3 text-slate-400" /> Missing:
                </span>
                {missingSkills.slice(0, 4).map((s) => (
                  <span
                    key={s.id}
                    className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600"
                  >
                    {s.name}
                  </span>
                ))}
                {missingSkills.length > 4 && (
                  <span className="text-[10px] text-slate-400">
                    +{missingSkills.length - 4} more
                  </span>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-100">
            {job.skills.map((skill) => (
              <span
                key={skill.id}
                className="text-xs px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-medium border border-blue-100"
              >
                {skill.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Card Action */}
      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-400 font-medium">
          {job.skills.length} skills required
        </span>
        <Link
          href={`/jobs/${job.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 group-hover:translate-x-0.5 transition-all"
        >
          View Details & Apply
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
