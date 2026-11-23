import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { SignOutButton } from "@/components/common/SignOutButton";
import { Briefcase, Sparkles, User, FileText, PlusCircle, LayoutDashboard } from "lucide-react";

export default async function Navbar() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
              SkillMatch
            </span>
          </Link>

          {/* Center Navigation Links based on role */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/jobs"
              className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50/60 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Briefcase className="w-4 h-4" />
              Browse Jobs
            </Link>

            {user?.role === "candidate" && (
              <>
                <Link
                  href="/dashboard"
                  className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50/60 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <FileText className="w-4 h-4" />
                  My Applications
                </Link>
                <Link
                  href="/profile"
                  className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50/60 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <User className="w-4 h-4" />
                  My Profile & Skills
                </Link>
              </>
            )}

            {user?.role === "recruiter" && (
              <>
                <Link
                  href="/recruiter/jobs"
                  className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50/60 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Manage Jobs
                </Link>
                <Link
                  href="/recruiter/jobs/create"
                  className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50/60 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  Post Job
                </Link>
              </>
            )}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-sm font-semibold text-slate-900 leading-tight">
                    {user.name}
                  </span>
                  <span className="text-xs uppercase tracking-wider font-bold text-indigo-600">
                    {user.role}
                  </span>
                </div>
                <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm border border-indigo-200">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <SignOutButton />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-500/20 transition-all hover:shadow"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
