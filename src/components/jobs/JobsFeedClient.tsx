"use client";

import { useState, useMemo } from "react";
import { JobCard } from "@/components/jobs/JobCard";
import { JobWithMatch } from "@/types";
import { Search, SlidersHorizontal, Sparkles, Briefcase } from "lucide-react";

interface JobsFeedClientProps {
  initialJobs: JobWithMatch[];
  isCandidate: boolean;
}

export function JobsFeedClient({ initialJobs, isCandidate }: JobsFeedClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [matchFilter, setMatchFilter] = useState<"all" | "high" | "medium">("all");
  const [selectedJobType, setSelectedJobType] = useState<string>("all");

  const filteredJobs = useMemo(() => {
    return initialJobs.filter((job) => {
      // Search text match
      const query = searchTerm.toLowerCase().trim();
      const matchesSearch =
        query === "" ||
        job.title.toLowerCase().includes(query) ||
        job.company_name.toLowerCase().includes(query) ||
        job.location.toLowerCase().includes(query) ||
        job.skills.some((s) => s.name.toLowerCase().includes(query));

      // Match filter
      let matchesScore = true;
      if (isCandidate) {
        if (matchFilter === "high") {
          matchesScore = job.match_percentage >= 75;
        } else if (matchFilter === "medium") {
          matchesScore = job.match_percentage >= 40;
        }
      }

      // Job type filter
      const matchesType =
        selectedJobType === "all" ||
        job.job_type.toLowerCase() === selectedJobType.toLowerCase();

      return matchesSearch && matchesScore && matchesType;
    });
  }, [initialJobs, searchTerm, matchFilter, selectedJobType, isCandidate]);

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Keyword Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by job title, company, tech stack, or location..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent placeholder:text-slate-400"
            />
          </div>

          {/* Job Type Dropdown */}
          <select
            value={selectedJobType}
            onChange={(e) => setSelectedJobType(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="all">All Job Types</option>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="remote">Remote</option>
            <option value="contract">Contract</option>
          </select>
        </div>

        {/* Candidate Match Filters Pills */}
        {isCandidate && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 mr-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Filter by Match:
            </span>
            <button
              onClick={() => setMatchFilter("all")}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                matchFilter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Matches
            </button>
            <button
              onClick={() => setMatchFilter("high")}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                matchFilter === "high"
                  ? "bg-emerald-600 text-white"
                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
              }`}
            >
              High Match (75%+)
            </button>
            <button
              onClick={() => setMatchFilter("medium")}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                matchFilter === "medium"
                  ? "bg-amber-600 text-white"
                  : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
              }`}
            >
              Medium+ (40%+)
            </button>
          </div>
        )}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong>{filteredJobs.length}</strong> of {initialJobs.length} jobs
        </span>
        {isCandidate && (
          <span className="text-emerald-700 font-medium">
            Sorted by highest skill match percentage
          </span>
        )}
      </div>

      {/* Jobs Grid */}
      {filteredJobs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No jobs found</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search keywords or match filter settings to see more open roles.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              matchPercentage={isCandidate ? job.match_percentage : undefined}
              matchedSkills={job.matched_skills}
              missingSkills={job.missing_skills}
              hasApplied={job.has_applied}
            />
          ))}
        </div>
      )}
    </div>
  );
}
