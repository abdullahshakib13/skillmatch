"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { SkillSelector } from "@/components/forms/SkillSelector";
import { updateCandidateProfileAndSkillsAction } from "@/actions/profile";
import { CandidateWithSkills, Skill } from "@/types";
import { Check, Sparkles, User, AlertCircle, Briefcase, Award } from "lucide-react";

const profileSchema = z.object({
  headline: z.string().min(2, "Headline is required (e.g. Senior Full-Stack Engineer)"),
  bio: z.string().optional(),
  experience_years: z.number().min(0, "Years of experience cannot be negative"),
  resume_link: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  initialProfile: CandidateWithSkills;
  allSkills: Skill[];
}

export function ProfileForm({ initialProfile, allSkills }: ProfileFormProps) {
  const [selectedSkillIds, setSelectedSkillIds] = useState<number[]>(
    initialProfile.skills.map((s) => s.id)
  );
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      headline: initialProfile.headline || "Full-Stack Developer",
      bio: initialProfile.bio || "",
      experience_years: initialProfile.experience_years || 0,
      resume_link: initialProfile.resume_link || "",
    },
  });

  const headlineWatch = watch("headline");
  const expWatch = watch("experience_years");

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      setSubmitting(true);
      setStatusMessage(null);

      const res = await updateCandidateProfileAndSkillsAction({
        headline: values.headline,
        bio: values.bio || "",
        experience_years: values.experience_years,
        resume_link: values.resume_link || "",
        skill_ids: selectedSkillIds,
      });

      if (res.success) {
        setStatusMessage({
          type: "success",
          text: res.message || "Profile and skills saved successfully!",
        });
      } else {
        setStatusMessage({
          type: "error",
          text: res.error || "Failed to save profile.",
        });
      }
    } catch (err: unknown) {
      setStatusMessage({
        type: "error",
        text: err instanceof Error ? err.message : "An error occurred.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Form Left/Center Column */}
      <div className="lg:col-span-2">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6"
        >
          {statusMessage && (
            <div
              className={`p-4 rounded-xl flex items-center gap-3 text-sm ${
                statusMessage.type === "success"
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                  : "bg-red-50 border border-red-200 text-red-800"
              }`}
            >
              {statusMessage.type === "success" ? (
                <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Headline */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">
              Professional Headline
            </label>
            <input
              type="text"
              {...register("headline")}
              placeholder="e.g. Full-Stack Developer | React & Node.js"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
            />
            {errors.headline && (
              <p className="mt-1 text-xs text-red-600">{errors.headline.message}</p>
            )}
            <p className="mt-1 text-xs text-slate-400">
              This headline appears on your applications and recruiter searches.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Experience Years */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                Years of Experience
              </label>
              <input
                type="number"
                min="0"
                step="1"
                {...register("experience_years", { valueAsNumber: true })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
              />
              {errors.experience_years && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.experience_years.message}
                </p>
              )}
            </div>

            {/* Resume / Portfolio Link */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                Resume or Portfolio URL (Optional)
              </label>
              <input
                type="url"
                {...register("resume_link")}
                placeholder="https://linkedin.com/in/..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
              />
              {errors.resume_link && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.resume_link.message}
                </p>
              )}
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">
              Professional Summary / Bio
            </label>
            <textarea
              rows={4}
              {...register("bio")}
              placeholder="Briefly describe your experience, technical interests, and the kind of roles you are seeking..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm placeholder:text-slate-400"
            />
          </div>

          {/* Skill Selector */}
          <div className="pt-4 border-t border-slate-200">
            <div className="mb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600" />
                My Skills & Technologies
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                These skills are compared against recruiter requirements to compute your
                real-time match percentage on every job.
              </p>
            </div>

            <SkillSelector
              availableSkills={allSkills}
              selectedSkillIds={selectedSkillIds}
              onChange={setSelectedSkillIds}
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Save Profile & Skills"}
              <Check className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Profile Live Preview Card (Right Column) */}
      <div className="lg:col-span-1">
        <div className="sticky top-24 bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-6 rounded-2xl shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Recruiter Preview
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium">
              Candidate Card
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-white font-bold text-lg">
                {initialProfile.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="font-bold text-base leading-tight">
                  {initialProfile.name}
                </h4>
                <p className="text-xs text-indigo-200">
                  {headlineWatch || "Software Engineer"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-300 pt-2 border-t border-white/5">
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                {expWatch || 0} yrs experience
              </span>
              <span className="flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-indigo-400" />
                {selectedSkillIds.length} skills selected
              </span>
            </div>

            {/* Skills summary */}
            <div className="pt-2">
              <p className="text-xs text-slate-400 mb-2 font-medium">Skills:</p>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-hidden">
                {selectedSkillIds.length > 0 ? (
                  allSkills
                    .filter((s) => selectedSkillIds.includes(s.id))
                    .map((s) => (
                      <span
                        key={s.id}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-white/10 text-white font-medium border border-white/10"
                      >
                        {s.name}
                      </span>
                    ))
                ) : (
                  <span className="text-xs text-slate-400 italic">
                    No skills selected yet
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
