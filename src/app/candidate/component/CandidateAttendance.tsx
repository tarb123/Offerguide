"use client";

import React, { useEffect, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  MinusCircle,
  GraduationCap,
} from "lucide-react";

type WeekRow = { week: string; status: string };
type Summary = {
  present: number;
  absent: number;
  late: number;
  excused: number;
  total: number;
  percent: number;
};

const STATUS_META: Record<
  string,
  { label: string; cls: string; icon: React.ReactNode }
> = {
  Present: {
    label: "Present",
    cls: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    icon: <CheckCircle2 size={14} />,
  },
  Absent: {
    label: "Absent",
    cls: "bg-rose-50 text-rose-700 ring-rose-200",
    icon: <XCircle size={14} />,
  },
  Late: {
    label: "Late",
    cls: "bg-amber-50 text-amber-700 ring-amber-200",
    icon: <Clock size={14} />,
  },
  Excused: {
    label: "Excused",
    cls: "bg-slate-100 text-slate-600 ring-slate-200",
    icon: <MinusCircle size={14} />,
  },
};

export default function CandidateAttendance() {
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [programName, setProgramName] = useState("");
  const [weeks, setWeeks] = useState<WeekRow[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("candidateUser");
    if (!saved) {
      setLoading(false);
      return;
    }
    const user = JSON.parse(saved);

    async function load() {
      try {
        const res = await fetch(
          `/api/pgp-candidate/attendance?email=${encodeURIComponent(user.email)}`
        );
        const data = await res.json();
        setEnrolled(Boolean(data.enrolled));
        setProgramName(data.programName || "");
        setWeeks(data.weeks || []);
        setSummary(data.summary || null);
      } catch (error) {
        console.error("Candidate attendance load error:", error);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl bg-white p-6 text-sm text-slate-500 shadow-sm">
        Loading your attendance…
      </div>
    );
  }

  if (!enrolled) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center shadow-sm">
        <GraduationCap size={26} className="mx-auto text-slate-300" />
        <p className="mt-2 text-sm font-bold text-slate-500">
          Not enrolled in a program yet
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Once you are assigned to a program, your weekly attendance will show here.
        </p>
      </div>
    );
  }

  const percent = summary?.percent ?? 0;
  const ring =
    percent >= 75 ? "#10b981" : percent >= 50 ? "#f59e0b" : "#e11d48";

  return (
    <div className="space-y-4">
      {/* Header with donut + tallies */}
      <div className="rounded-xl mt-16 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap  items-center gap-5">
          <div
            className="relative grid h-24 w-24 shrink-0 place-items-center rounded-full"
            style={{
              background: `conic-gradient(${ring} ${percent * 3.6}deg, #e5e7eb 0deg)`,
            }}
          >
            <div className="grid h-[76px] w-[76px] place-items-center rounded-full bg-white">
              <span className="text-xl font-black text-slate-900">{percent}%</span>
            </div>
          </div>

          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Attendance · {programName}
            </p>
            <p className="text-lg font-black text-slate-900">My Attendance</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Tally label="Present" value={summary?.present ?? 0} cls="text-emerald-600" />
              <Tally label="Late" value={summary?.late ?? 0} cls="text-amber-600" />
              <Tally label="Absent" value={summary?.absent ?? 0} cls="text-rose-600" />
              <Tally label="Excused" value={summary?.excused ?? 0} cls="text-slate-500" />
              <Tally label="Weeks" value={summary?.total ?? 0} cls="text-slate-900" />
            </div>
          </div>
        </div>

    
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-1 mt-4">
          {weeks.map((w) => {
            const meta = STATUS_META[w.status];
            return (
              <div
                key={w.week}
                className="flex items-center justify-between gap-2  border-b border-zinc-600 px-3 py-2"
              >
                <span className="text-xs font-bold text-slate-700">{w.week}</span>
                {meta ? (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ring-1 ring-inset ${meta.cls}`}
                  >
                    {meta.icon}
                    {meta.label}
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-slate-300">
                    Not marked
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Week-by-week */}
      {/* <div className="rounded-xl bg-white p-4 shadow-sm">

      </div> */}
    </div>
  );
}

function Tally({
  label,
  value,
  cls,
}: {
  label: string;
  value: number;
  cls: string;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-lg bg-slate-50 px-2.5 py-1">
      <span className={`text-sm font-black ${cls}`}>{value}</span>
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </span>
    </span>
  );
}
