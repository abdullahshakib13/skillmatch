"use client";

import { useState } from "react";
import { updateApplicantStatusAction } from "@/actions/applications";
import { Check, X, Clock, Loader2 } from "lucide-react";

interface ApplicantStatusActionsProps {
  applicationId: number;
  initialStatus: "applied" | "shortlisted" | "rejected";
}

export function ApplicantStatusActions({
  applicationId,
  initialStatus,
}: ApplicantStatusActionsProps) {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (nextStatus: "shortlisted" | "rejected" | "applied") => {
    try {
      setLoading(true);
      const res = await updateApplicantStatusAction(applicationId, nextStatus);
      if (res.success) {
        setStatus(nextStatus);
      }
    } catch (err) {
      console.error("Failed to update applicant status:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      {/* Current Status Pill */}
      <div>
        {status === "applied" && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3 h-3 text-blue-500" />
            In Review
          </span>
        )}
        {status === "shortlisted" && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            Shortlisted
          </span>
        )}
        {status === "rejected" && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <X className="w-3.5 h-3.5 text-red-500" />
            Rejected
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1.5">
        {status !== "shortlisted" && (
          <button
            onClick={() => handleUpdate("shortlisted")}
            disabled={loading}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all disabled:opacity-50"
            title="Shortlist Candidate"
          >
            {loading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Check className="w-3 h-3" />
            )}
            Shortlist
          </button>
        )}

        {status !== "rejected" && (
          <button
            onClick={() => handleUpdate("rejected")}
            disabled={loading}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-all disabled:opacity-50"
            title="Reject Candidate"
          >
            {loading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <X className="w-3 h-3" />
            )}
            Reject
          </button>
        )}

        {status !== "applied" && (
          <button
            onClick={() => handleUpdate("applied")}
            disabled={loading}
            className="text-[11px] text-slate-400 hover:text-slate-600 px-2 py-1 transition-colors"
            title="Reset to In Review"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
