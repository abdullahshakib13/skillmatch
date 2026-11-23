import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getAllSkills } from "@/lib/db/queries/skills";
import { JobForm } from "@/components/forms/JobForm";
import { PlusCircle } from "lucide-react";

export default async function CreateJobPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "recruiter") {
    redirect("/jobs");
  }

  const allSkills = await getAllSkills();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-blue-600 mb-1">
          <PlusCircle className="w-5 h-5" />
          <span className="text-sm font-semibold tracking-wide uppercase">
            Recruiter Portal
          </span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Post a New Position
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Specify role details and tag required skills. SkillMatch matches and ranks
          candidates transparently based on these criteria.
        </p>
      </div>

      <JobForm availableSkills={allSkills} />
    </div>
  );
}
