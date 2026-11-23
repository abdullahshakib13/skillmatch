import { Sparkles, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";

interface SkillMatchBadgeProps {
  percentage: number;
  size?: "sm" | "md" | "lg";
}

export function SkillMatchBadge({
  percentage,
  size = "md",
}: SkillMatchBadgeProps) {
  let colorStyles = "bg-emerald-50 text-emerald-700 border-emerald-200";
  let Icon = CheckCircle2;
  let label = "High Match";

  if (percentage >= 75) {
    colorStyles = "bg-emerald-500/10 text-emerald-700 border-emerald-300";
    Icon = Sparkles;
    label = "High Match";
  } else if (percentage >= 40) {
    colorStyles = "bg-amber-500/10 text-amber-700 border-amber-300";
    Icon = AlertTriangle;
    label = "Medium Match";
  } else {
    colorStyles = "bg-slate-100 text-slate-600 border-slate-300";
    Icon = AlertCircle;
    label = "Low Match";
  }

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-2.5 py-1 text-xs sm:text-sm gap-1.5 font-semibold",
    lg: "px-3.5 py-1.5 text-base gap-2 font-bold",
  }[size];

  return (
    <div
      className={`inline-flex items-center rounded-xl border shadow-xs ${colorStyles} ${sizeStyles}`}
      title={`${percentage}% of required skills matched (${label})`}
    >
      <Icon className={size === "sm" ? "w-3 h-3" : size === "md" ? "w-4 h-4" : "w-5 h-5"} />
      <span>{percentage}% Match</span>
    </div>
  );
}
