"use client";

import React, { useEffect, useState } from "react";
import {
  GraduationCap,
  UserCog,
  CalendarDays,
  ListChecks,
  Trophy,
  CheckCircle2,
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

const STATUS_PILL: Record<string, string> = {
  Active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Completed: "bg-blue-50 text-blue-700 ring-blue-200",
  Draft: "bg-slate-100 text-slate-600 ring-slate-200",
  Paused: "bg-amber-50 text-amber-700 ring-amber-200",
};

export default function CandidatePrograms() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [enrolledId, setEnrolledId] = useState("");
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState("");
  const [message, setMessage] = useState("");
  const [user, setUser] = useState<{ email?: string; fullName?: string }>({});

  useEffect(() => {
    const saved = localStorage.getItem("candidateUser");
    const u = saved ? JSON.parse(saved) : {};
    setUser(u);

    async function load() {
      try {
        const res = await fetch(
          `/api/pgp-candidate/programs?email=${encodeURIComponent(u.email || "")}`
        );
        const data = await res.json();
        setPrograms(data.programs || []);
        setEnrolledId(data.enrolledProgramId || "");
      } catch (error) {
        console.error("Programs load error:", error);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  async function join(program: Program) {
    setJoining(program.programId);
    setMessage("");
    try {
      const res = await fetch("/api/pgp-candidate/programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          fullName: user.fullName,
          programId: program.programId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.message || "Enrollment failed.");
        return;
      }
      setEnrolledId(program.programId);
      setMessage(data.message);
    } catch {
      setMessage("Enrollment failed. Please try again.");
    } finally {
      setJoining("");
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl bg-white p-6 text-sm text-slate-500 shadow-sm">
        Loading programs…
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {message && (
        <div className="rounded-xl bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-800">
          {message}
        </div>
      )}

      {programs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center shadow-sm">
          <GraduationCap size={26} className="mx-auto text-slate-300" />
          <p className="mt-2 text-sm font-bold text-slate-500">
            No programs available yet
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Programs published by management will appear here to join.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 mt-16 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {programs.map((p) => {
            const enrolled = enrolledId === p.programId;
            const pill =
              STATUS_PILL[p.status] || "bg-slate-100 text-slate-600 ring-slate-200";
            return (
              <div
                key={p.programId}
                className={`flex flex-col rounded-xl border bg-white p-4 shadow-sm transition ${
                  enrolled ? "border-emerald-300 ring-1 ring-emerald-200" : "border-slate-200"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Program
                    </p>
                    <h3 className="text-sm font-black text-slate-900">
                      {p.programName}
                    </h3>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ring-1 ring-inset ${pill}`}
                  >
                    {p.status}
                  </span>
                </div>

                {p.mentorName && (
                  <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                    <UserCog size={12} className="text-blue-900" />
                    Mentor: {p.mentorName}
                  </p>
                )}

                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-semibold text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays size={12} />
                    {p.weeks} weeks
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <ListChecks size={12} />
                    {p.portfolioItems} portfolio
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Trophy size={12} />
                    {p.capstoneItems} capstone
                  </span>
                </div>

                <div className="mt-4 pt-1">
                  {enrolled ? (
                    <span className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                      <CheckCircle2 size={14} />
                      Enrolled
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={joining === p.programId}
                      onClick={() => join(p)}
                      className="w-full rounded-lg bg-[#0b2f5b] px-3 py-2 text-xs font-bold text-white transition hover:bg-blue-950 disabled:opacity-60"
                    >
                      {joining === p.programId
                        ? "Joining…"
                        : enrolledId
                        ? "Switch to this program"
                        : "Join Program"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
