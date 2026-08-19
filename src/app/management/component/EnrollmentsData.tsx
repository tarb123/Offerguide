"use client";

import React, { useEffect, useState } from "react";
import {
  GraduationCap,
  Users,
  UserCog,
  ChevronDown,
  RefreshCw,
  CalendarDays,
} from "lucide-react";

type Student = {
  fullName: string;
  email: string;
  gender: string;
  contactNumber: string;
};

type ProgramEnrollment = {
  programId: string;
  programName: string;
  status: string;
  mentorName: string;
  weeks: number;
  studentCount: number;
  students: Student[];
};

const STATUS_PILL: Record<string, string> = {
  Active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Completed: "bg-blue-50 text-blue-700 ring-blue-200",
  Draft: "bg-slate-100 text-slate-600 ring-slate-200",
  Paused: "bg-amber-50 text-amber-700 ring-amber-200",
};

export default function EnrollmentsData() {
  const [programs, setPrograms] = useState<ProgramEnrollment[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/pgp-management/enrollments");
      const data = await res.json();
      setPrograms(data.programs || []);
      setTotalStudents(data.totalStudents || 0);
    } catch (error) {
      console.error("Enrollments load error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-white/10 px-3 py-2 mt-24">
        <span className="flex items-center gap-1.5 text-lg font-black text-slate-900 dark:text-white">
          <GraduationCap size={18} className="text-blue-900" />
          Program Enrollments
        </span>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-semibold text-slate-400">
            {programs.length} programs · {totalStudents} students
          </span>
          <button
            type="button"
            onClick={load}
            title="Refresh"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-white/10"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {loading ? (
        <p className="p-4 text-slate-500 dark:text-slate-400">Loading enrollments…</p>
      ) : programs.length === 0 ? (
        <div className="p-10 text-center">
          <GraduationCap size={26} className="mx-auto text-slate-300" />
          <p className="mt-2 text-sm font-bold text-slate-500">No programs yet</p>
        </div>
      ) : (
        <div className="space-y-2 p-3">
          {programs.map((p) => {
            const expanded = open === p.programId;
            const pill =
              STATUS_PILL[p.status] || "bg-slate-100 text-slate-600 ring-slate-200";
            return (
              <div
                key={p.programId}
                className="overflow-hidden rounded-xl ring-1 ring-slate-200 dark:ring-white/10"
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpen((v) => (v === p.programId ? "" : p.programId))
                  }
                  className="flex w-full items-center gap-3 bg-white dark:bg-white/5 px-4 py-3 text-left transition hover:bg-slate-50 dark:hover:bg-white/10"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-sm font-black text-slate-900 dark:text-white">
                        {p.programName}
                      </h3>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ring-1 ring-inset ${pill}`}
                      >
                        {p.status}
                      </span>
                    </div>
                    <div className="mt-0.5 flex flex-wrap gap-x-3 text-[11px] font-semibold text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        <UserCog size={11} />
                        {p.mentorName || "No mentor"}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays size={11} />
                        {p.weeks} weeks
                      </span>
                    </div>
                  </div>

                  <span className="flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-blue-900 dark:bg-sky-500/10 dark:text-sky-300">
                    <Users size={15} />
                    <span className="text-lg font-black leading-none">
                      {p.studentCount}
                    </span>
                  </span>

                  <ChevronDown
                    size={16}
                    className={`shrink-0 text-slate-400 transition ${
                      expanded ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {expanded && (
                  <div className="border-t border-slate-100 dark:border-white/10">
                    {p.students.length === 0 ? (
                      <p className="px-4 py-4 text-center text-xs text-slate-400">
                        No candidates enrolled in this program yet.
                      </p>
                    ) : (
                      <table className="w-full border-collapse text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-white/5 text-[10px] uppercase tracking-wider text-slate-400">
                          <tr>
                            <th className="px-4 py-2 font-bold">#</th>
                            <th className="px-3 py-2 font-bold">Name</th>
                            <th className="px-3 py-2 font-bold">Email</th>
                            <th className="px-3 py-2 font-bold">Gender</th>
                            <th className="px-3 py-2 font-bold">Contact</th>
                          </tr>
                        </thead>
                        <tbody>
                          {p.students.map((s, i) => (
                            <tr
                              key={s.email || i}
                              className="border-t border-slate-100 dark:border-white/5"
                            >
                              <td className="px-4 py-2 text-slate-400">{i + 1}</td>
                              <td className="px-3 py-2 font-bold text-slate-900 dark:text-slate-100">
                                {s.fullName || "—"}
                              </td>
                              <td className="px-3 py-2 text-slate-600 dark:text-slate-300">
                                {s.email || "—"}
                              </td>
                              <td className="px-3 py-2 text-slate-600 dark:text-slate-300">
                                {s.gender || "—"}
                              </td>
                              <td className="px-3 py-2 text-slate-600 dark:text-slate-300">
                                {s.contactNumber || "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
