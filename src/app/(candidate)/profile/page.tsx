import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getCandidateProfileWithSkills } from "@/lib/db/queries/candidates";
import { getAllSkills } from "@/lib/db/queries/skills";
import { ProfileForm } from "@/components/forms/ProfileForm";
import { UserCheck } from "lucide-react";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "candidate") {
    redirect("/recruiter/jobs");
  }

  const profile = await getCandidateProfileWithSkills(user.id);
  const allSkills = await getAllSkills();

  if (!profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-slate-500">
        Profile not found.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2.5 text-blue-600 mb-1">
          <UserCheck className="w-5 h-5" />
          <span className="text-sm font-semibold tracking-wide uppercase">
            Candidate Profile
          </span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Manage Your Profile & Skills
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
          Keep your skills and experience up to date. SkillMatch automatically matches you
          against open recruiter postings in real-time.
        </p>
      </div>

      <ProfileForm initialProfile={profile} allSkills={allSkills} />
    </div>
  );
}
