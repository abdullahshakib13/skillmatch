"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { applyToJobAction } from "@/actions/applications";
import { CheckCircle2, AlertCircle, Send, Sparkles } from "lucide-react";

interface ApplyFormProps {
  jobId: number;
  matchPercentage: number;
}

export function ApplyForm({ jobId, matchPercentage }: ApplyFormProps) {
  const router = useRouter();
  const [coverNote, setCoverNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setResult(null);

      const res = await applyToJobAction(jobId, coverNote);
      if (res.success) {
        setResult({
          type: "success",
          message: res.message || "Application submitted successfully!",
        });
        router.refresh();
      } else {
        setResult({
          type: "error",
          message: res.error || "Failed to submit application.",
        });
      }
    } catch (err: unknown) {
      setResult({
        type: "error",
        message: err instanceof Error ? err.message : "An error occurred.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (result?.type === "success") {
    return (
      <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
        <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
        <h4 className="font-bold text-emerald-900 text-base">Application Submitted!</h4>
        <p className="text-xs text-emerald-700">{result.message}</p>
        <p className="text-xs text-slate-500 pt-2">
          You can track the review status in your{" "}
          <a href="/dashboard" className="font-bold text-blue-600 underline">
            Applications Dashboard
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {result?.type === "error" && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span>{result.message}</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Add an optional brief note to the recruiter:
        </label>
        <textarea
          rows={3}
          value={coverNote}
          onChange={(e) => setCoverNote(e.target.value)}
          placeholder="Highlight why your skills are a great fit for this specific position..."
          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder:text-slate-400"
        />
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
        <span className="flex items-center gap-1 text-emerald-700 font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          Applying with {matchPercentage}% skill match
        </span>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5" />
          {submitting ? "Submitting..." : "Submit Application"}
        </button>
      </div>
    </form>
  );
}
