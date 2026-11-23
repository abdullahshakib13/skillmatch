"use client";

import { useState } from "react";
import { toggleJobStatusAction } from "@/actions/jobs";
import { CheckCircle2, XCircle } from "lucide-react";

export function JobStatusButton({
  jobId,
  currentStatus,
}: {
  jobId: number;
  currentStatus: "open" | "closed";
}) {
  const [status, setStatus] = useState<"open" | "closed">(currentStatus);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    const nextStatus = status === "open" ? "closed" : "open";
    try {
      setLoading(true);
      const res = await toggleJobStatusAction(jobId, nextStatus);
      if (res.success) {
        setStatus(nextStatus);
      }
    } catch (err) {
      console.error("Failed to toggle status:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
        status === "open"
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
          : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
      } disabled:opacity-50`}
      title="Click to toggle Open / Closed"
    >
      {status === "open" ? (
        <>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Active (Open)</span>
        </>
      ) : (
        <>
          <XCircle className="w-3.5 h-3.5 text-slate-400" />
          <span>Closed</span>
        </>
      )}
    </button>
  );
}
