"use client";

import React, { useEffect, useMemo, useState } from "react";
import { CalendarCheck, Search, RefreshCw, AlertTriangle } from "lucide-react";

type Row = {
  fullName: string;
  email: string;
  programName: string;
  present: number;
  late: number;
  absent: number;
  excused: number;
  marked: number;
  totalWeeks: number;
  percent: number;
};

export default function AttendanceData() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/pgp-management/attendance");
      const data = await res.json();
      setRows(data.candidates || []);
    } catch (error) {
      console.error("Attendance load error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.fullName, r.email, r.programName].join(" ").toLowerCase().includes(q)
    );
  }, [rows, query]);

  const marked = rows.filter((r) => r.marked > 0);
  const avg = marked.length
    ? Math.round(marked.reduce((s, r) => s + r.percent, 0) / marked.length)
    : 0;
  const atRisk = marked.filter((r) => r.percent < 50).length;

  return (
    <div className="text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-white/10 px-3 py-2 mt-24">
        <span className="flex items-center gap-1.5 text-lg font-black text-slate-900 dark:text-white">
          <CalendarCheck size={18} className="text-blue-900" />
          Candidate Attendance
        </span>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-semibold text-slate-400">
            {rows.length} enrolled · avg {avg}%
          </span>
          {atRisk > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 ring-1 ring-inset ring-rose-200">
              <AlertTriangle size={11} />
              {atRisk} at risk
            </span>
          )}
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

      <div className="border-b border-slate-200 dark:border-white/10 px-3 py-2">
        <div className="flex items-center gap-2 rounded-lg bg-slate-50 dark:bg-white/5 px-3 py-1.5 ring-1 ring-inset ring-slate-200 dark:ring-white/10">
          <Search size={14} className="text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by candidate or program…"
            className="w-full bg-transparent text-xs outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      {loading ? (
        <p className="p-4 text-slate-500 dark:text-slate-400">Loading attendance…</p>
      ) : filtered.length === 0 ? (
        <div className="p-10 text-center">
          <CalendarCheck size={26} className="mx-auto text-slate-300" />
          <p className="mt-2 text-sm font-bold text-slate-500">
            {rows.length === 0 ? "No enrolled candidates yet" : "No matches"}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {rows.length === 0
              ? "Assign candidates to a program, then mentors mark their attendance."
              : "Try a different search."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-[10px] uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-3 py-2 font-bold">Candidate</th>
                <th className="px-3 py-2 font-bold">Program</th>
                <th className="px-3 py-2 text-center font-bold">Present</th>
                <th className="px-3 py-2 text-center font-bold">Late</th>
                <th className="px-3 py-2 text-center font-bold">Absent</th>
                <th className="px-3 py-2 text-center font-bold">Marked</th>
                <th className="px-3 py-2 font-bold">Attendance</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.email}
                  className="border-b border-slate-100 dark:border-white/5"
                >
                  <td className="px-3 py-2">
                    <div className="font-bold text-slate-900 dark:text-slate-100">
                      {r.fullName || "—"}
                    </div>
                    <div className="text-[10px] text-slate-400">{r.email}</div>
                  </td>
                  <td className="px-3 py-2 text-slate-600 dark:text-slate-300">
                    {r.programName || "—"}
                  </td>
                  <td className="px-3 py-2 text-center font-bold tabular-nums text-emerald-600">
                    {r.present}
                  </td>
                  <td className="px-3 py-2 text-center font-bold tabular-nums text-amber-600">
                    {r.late}
                  </td>
                  <td className="px-3 py-2 text-center font-bold tabular-nums text-rose-600">
                    {r.absent}
                  </td>
                  <td className="px-3 py-2 text-center tabular-nums text-slate-500">
                    {r.marked}/{r.totalWeeks}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                        <div
                          className={`h-full rounded-full ${
                            r.percent >= 75
                              ? "bg-emerald-500"
                              : r.percent >= 50
                              ? "bg-amber-500"
                              : "bg-rose-500"
                          }`}
                          style={{ width: `${r.percent}%` }}
                        />
                      </div>
                      <span
                        className={`font-black tabular-nums ${
                          r.percent >= 75
                            ? "text-emerald-600"
                            : r.percent >= 50
                            ? "text-amber-600"
                            : "text-rose-600"
                        }`}
                      >
                        {r.marked ? `${r.percent}%` : "—"}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
