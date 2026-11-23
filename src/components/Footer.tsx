import Link from "next/link";
import { Sparkles, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-base font-bold text-slate-800">SkillMatch</span>
            <span className="text-xs text-slate-500 ml-2">
              © {new Date().getFullYear()} SkillMatch Inc. All rights reserved.
            </span>
          </div>

          <div className="flex items-center gap-6 text-sm text-slate-600">
            <Link href="/jobs" className="hover:text-blue-600 transition-colors">
              Browse Jobs
            </Link>
            <Link href="/login" className="hover:text-blue-600 transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="hover:text-blue-600 transition-colors">
              Join as Candidate or Recruiter
            </Link>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-1">
            Built with Next.js, Neon PostgreSQL & Better Auth
          </div>
        </div>
      </div>
    </footer>
  );
}
