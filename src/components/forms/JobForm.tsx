"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { SkillSelector } from "@/components/forms/SkillSelector";
import { createJobAction } from "@/actions/jobs";
import { Skill } from "@/types";
import { Briefcase, Building2, MapPin, DollarSign, AlertCircle, ArrowRight } from "lucide-react";

const jobSchema = z.object({
  title: z.string().min(3, "Job title must be at least 3 characters"),
  company_name: z.string().min(2, "Company name is required"),
  location: z.string().min(2, "Location is required (e.g. Remote, New York, etc.)"),
  job_type: z.string().min(1, "Select a job type"),
  salary_range: z.string().optional(),
  description: z.string().min(20, "Job description must be at least 20 characters"),
});

type JobFormValues = z.infer<typeof jobSchema>;

export function JobForm({ availableSkills }: { availableSkills: Skill[] }) {
  const router = useRouter();
  const [selectedSkillIds, setSelectedSkillIds] = useState<number[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: "",
      company_name: "",
      location: "Remote",
      job_type: "Full-time",
      salary_range: "$90,000 - $120,000",
      description: "",
    },
  });

  const onSubmit = async (values: JobFormValues) => {
    if (selectedSkillIds.length === 0) {
      setServerError("Please select at least one required skill for this job post.");
      return;
    }

    try {
      setSubmitting(true);
      setServerError(null);

      const res = await createJobAction({
        title: values.title,
        company_name: values.company_name,
        location: values.location,
        job_type: values.job_type,
        salary_range: values.salary_range,
        description: values.description,
        skill_ids: selectedSkillIds,
      });

      if (!res.success) {
        setServerError(res.error || "Failed to create job posting.");
        return;
      }

      router.push("/recruiter/jobs");
      router.refresh();
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {serverError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
          1. Role & Company Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Job Title */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">
              Job Title *
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                {...register("title")}
                placeholder="e.g. Senior Frontend Engineer"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm placeholder:text-slate-400"
              />
            </div>
            {errors.title && (
              <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">
              Company Name *
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                {...register("company_name")}
                placeholder="e.g. Acme Tech Solutions"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm placeholder:text-slate-400"
              />
            </div>
            {errors.company_name && (
              <p className="mt-1 text-xs text-red-600">{errors.company_name.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">
              Location *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                {...register("location")}
                placeholder="e.g. Remote / New York, NY"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm placeholder:text-slate-400"
              />
            </div>
            {errors.location && (
              <p className="mt-1 text-xs text-red-600">{errors.location.message}</p>
            )}
          </div>

          {/* Job Type */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">
              Job Type *
            </label>
            <select
              {...register("job_type")}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-white"
            >
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Remote">Remote</option>
              <option value="Internship">Internship</option>
            </select>
          </div>

          {/* Salary Range */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">
              Salary Range (Optional)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                {...register("salary_range")}
                placeholder="e.g. $100k - $130k / yr"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-1.5">
            Role Description & Responsibilities *
          </label>
          <textarea
            rows={6}
            {...register("description")}
            placeholder="Outline the responsibilities, team dynamics, projects, and what the ideal candidate will achieve in this role..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm placeholder:text-slate-400"
          />
          {errors.description && (
            <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>
          )}
        </div>
      </div>

      {/* Required Skills Selection */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
          2. Required Skills for Matching
        </h2>
        <p className="text-xs text-slate-500">
          Select all technologies and competencies needed for this position. Candidates will be
          automatically scored and ranked based on these skills.
        </p>

        <SkillSelector
          availableSkills={availableSkills}
          selectedSkillIds={selectedSkillIds}
          onChange={setSelectedSkillIds}
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50 text-sm"
        >
          {submitting ? "Publishing Job..." : "Publish Job Posting"}
          {!submitting && <ArrowRight className="w-4 h-4" />}
        </button>
      </div>
    </form>
  );
}
