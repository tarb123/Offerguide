"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
  UserCog,
} from "lucide-react";
import { MentorAvatar } from "@/components/portal/CandidateAvatar";
import ProgramView, { type ViewTab } from "../../component/ProgramView";
import type { Program } from "../../component/pgpProgram";

/**
 * A program on its own page: /pgp-admin/program/<id>.
 *
 * Deliberately independent of the Programs tab. That tab is a large
 * create/edit surface; this page only READS, through the shared `ProgramView`
 * renderer, so if the tab ever breaks the program can still be opened and
 * read here. The tab's "view" icon opens this page in a new browser tab.
 *
 * Sits under /pgp-admin, so the layout's server-side admin gate applies.
 */

type Mentor = {
  mentorId: string;
  fullName: string;
  email: string;
  phone?: string;
  expertise?: string;
};

const TABS: { key: ViewTab; label: string }[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "overview", label: "Overview" },
  { key: "schedule", label: "Weekly Schedule" },
  { key: "flow", label: "Session Flow" },
  { key: "capstone", label: "Capstone Timeline" },
  { key: "portfolio", label: "Portfolio Checklist" },
  { key: "evaluation", label: "Evaluation Plan" },
];

export default function ProgramDetailPage() {
  const params = useParams();
  const id = String(params.id || "");

  const [program, setProgram] = useState<Program | null>(null);
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [tab, setTab] = useState<ViewTab>("overview");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      // The programs list is the one endpoint the admin has for programs; the
      // mentors it returns are the assignable (Active) ones, with contact
      // details the program row itself does not carry.
      const [programsRes, mentorsRes] = await Promise.all([
        fetch("/api/pgp-management/programs-pgp"),
        fetch("/api/pgp-management/mentors-pgp"),
      ]);
      const programsData = await programsRes.json();

      if (!programsRes.ok) {
        setError(programsData.message || "Failed to load program.");
        return;
      }

      const found = (programsData.programs || []).find(
        (p: Program) => p.programId === id
      );

      if (!found) {
        setError("Program not found.");
        return;
      }

      setProgram(found);
      setError("");

      if (mentorsRes.ok) {
        const mentorsData = await mentorsRes.json();
        // Enrich (phone, expertise) only when the record really is the
        // mentor the program names — programs carry a denormalised copy of
        // the mentor's name/email, and a stale id must not swap the person.
        const assigned = (mentorsData.mentors || []).find(
          (m: Mentor) =>
            m.mentorId === found.assignedMentorId &&
            m.email === (found.assignedMentorEmail || "").toLowerCase()
        );
        setMentor(assigned || null);
      }
    } catch {
      setError("Failed to load program.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function refresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  // The program's own record is the source of truth for who is assigned; the
  // mentor lookup only adds contact details.
  const mentorName = program?.assignedMentorName || mentor?.fullName || "";
  const mentorEmail = program?.assignedMentorEmail || mentor?.email || "";

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-darkBlue">
      <div className="mx-auto max-w-6xl p-3 sm:p-5">
        <div className="mb-2 flex items-center justify-between">
          <Link
            href="/pgp-admin?tab=programs"
            className="inline-flex items-center gap-1.5 text-xs font-normal text-slate-500 transition hover:text-blue-900 dark:text-slate-400 dark:hover:text-white"
          >
            <ArrowLeft size={14} />
            Back to programs
          </Link>
          <button
            type="button"
            onClick={refresh}
            disabled={refreshing}
            title="Refresh"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 disabled:opacity-60 dark:hover:bg-white/10"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>

        {loading ? (
          <div className="grid place-items-center rounded-xl bg-white p-10 text-slate-400 shadow-sm dark:bg-white/5">
            <Loader2 size={20} className="animate-spin" />
          </div>
        ) : error || !program ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm font-semibold text-rose-700">
            {error || "Program not found."}
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
            {/* Mentor strip: the photo is the point of this page's header. */}
            <div className="flex flex-wrap items-center gap-4 border-b border-slate-200 px-4 py-3 dark:border-white/10">
              {mentorName ? (
                <>
                  <MentorAvatar email={mentorEmail} name={mentorName} size={56} />
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      Assigned mentor
                    </p>
                    <p className="flex items-center gap-1.5 text-sm font-black text-slate-900 dark:text-white">
                      <UserCog size={14} className="text-blue-900 dark:text-cyan-200" />
                      {mentorName}
                    </p>
                    <div className="mt-0.5 flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] text-slate-500 dark:text-slate-300">
                      {mentorEmail && (
                        <span className="inline-flex items-center gap-1">
                          <Mail size={11} />
                          {mentorEmail}
                        </span>
                      )}
                      {mentor?.phone && (
                        <span className="inline-flex items-center gap-1">
                          <Phone size={11} />
                          {mentor.phone}
                        </span>
                      )}
                      {mentor?.expertise && <span>{mentor.expertise}</span>}
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-xs font-semibold text-slate-400">No mentor assigned yet.</p>
              )}

              <div className="ml-auto text-right text-[11px] text-slate-500 dark:text-slate-300">
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Program</p>
                <p className="text-sm font-black text-slate-900 dark:text-white">
                  {program.programName || "Untitled program"}
                </p>
                {(program.startDate || program.endDate) && (
                  <p className="inline-flex items-center gap-1">
                    <CalendarDays size={11} />
                    {[program.startDate, program.endDate].filter(Boolean).join(" → ")}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 border-b border-slate-200 px-2 py-1.5 dark:border-white/10">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    tab === t.key
                      ? "bg-[#0b2f5b] text-white"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <ProgramView program={program} tab={tab} />
          </div>
        )}
      </div>
    </main>
  );
}
