"use client";

import React, { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Eye, GraduationCap, RefreshCw } from "lucide-react";

type WeekRow = { week: string; status: string };

type Summary = {
  present: number;
  absent: number;
  late: number;
  excused: number;
  total: number;
  conducted: number;
  attended: number;
  percent: number;
};

type Course = {
  programId: string;
  programName: string;
  instructorName: string;
  isActive: boolean;
  weeks: WeekRow[];
  summary: Summary;
};

type AttendanceData = {
  enrolled: boolean;
  candidateName: string;
  activeProgramId: string;
  courses: Course[];
};

// The detail table shows a simple Present / Absent column, so every recorded
// mark is folded into one of those two (Late counts as attended, Excused as
// not). Unmarked weeks show a dash.
function simpleStatus(status: string): "Present" | "Absent" | "" {
  if (status === "Present" || status === "Late") return "Present";
  if (status === "Absent" || status === "Excused") return "Absent";
  return "";
}

export default function CandidateAttendance() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<AttendanceData | null>(null);
  const [selected, setSelected] = useState<Course | null>(null);

  const load = useCallback(async () => {
    let email = "";
    try {
      email = JSON.parse(localStorage.getItem("candidateUser") || "{}").email || "";
    } catch {
      /* ignore */
    }
    if (!email) return;
    try {
      const res = await fetch(
        `/api/pgp-candidate/attendance?email=${encodeURIComponent(email)}`
      );
      const json = (await res.json()) as AttendanceData;
      setData(json);
    } catch (error) {
      console.error("Candidate attendance load error:", error);
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

  if (loading) {
    return (
      <div className="rounded-xl bg-white p-6 text-sm text-slate-500 shadow-sm dark:bg-white/5">
        Loading your attendance…
      </div>
    );
  }

  // Tolerate an unexpected / stale response shape: only ever iterate a real array.
  const courses: Course[] = Array.isArray(data?.courses) ? data.courses : [];

  if (!data || !data.enrolled || courses.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center shadow-sm dark:border-white/10 dark:bg-white/5">
        <GraduationCap size={26} className="mx-auto text-slate-300" />
        <p className="mt-2 text-sm font-bold text-slate-500">
          Not enrolled in a program yet
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Join a program from the Programs tab and your weekly attendance will
          show here.
        </p>
      </div>
    );
  }

  if (selected) {
    return (
      <AttendanceDetail
        programName={selected.programName}
        candidateName={data.candidateName}
        instructorName={selected.instructorName}
        conducted={selected.summary?.conducted ?? 0}
        attended={selected.summary?.attended ?? 0}
        weeks={selected.weeks ?? []}
        onBack={() => setSelected(null)}
      />
    );
  }

  return (
    <div className="ml-32 max-w-3xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-blue-500 dark:border-b-1 dark:bg-white/5">
      <div className="flex items-center justify-between px-3 py-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {courses.length} course{courses.length === 1 ? "" : "s"}
        </span>
        <button
          type="button"
          onClick={refresh}
          disabled={refreshing}
          title="Refresh"
          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-blue-900 disabled:opacity-60 dark:text-slate-300 dark:hover:bg-white/10"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-[#0b2f5b] text-[10px] uppercase tracking-wider text-white">
            <tr>
              <th className="px-3 py-2 font-bold">Course</th>
              <th className="px-3 py-2 font-bold">Instructor</th>
              <th className="px-3 py-2 text-center font-bold">Conducted</th>
              <th className="px-3 py-2 text-center font-bold">Attended</th>
              <th className="px-3 py-2 text-center font-bold">Percentage</th>
              <th className="px-3 py-2 text-center font-bold">View</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c) => {
              const sum = c.summary ?? {
                conducted: 0,
                attended: 0,
                percent: 0,
              };
              return (
              <tr
                key={c.programId}
                className="border-b border-slate-100 dark:border-white/5"
              >
                <td className="px-3 py-2.5 text-xs font-bold text-slate-900 dark:bg-slate-200 dark:text-slate-700">
                  {c.programName || "—"}
                  {c.isActive && (
                    <span className="ml-1.5 rounded bg-emerald-100 px-1 py-0.5 text-[8px] font-black uppercase text-emerald-700">
                      Active
                    </span>
                  )}
                </td>
                <td className="px-3 py-2.5 text-xs text-slate-900 dark:bg-slate-200 dark:text-slate-700">
                  {c.instructorName || "Not assigned"}
                </td>
                <td className="px-3 py-2.5 text-center text-xs font-bold tabular-nums text-slate-700 dark:bg-slate-200 dark:text-slate-700">
                  {sum.conducted}
                </td>
                <td className="px-3 py-2.5 text-center text-xs font-bold tabular-nums text-emerald-600 dark:bg-slate-200 dark:text-slate-700">
                  {sum.attended}
                </td>
                <td className="px-3 py-2.5 text-center text-xs dark:bg-slate-200">
                  <span
                    className={`font-black tabular-nums ${
                      sum.percent >= 75
                        ? "text-emerald-600"
                        : sum.percent >= 50
                        ? "text-amber-600"
                        : "text-rose-600"
                    }`}
                  >
                    {sum.conducted ? `${sum.percent}%` : "—"}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-center dark:bg-slate-200">
                  <button
                    type="button"
                    onClick={() => setSelected(c)}
                    title="View attendance detail"
                    aria-label="View attendance detail"
                    className="inline-grid place-items-center text-[#0b2f5b] transition hover:text-blue-950 dark:text-black dark:hover:text-sky-200"
                  >
                    <Eye size={15} />
                  </button>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AttendanceDetail({
  programName,
  candidateName,
  instructorName,
  conducted,
  attended,
  weeks,
  onBack,
}: {
  programName: string;
  candidateName: string;
  instructorName: string;
  conducted: number;
  attended: number;
  weeks: WeekRow[];
  onBack: () => void;
}) {
  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-normal text-slate-500 transition hover:text-blue-900 dark:text-slate-400 dark:hover:text-white"
      >
        <ArrowLeft size={14} />
        Back to attendance
      </button>

      <div className="flex flex-col sm:flex-row sm:items-start">
        <dl className="grid grid-cols-1 gap-y-2.5 px-10 py-8 sm:max-w-md">
          <Info label="Course" value={programName || "—"} />
          <Info label="Candidate" value={candidateName || "—"} />
          <Info label="Instructor Name" value={instructorName || "Not assigned"} />
          <Info label="Conducted" value={String(conducted)} />
          <Info label="Attended" value={String(attended)} />
        </dl>

        <div className="ml-20 w-full max-w-md overflow-hidden rounded-xl border border-slate-200 dark:border-white">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="bg-[#0b2f5b] text-[10px] uppercase tracking-wider text-white">
              <tr>
                <th className="px-3 py-2 font-serif font-bold">No of Week</th>
                <th className="px-3 py-2 font-serif font-bold">Status</th>
              </tr>
            </thead>
            <tbody>
              {weeks.length === 0 ? (
                <tr>
                  <td
                    colSpan={2}
                    className="px-3 py-4 text-center font-serif text-slate-400"
                  >
                    No weekly sessions scheduled yet.
                  </td>
                </tr>
              ) : (
                weeks.map((w, i) => {
                  const simple = simpleStatus(w.status);
                  return (
                    <tr
                      key={w.week || i}
                      className="border-b border-slate-100 bg-slate-300 dark:border-white/5 dark:bg-slate-200"
                    >
                      <td className="px-3 py-2 font-normal text-slate-700 dark:bg-slate-200 dark:text-slate-700">
                        {w.week || `Week ${i + 1}`}
                      </td>
                      <td className="px-3 py-2">
                        {simple === "Present" ? (
                          <span className="font-normal text-emerald-600">Present</span>
                        ) : simple === "Absent" ? (
                          <span className="font-normal text-rose-600">Absent</span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-1">
      <dt className="shrink-0 font-serif text-base font-bold text-slate-800 dark:text-white">
        {label}:
      </dt>
      <dd className="truncate font-serif text-base font-bold text-slate-800 dark:text-slate-100">
        {value}
      </dd>
    </div>
  );
}
