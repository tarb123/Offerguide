"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Activity, Search, ArrowRight, RefreshCw } from "lucide-react";

type Log = {
  id: string;
  programName: string;
  mentorName: string;
  mentorEmail: string;
  section: string;
  itemLabel: string;
  fromStatus: string;
  toStatus: string;
  at: string;
};

const STATUS_STYLE: Record<string, string> = {
  "Not Started": "bg-slate-100 text-slate-600 ring-slate-200",
  "In Progress": "bg-sky-50 text-sky-700 ring-sky-200",
  Completed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Deferred: "bg-amber-50 text-amber-700 ring-amber-200",
  Delayed: "bg-rose-50 text-rose-700 ring-rose-200",
};

function StatusTag({ status }: { status: string }) {
  const s = STATUS_STYLE[status] || "bg-slate-100 text-slate-600 ring-slate-200";
  return (
    <span
      className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ring-1 ring-inset ${s}`}
    >
      {status || "—"}
    </span>
  );
}

export default function MonitoringData() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/pgp-management/activity");
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error("Monitoring load error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return logs;
    return logs.filter((l) =>
      [l.mentorName, l.programName, l.itemLabel, l.section, l.toStatus]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [logs, query]);

  const mentorsActive = new Set(logs.map((l) => l.mentorEmail)).size;

  return (
    <div className="text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-white/10 px-3 py-2 mt-24">
        <span className="flex items-center gap-1.5 text-lg font-black text-slate-900 dark:text-white">
          <Activity size={18} className="text-blue-900" />
          Mentor Activity Monitor
        </span>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-400">
            {logs.length} changes · {mentorsActive} mentors
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

      <div className="border-b border-slate-200 dark:border-white/10 px-3 py-2">
        <div className="flex items-center gap-2 rounded-lg bg-slate-50 dark:bg-white/5 px-3 py-1.5 ring-1 ring-inset ring-slate-200 dark:ring-white/10">
          <Search size={14} className="text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by mentor, program, item, or status…"
            className="w-full bg-transparent text-xs outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      {loading ? (
        <p className="p-4 text-slate-500 dark:text-slate-400">Loading activity…</p>
      ) : filtered.length === 0 ? (
        <div className="p-10 text-center">
          <Activity size={26} className="mx-auto text-slate-300" />
          <p className="mt-2 text-sm font-bold text-slate-500">
            {logs.length === 0 ? "No mentor activity yet" : "No matches"}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {logs.length === 0
              ? "Status changes made by mentors will appear here, newest first."
              : "Try a different search term."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-[10px] uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-3 py-2 font-bold">When</th>
                <th className="px-3 py-2 font-bold">Mentor</th>
                <th className="px-3 py-2 font-bold">Program</th>
                <th className="px-3 py-2 font-bold">Item</th>
                <th className="px-3 py-2 font-bold">Change</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr
                  key={l.id}
                  className="border-b border-slate-100 dark:border-white/5"
                >
                  <td className="whitespace-nowrap px-3 py-2 text-slate-500 dark:text-slate-400">
                    {l.at ? new Date(l.at).toLocaleString() : "—"}
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-bold text-slate-900 dark:text-slate-100">
                      {l.mentorName || "—"}
                    </div>
                    <div className="text-[10px] text-slate-400">{l.mentorEmail}</div>
                  </td>
                  <td className="px-3 py-2 text-slate-600 dark:text-slate-300">
                    {l.programName || "—"}
                  </td>
                  <td className="px-3 py-2 text-slate-600 dark:text-slate-300">
                    <span className="text-[9px] font-bold uppercase text-slate-400">
                      {l.section}
                    </span>
                    <div className="max-w-[240px] truncate">{l.itemLabel || "—"}</div>
                  </td>
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center gap-1.5">
                      <StatusTag status={l.fromStatus} />
                      <ArrowRight size={12} className="text-slate-400" />
                      <StatusTag status={l.toStatus} />
                    </span>
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
