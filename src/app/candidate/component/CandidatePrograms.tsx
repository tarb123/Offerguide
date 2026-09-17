"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  UserCog,
  CalendarDays,
  ListChecks,
  Trophy,
  Plus,
  Eye,
  Star,
  LogOut,
  Loader2,
  RefreshCw,
} from "lucide-react";

type Program = {
  programId: string;
  programName: string;
  status: string;
  mentorName: string;
  recommendedDuration: string;
  weeks: number;
  portfolioItems: number;
  capstoneItems: number;
};

const STATUS: Record<
  string,
  { band: string; dot: string; ring: string }
> = {
  Active: {
    band: "bg-gradient-to-r from-emerald-400 to-teal-500",
    dot: "bg-emerald-500",
    ring: "ring-emerald-300",
  },
  Completed: {
    band: "bg-gradient-to-r from-sky-400 to-indigo-500",
    dot: "bg-sky-500",
    ring: "ring-sky-300",
  },
  Paused: {
    band: "bg-gradient-to-r from-amber-400 to-orange-500",
    dot: "bg-amber-500",
    ring: "ring-amber-300",
  },
  Draft: {
    band: "bg-gradient-to-r from-slate-300 to-slate-400",
    dot: "bg-slate-400",
    ring: "ring-slate-300",
  },
};

export default function CandidatePrograms() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [enrolledIds, setEnrolledIds] = useState<string[]>([]);
  const [activeId, setActiveId] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [toast, setToast] = useState("");
  const [user, setUser] = useState<{ email?: string; fullName?: string }>({});

  const load = useCallback(async (email?: string) => {
    const e =
      email ??
      (() => {
        try {
          return JSON.parse(localStorage.getItem("candidateUser") || "{}").email;
        } catch {
          return "";
        }
      })();
    try {
      const res = await fetch(
        `/api/pgp-candidate/programs?email=${encodeURIComponent(e || "")}`
      );
      const data = await res.json();
      setPrograms(data.programs || []);
      setEnrolledIds(data.enrolledProgramIds || []);
      setActiveId(data.activeProgramId || "");
    } catch (error) {
      console.error("Programs load error:", error);
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("candidateUser");
    const u = saved ? JSON.parse(saved) : {};
    setUser(u);
    void load(u.email).finally(() => setLoading(false));
  }, [load]);

  async function refresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  async function act(program: Program, action: "join" | "setActive" | "leave") {
    setBusyId(program.programId);
    setToast("");
    try {
      const res = await fetch("/api/pgp-candidate/programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          fullName: user.fullName,
          programId: program.programId,
          action,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setToast(data.message || "Something went wrong.");
        return;
      }
      setEnrolledIds(data.enrolledProgramIds || []);
      setActiveId(data.activeProgramId || "");
      setToast(data.message);
      window.setTimeout(() => setToast(""), 2500);
    } catch {
      setToast("Something went wrong. Please try again.");
    } finally {
      setBusyId("");
    }
  }

  if (loading) {
    return (
      <div className="grid place-items-center rounded-2xl bg-white p-10 text-slate-400 shadow-sm dark:bg-white/5">
        <Loader2 size={22} className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {programs.length} program{programs.length === 1 ? "" : "s"}
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

      {toast && (
        <div className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5 text-xs font-bold text-white shadow-md">
          <Star size={14} className="fill-white" />
          {toast}
        </div>
      )}

      {programs.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center shadow-sm dark:border-white/10 dark:bg-white/5">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
            <GraduationCap size={26} />
          </span>
          <p className="mt-3 text-sm font-black text-slate-500">Nothing here yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {programs.map((p) => {
            const enrolled = enrolledIds.includes(p.programId);
            const isActive = activeId === p.programId;
            const busy = busyId === p.programId;
            const s = STATUS[p.status] || STATUS.Draft;

            return (
              <div
                key={p.programId}
                className={`group flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl dark:bg-white/5 ${
                  isActive
                    ? `border-transparent ring-2 ${s.ring}`
                    : "border-slate-200 dark:border-white/10"
                }`}
              >
                {/* status band */}
                <div className={`h-1.5 w-full ${s.band}`} />

                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-start justify-between">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-[#0b2f5b] to-[#1746b5] text-white shadow-md transition group-hover:scale-110">
                      <GraduationCap size={20} />
                    </span>
                    <span
                      title={p.status}
                      className={`mt-1 h-2.5 w-2.5 rounded-full ${s.dot} ring-4 ring-slate-100 dark:ring-white/10`}
                    />
                  </div>

                  <h3 className="mt-3 line-clamp-2 text-sm font-black leading-snug text-slate-900 dark:text-white">
                    {p.programName}
                  </h3>

                  {p.mentorName && (
                    <p
                      title={`Mentor: ${p.mentorName}`}
                      className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-slate-400"
                    >
                      <UserCog size={12} />
                      <span className="truncate">{p.mentorName}</span>
                    </p>
                  )}

                  {/* icon stats */}
                  <div className="mt-3 grid grid-cols-3 gap-1.5">
                    <Stat icon={<CalendarDays size={13} />} value={p.weeks} label="weeks" />
                    <Stat icon={<ListChecks size={13} />} value={p.portfolioItems} label="portfolio items" />
                    <Stat icon={<Trophy size={13} />} value={p.capstoneItems} label="capstone items" />
                  </div>

                  {/* actions */}
                  <div className="mt-4 flex items-center gap-1.5 pt-1">
                    {!enrolled ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => act(p, "join")}
                        title="Join this program"
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#0b2f5b] to-[#1746b5] px-3 py-2.5 text-xs font-black text-white shadow-md transition hover:brightness-110 disabled:opacity-60"
                      >
                        {busy ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Plus size={15} />
                        )}
                        Join
                      </button>
                    ) : (
                      <>
                        <Link
                          href={`/candidate/program/${p.programId}`}
                          title="View full program"
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#0b2f5b] to-[#1746b5] px-3 py-2.5 text-xs font-black text-white shadow-md transition hover:brightness-110"
                        >
                          <Eye size={15} />
                          View
                        </Link>

                        <button
                          type="button"
                          disabled={busy || isActive}
                          onClick={() => act(p, "setActive")}
                          title={isActive ? "Active program" : "Make active"}
                          className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl transition ${
                            isActive
                              ? "bg-amber-400 text-white shadow-md"
                              : "bg-slate-100 text-slate-400 hover:bg-amber-100 hover:text-amber-600 dark:bg-white/10 dark:text-slate-300"
                          }`}
                        >
                          <Star size={15} className={isActive ? "fill-white" : ""} />
                        </button>

                        {!isActive && (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => act(p, "leave")}
                            title="Leave program"
                            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-400 transition hover:bg-rose-100 hover:text-rose-600 disabled:opacity-60 dark:bg-white/10 dark:text-slate-300"
                          >
                            <LogOut size={14} />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <span
      title={`${value} ${label}`}
      className="flex items-center justify-center gap-1 rounded-lg bg-slate-50 py-1.5 text-slate-600 dark:bg-white/5 dark:text-slate-300"
    >
      <span className="text-blue-900 dark:text-sky-300">{icon}</span>
      <span className="text-xs font-black tabular-nums">{value}</span>
    </span>
  );
}
