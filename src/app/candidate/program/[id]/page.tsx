"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Gauge,
  GraduationCap,
  Info,
  ListChecks,
  Loader2,
  Target,
  Trophy,
  UserCog,
  Workflow,
} from "lucide-react";
import { type ViewTab } from "@/app/pgp-admin/component/ProgramView";
import CandidateProgramView from "@/app/candidate/component/CandidateProgramView";
import type { Program } from "@/app/pgp-admin/component/pgpProgram";

const TABS: { key: ViewTab; label: string; icon: React.ReactNode }[] = [
  { key: "dashboard", label: "Summary", icon: <Gauge size={16} /> },
  { key: "overview", label: "Overview", icon: <Info size={16} /> },
  { key: "schedule", label: "Schedule", icon: <CalendarDays size={16} /> },
  { key: "flow", label: "Flow", icon: <Workflow size={16} /> },
  { key: "capstone", label: "Capstone", icon: <Trophy size={16} /> },
  { key: "portfolio", label: "Portfolio", icon: <ListChecks size={16} /> },
  { key: "evaluation", label: "Evaluation", icon: <Target size={16} /> },
];

export default function CandidateProgramPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id || "");

  const [program, setProgram] = useState<Program | null>(null);
  const [tab, setTab] = useState<ViewTab>("dashboard");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/pgp-candidate/program/${id}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.message || "Failed to load program.");
          return;
        }
        setProgram(data.program);
      } catch {
        setError("Failed to load program.");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [id]);

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-darkBlue">
      <div className="mx-auto max-w-6xl p-3 sm:p-5">
        <button
          type="button"
          onClick={() => router.push("/candidate/dashboard")}
          title="Back to dashboard"
          className="mb-3 grid h-9 w-9 place-items-center rounded-xl bg-white text-slate-500 shadow-sm transition hover:text-blue-900 dark:bg-white/10 dark:text-slate-300 dark:hover:text-white"
        >
          <ArrowLeft size={16} />
        </button>

        {loading ? (
          <div className="grid place-items-center rounded-2xl bg-white p-12 text-slate-400 shadow-sm dark:bg-white/5">
            <Loader2 size={22} className="animate-spin" />
          </div>
        ) : error || !program ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm font-semibold text-rose-700">
            {error || "Program not found."}
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-slate-200 dark:bg-white/5 dark:ring-white/10">
            {/* Header */}
            <div className="flex items-center gap-4 bg-gradient-to-r from-[#0b2f5b] to-[#1746b5] px-5 py-5 text-white">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/15 shadow-inner">
                <GraduationCap size={26} />
              </span>
              <div className="min-w-0">
                <h1 className="truncate text-lg font-black">
                  {program.programName || "Untitled program"}
                </h1>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold text-blue-100">
                  <span
                    title={`Status: ${program.status || "Draft"}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2 py-0.5"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                    {program.status || "Draft"}
                  </span>
                  {program.assignedMentorName && (
                    <span
                      title={`Mentor: ${program.assignedMentorName}`}
                      className="inline-flex items-center gap-1"
                    >
                      <UserCog size={12} className="text-cyan-200" />
                      {program.assignedMentorName}
                    </span>
                  )}
                  {(program.startDate || program.endDate) && (
                    <span
                      title="Programme dates"
                      className="inline-flex items-center gap-1"
                    >
                      <CalendarDays size={12} className="text-cyan-200" />
                      {[program.startDate, program.endDate]
                        .filter(Boolean)
                        .join("  →  ")}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Icon tab bar */}
            <div className="flex flex-wrap gap-1 border-b border-slate-200 bg-slate-50/60 px-2 py-2 dark:border-white/10 dark:bg-white/5">
              {TABS.map((t) => {
                const on = tab === t.key;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTab(t.key)}
                    title={t.label}
                    aria-label={t.label}
                    aria-pressed={on}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-[11px] font-black transition ${
                      on
                        ? "bg-gradient-to-r from-[#0b2f5b] to-[#1746b5] text-white shadow-md"
                        : "text-slate-400 hover:bg-white hover:text-blue-900 dark:hover:bg-white/10 dark:hover:text-white"
                    }`}
                  >
                    {t.icon}
                    <span className="hidden lg:inline">{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <CandidateProgramView program={program} tab={tab} />
          </div>
        )}
      </div>
    </main>
  );
}
