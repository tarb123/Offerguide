"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import type { ChartData, ChartOptions } from "chart.js";
import {
  Users,
  UserCheck,
  UserCog,
  GraduationCap,
  Activity,
  Percent,
  ListChecks,
  Trophy,
  CalendarDays,
  RefreshCw,
} from "lucide-react";
import type { Program } from "./pgpProgram";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

type Candidate = { applicationStatus?: string; status?: string };
type Mentor = { status?: string };

const PROGRESS = {
  "Not Started": "#94a3b8",
  "In Progress": "#0ea5e9",
  Completed: "#10b981",
  Deferred: "#f59e0b",
};

function normalizeStatus(status?: string): keyof typeof PROGRESS {
  const value = (status || "").trim();
  if (!value) return "Not Started";
  if (value === "Delayed") return "Deferred";
  if (value in PROGRESS) return value as keyof typeof PROGRESS;
  return "Not Started";
}

function count<T extends { status?: string }>(items: T[], status: string) {
  return items.filter((i) => normalizeStatus(i.status) === status).length;
}

export default function DashboardOverview() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [cRes, mRes, pRes] = await Promise.all([
        fetch("/api/pgp-management/candidates-pgp"),
        fetch("/api/pgp-management/mentors-pgp"),
        fetch("/api/pgp-management/programs-pgp"),
      ]);
      const [c, m, p] = await Promise.all([cRes.json(), mRes.json(), pRes.json()]);
      setCandidates(c.candidates || []);
      setMentors(m.mentors || []);
      setPrograms(p.programs || []);
    } catch (error) {
      console.error("Dashboard overview load error:", error);
    }
  }, []);

  useEffect(() => {
    void load().finally(() => setLoading(false));
  }, [load]);

  async function refresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  const stats = useMemo(() => {
    const submitted = candidates.filter((c) => c.applicationStatus === "Submitted").length;
    const pending = candidates.length - submitted;
    const activeMentors = mentors.filter((m) => m.status === "Active").length;
    const pendingMentors = mentors.filter((m) => m.status === "Pending").length;
    const activePrograms = programs.filter((p) => p.status === "Active").length;

    let totalItems = 0;
    let completedItems = 0;

    for (const p of programs) {
      totalItems +=
        (p.weeklySchedule?.length || 0) +
        (p.portfolioChecklist?.length || 0) +
        (p.capstoneTimeline?.length || 0);
      completedItems +=
        count(p.weeklySchedule || [], "Completed") +
        count(p.portfolioChecklist || [], "Completed") +
        count(p.capstoneTimeline || [], "Completed");
    }

    const avgCompletion = totalItems
      ? Math.round((completedItems / totalItems) * 100)
      : 0;

    const programStatus = {
      Draft: programs.filter((p) => p.status === "Draft").length,
      Active: activePrograms,
      Completed: programs.filter((p) => p.status === "Completed").length,
      Paused: programs.filter((p) => p.status === "Paused").length,
    };

    return {
      submitted,
      pending,
      activeMentors,
      pendingMentors,
      activePrograms,
      avgCompletion,
      programStatus,
    };
  }, [candidates, mentors, programs]);

  if (loading) {
    return (
      <div className="rounded-xl bg-white dark:bg-white/5 p-6 text-sm text-slate-500 shadow-sm">
        Loading dashboard…
      </div>
    );
  }

  const barOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx) => ` ${ctx.parsed.y}` } },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#64748b", font: { size: 11, weight: "bold" } },
      },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(148,163,184,0.15)" },
        ticks: { color: "#64748b", precision: 0, stepSize: 1, font: { size: 11 } },
      },
    },
  };

  const programStatusData: ChartData<"bar"> = {
    labels: ["Draft", "Active", "Completed", "Paused"],
    datasets: [
      {
        label: "Programs",
        data: [
          stats.programStatus.Draft,
          stats.programStatus.Active,
          stats.programStatus.Completed,
          stats.programStatus.Paused,
        ],
        backgroundColor: ["#94a3b8", "#10b981", "#3b82f6", "#f59e0b"],
        borderRadius: 6,
        maxBarThickness: 54,
      },
    ],
  };

  const mentorData: ChartData<"bar"> = {
    labels: ["Active", "Pending", "Other"],
    datasets: [
      {
        label: "Mentors",
        data: [stats.activeMentors, stats.pendingMentors, mentors.length - stats.activeMentors - stats.pendingMentors],
        backgroundColor: ["#8b5cf6", "#f59e0b", "#cbd5e1"],
        borderRadius: 6,
        maxBarThickness: 54,
      },
    ],
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2 dark:border-white/10">
        <span className="flex items-center gap-1.5 text-lg font-black text-slate-900 dark:text-white">
          <Activity size={18} className="text-blue-900" />
          Dashboard
        </span>
        <button
          type="button"
          onClick={refresh}
          disabled={refreshing || loading}
          title="Refresh"
          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 disabled:opacity-60 dark:hover:bg-white/10"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>

      {/* KPI tiles — one compact card, four small stats inside */}
      <div className="w-full max-w-xs rounded-xl border border-slate-200 bg-white p-2 shadow-sm dark:border-white/10 dark:bg-white/5">
        <div className="grid grid-cols-2 gap-1.5">
          <Kpi icon={<Users size={15} />} label="Candidates" value={candidates.length} from="from-blue-500" to="to-blue-700" />
          <Kpi icon={<UserCog size={15} />} label="Mentors" value={mentors.length} sub={stats.pendingMentors > 0 ? `${stats.activeMentors} active · ${stats.pendingMentors} awaiting approval` : `${stats.activeMentors} active`} from="from-violet-500" to="to-violet-700" />
          <Kpi icon={<GraduationCap size={15} />} label="Programs" value={programs.length} from="from-amber-500" to="to-amber-600" />
          <Kpi icon={<Activity size={15} />} label="Active" value={stats.activePrograms} from="from-cyan-500" to="to-cyan-700" />
        </div>
      </div>

      {/* Doughnut charts */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3  ">
        
        <ChartCard title="Program Status" icon={<GraduationCap size={14} />}>
          <div className="h-[190px]">
            <Bar data={programStatusData} options={barOptions} />
          </div>
        </ChartCard>
        <ChartCard title="Mentors" icon={<UserCog size={14} />}>
          <div className="h-[190px]">
            <Bar data={mentorData} options={barOptions} />
          </div>
        </ChartCard>

        <ChartCard title="Programs" icon={<ListChecks size={14} />}>
          <ProgramsList programs={programs} />
        </ChartCard>

      </div>
    </div>
  );
}

function Kpi({
  icon,
  label,
  value,
  sub,
  from,
  to,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  sub?: string;
  from: string;
  to: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-lg bg-gradient-to-br ${from} ${to} p-1.5 text-white shadow-sm`}
    >
      <div className="absolute -right-2 -top-2 h-8 w-8 rounded-full bg-white/10" />
      <div className="relative">
        <div className="text-white/80">{icon}</div>
        <p className="mt-0.5 text-base font-black leading-none">{value}</p>
        <p className="mt-0.5 text-[8px] font-bold uppercase leading-tight tracking-wide text-white/80">
          {label}
        </p>
        {sub && <p className="text-[8px] font-semibold text-white/75">{sub}</p>}
      </div>
    </div>
  );
}

function ChartCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-3 shadow-sm">
      <div className="mb-2 flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-[#0b2f5b] dark:text-sky-300">
        <span className="text-blue-900 dark:text-sky-300">{icon}</span>
        {title}
      </div>
      {children}
    </div>
  );
}

const PROGRAM_PILL: Record<string, string> = {
  Active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Completed: "bg-blue-50 text-blue-700 ring-blue-200",
  Draft: "bg-slate-100 text-slate-600 ring-slate-200",
  Paused: "bg-amber-50 text-amber-700 ring-amber-200",
};

function ProgramsList({ programs }: { programs: Program[] }) {
  if (!programs.length) {
    return <p className="py-6 text-center text-xs text-slate-400">No programs yet.</p>;
  }

  return (
    <div className="h-[190px] space-y-2 overflow-y-auto pr-1">
      {programs.map((p) => {
        const total =
          (p.weeklySchedule?.length || 0) +
          (p.portfolioChecklist?.length || 0) +
          (p.capstoneTimeline?.length || 0);
        const done =
          count(p.weeklySchedule || [], "Completed") +
          count(p.portfolioChecklist || [], "Completed") +
          count(p.capstoneTimeline || [], "Completed");
        const pct = total ? Math.round((done / total) * 100) : 0;
        const pill =
          PROGRAM_PILL[p.status] || "bg-slate-100 text-slate-600 ring-slate-200";

        return (
          <div
            key={p.programId}
            className="rounded-lg border border-slate-100 dark:border-white/10 p-2"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-[11px] font-bold text-slate-900 dark:text-white">
                {p.programName || "Untitled"}
              </span>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ring-1 ring-inset ${pill}`}
              >
                {p.status}
              </span>
            </div>

            <div className="mt-1.5 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-900 to-cyan-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="shrink-0 text-[10px] font-black text-slate-500">
                {pct}%
              </span>
            </div>

            <div className="mt-1.5 flex flex-wrap gap-x-3 text-[9px] font-semibold text-slate-400">
              <span className="inline-flex items-center gap-0.5">
                <CalendarDays size={10} />
                {p.weeklySchedule?.length || 0}w
              </span>
              <span className="inline-flex items-center gap-0.5">
                <ListChecks size={10} />
                {p.portfolioChecklist?.length || 0}
              </span>
              <span className="inline-flex items-center gap-0.5">
                <Trophy size={10} />
                {p.capstoneTimeline?.length || 0}
              </span>
              <span className="inline-flex items-center gap-0.5">
                <UserCog size={10} />
                {p.assignedMentorName || "Unassigned"}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
