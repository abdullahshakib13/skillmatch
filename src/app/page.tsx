import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Briefcase,
  Users,
  Target,
  Zap,
  BarChart3,
  ShieldCheck,
} from "lucide-react";

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/60 via-indigo-50/30 to-white py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/70 text-blue-700 text-xs font-semibold shadow-xs">
                <Sparkles className="w-4 h-4 text-blue-600" />
                The Skill-First Hiring Platform
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Hire & get hired by{" "}
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  pure skill compatibility
                </span>
                .
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                SkillMatch bridges job seekers and recruiters using transparent skill scoring.
                Know your exact match percentage before applying, and hire applicants pre-ranked
                by real competency.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                {user ? (
                  <Link
                    href={user.role === "candidate" ? "/jobs" : "/recruiter/jobs"}
                    className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
                  >
                    Go to Your Portal ({user.role})
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/register"
                      className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
                    >
                      Get Started Free
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      href="/jobs"
                      className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-sm transition-colors text-center"
                    >
                      Browse Open Jobs
                    </Link>
                  </>
                )}
              </div>

              {/* Trust Signals */}
              <div className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  No ORM Overhead
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Deterministic % Scoring
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Role-Based Security
                </span>
              </div>
            </div>

            {/* Right Live Matching Interactive Card */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl shadow-indigo-500/10 border border-slate-200 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                      SM
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        Senior Full-Stack Engineer
                      </h4>
                      <p className="text-xs text-slate-400">Vercel / Remote</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700">
                    Full-time
                  </span>
                </div>

                {/* Match Score Display */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-teal-500/10 border border-emerald-300/60 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                      Match Compatibility
                    </span>
                    <p className="text-2xl font-black text-emerald-700">75% Strong Match</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-emerald-600/20">
                    3/4
                  </div>
                </div>

                {/* Skills comparison */}
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="font-semibold text-slate-700 block mb-1.5">
                      Matched Skills (In Candidate Profile):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                        ✓ Next.js
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                        ✓ TypeScript
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                        ✓ PostgreSQL
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="font-semibold text-slate-400 block mb-1.5">
                      Missing Skill (To Learn):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500 font-medium">
                        + Docker
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold text-center shadow-sm">
                    1-Click Apply Enabled
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
              Why SkillMatch
            </h2>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Designed for modern technical hiring
            </p>
            <p className="text-sm text-slate-500 mt-2">
              Say goodbye to resume keyword stuffing and unread applications.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-blue-200 transition-colors space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Skill-First Matching</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Candidates select verified competencies. Open roles define requirements. Our
                deterministic engine calculates exact match percentages instantaneously.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-indigo-200 transition-colors space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Ranked Recruiter Pipelines</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Recruiters see applicants pre-ranked by match percentage. Shortlist or reject
                with one click and never lose top talent in an unorganized inbox.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-emerald-200 transition-colors space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Transparent Feedback</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Candidates never wonder why they did or didn&apos;t match. See matched vs missing
                skills side-by-side to target career development.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to find your next opportunity or hire top talent?
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Join SkillMatch today and experience precision matching powered by Next.js, Neon
            PostgreSQL, and Better Auth.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/register"
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-lg shadow-blue-500/20"
            >
              Create Free Account
            </Link>
            <Link
              href="/jobs"
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold transition-colors border border-slate-700"
            >
              Browse Jobs
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
