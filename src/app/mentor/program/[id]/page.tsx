"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  Mail,
  Phone,
  GraduationCap,
  Check,
  CalendarDays,
  ListChecks,
  Trophy,
} from "lucide-react";
import ProgramView, {
  type ViewTab,
} from "@/app/management/component/ProgramView";
import type { Program } from "@/app/management/component/pgpProgram";

type Student = {
  fullName: string;
  email: string;
  gender: string;
  qualification: string;
  contactNumber: string;
};

type Tab = ViewTab | "students" | "progress" | "attendance";

const TABS: { key: Tab; label: string }[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "progress", label: "Update Progress" },
  { key: "attendance", label: "Attendance" },
  { key: "overview", label: "Overview" },
  { key: "schedule", label: "Weekly Schedule" },
  { key: "flow", label: "Session Flow" },
  { key: "capstone", label: "Capstone Timeline" },
  { key: "portfolio", label: "Portfolio Checklist" },
  { key: "evaluation", label: "Evaluation Plan" },
  { key: "students", label: "Students" },
];

type EditableSection =
  | "weeklySchedule"
  | "capstoneTimeline"
  | "portfolioChecklist";

export default function MentorProgramPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id || "");

  const [program, setProgram] = useState<Program | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [tab, setTab] = useState<Tab>("dashboard");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/pgp-mentor/program/${id}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.message || "Failed to load program.");
          return;
        }
        setProgram(data.program);
        setStudents(data.students || []);
      } catch {
        setError("Failed to load program.");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [id]);

  // Reflect a saved status change in the read-only tabs without a refetch.
  function applyStatus(section: EditableSection, index: number, toStatus: string) {
    setProgram((prev) => {
      if (!prev) return prev;
      const rows = [...((prev[section] as Record<string, unknown>[]) || [])];
      rows[index] = { ...rows[index], status: toStatus };
      return { ...prev, [section]: rows } as Program;
    });
  }

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-darkBlue">
      <div className="mx-auto max-w-6xl p-3 sm:p-5 lg:mt-20">
        <button
          type="button"
          onClick={() => router.push("/mentor/dashboard")}
          className="mb-3 inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 transition hover:text-blue-900 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft size={14} />
          Back to Dashboard
        </button>

        {loading ? (
          <div className="rounded-xl bg-white dark:bg-white/5 p-6 text-sm text-slate-500 shadow-sm">
            Loading program…
          </div>
        ) : error || !program ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm font-semibold text-rose-700">
            {error || "Program not found."}
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-white/5 dark:ring-white/10">
            {/* Header */}
            <div className="bg-[#0b2f5b] px-5 py-4 text-white">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200">
                Program
              </p>
              <h1 className="mt-1 text-xl font-black">
                {program.programName || "Untitled program"}
              </h1>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-semibold text-blue-100">
                <span className="inline-flex items-center gap-1.5">
                  <GraduationCap size={12} className="text-cyan-200" />
                  {program.status}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users size={12} className="text-cyan-200" />
                  {students.length} students enrolled
                </span>
              </div>
            </div>

            {/* Tab bar */}
            <div className="flex flex-wrap gap-0.5 border-b border-slate-200 px-2 py-1.5 dark:border-white/10">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  className={`rounded-lg px-3 py-1.5 text-[11px] font-bold transition ${
                    tab === t.key
                      ? "bg-[#0b2f5b] text-white shadow-sm"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Content */}
            {tab === "students" ? (
              <StudentsTable students={students} />
            ) : tab === "progress" ? (
              <UpdateProgress
                program={program}
                programId={id}
                onApplied={applyStatus}
              />
            ) : tab === "attendance" ? (
              <AttendanceGrid programId={id} />
            ) : (
              <ProgramView program={program} tab={tab} />
            )}
          </div>
        )}
      </div>
    </main>
  );
}

const STATUS_OPTIONS = ["Not Started", "In Progress", "Completed", "Deferred"];
const CAPSTONE_OPTIONS = ["Not Started", "In Progress", "Completed", "Delayed"];

const STATUS_COLOR: Record<string, string> = {
  "Not Started": "ring-slate-200 text-slate-600",
  "In Progress": "ring-sky-300 text-sky-700",
  Completed: "ring-emerald-300 text-emerald-700",
  Deferred: "ring-amber-300 text-amber-700",
  Delayed: "ring-rose-300 text-rose-700",
};

type Row = { label: string; sub: string; status: string; index: number };

function UpdateProgress({
  program,
  programId,
  onApplied,
}: {
  program: Program;
  programId: string;
  onApplied: (section: EditableSection, index: number, toStatus: string) => void;
}) {
  const [savingKey, setSavingKey] = useState("");
  const [savedKey, setSavedKey] = useState("");
  const [error, setError] = useState("");

  async function changeStatus(
    section: EditableSection,
    index: number,
    itemLabel: string,
    toStatus: string
  ) {
    const key = `${section}-${index}`;
    setSavingKey(key);
    setError("");
    onApplied(section, index, toStatus); // optimistic

    let mentor: { id?: string; fullName?: string; email?: string } = {};
    try {
      mentor = JSON.parse(localStorage.getItem("mentorUser") || "{}");
    } catch {}

    try {
      const res = await fetch(`/api/pgp-mentor/program/${programId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section,
          index,
          toStatus,
          itemLabel,
          mentorId: mentor.id || "",
          mentorName: mentor.fullName || "",
          mentorEmail: mentor.email || "",
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Save failed.");
        return;
      }
      setSavedKey(key);
      setTimeout(() => setSavedKey((k) => (k === key ? "" : k)), 1500);
    } catch {
      setError("Save failed. Check your connection.");
    } finally {
      setSavingKey((k) => (k === key ? "" : k));
    }
  }

  const groups: {
    section: EditableSection;
    title: string;
    icon: React.ReactNode;
    options: string[];
    rows: Row[];
  }[] = [
    {
      section: "weeklySchedule",
      title: "Weekly Sessions",
      icon: <CalendarDays size={14} />,
      options: STATUS_OPTIONS,
      rows: (program.weeklySchedule || []).map((r, i) => ({
        label: r.week || `Session ${i + 1}`,
        sub: r.sessionTitle || r.module || "",
        status: r.status || "Not Started",
        index: i,
      })),
    },
    {
      section: "capstoneTimeline",
      title: "Capstone Components",
      icon: <Trophy size={14} />,
      options: CAPSTONE_OPTIONS,
      rows: (program.capstoneTimeline || []).map((r, i) => ({
        label: r.week || `Component ${i + 1}`,
        sub: r.component || "",
        status: r.status || "Not Started",
        index: i,
      })),
    },
    {
      section: "portfolioChecklist",
      title: "Portfolio Items",
      icon: <ListChecks size={14} />,
      options: STATUS_OPTIONS,
      rows: (program.portfolioChecklist || []).map((r, i) => ({
        label: r.item || `Item ${i + 1}`,
        sub: r.relatedWeek || "",
        status: r.status || "Not Started",
        index: i,
      })),
    },
  ];

  return (
    <div className="px-3 py-3">
      <p className="mb-3 rounded-lg bg-blue-50 px-3 py-1.5 text-[11px] font-semibold text-blue-900 dark:bg-sky-500/10 dark:text-sky-300">
        Update the delivery status of each item — every change is saved and recorded
        for management review.
      </p>

      {error && (
        <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((g) => (
          <div key={g.section} className="min-w-0">
            <h3 className="mb-1.5 flex items-center gap-1.5 border-b border-slate-200 pb-1 text-[11px] font-black uppercase tracking-wider text-[#0b2f5b] dark:border-white/10 dark:text-sky-300">
              <span className="text-blue-900 dark:text-sky-300">{g.icon}</span>
              {g.title}
              <span className="ml-auto text-slate-400">{g.rows.length}</span>
            </h3>

            {g.rows.length === 0 ? (
              <p className="py-3 text-center text-[11px] text-slate-400">
                No items.
              </p>
            ) : (
              <ul className="max-h-[58vh] divide-y divide-slate-100 overflow-y-auto pr-1 dark:divide-white/5">
                {g.rows.map((row) => {
                  const key = `${g.section}-${row.index}`;
                  const color =
                    STATUS_COLOR[row.status] || "ring-slate-200 text-slate-600";
                  return (
                    <li key={key} className="flex items-center gap-2 py-1.5">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] font-bold text-slate-900 dark:text-white">
                          {row.label}
                        </p>
                        {row.sub && (
                          <p className="truncate text-[10px] text-slate-400">
                            {row.sub}
                          </p>
                        )}
                      </div>

                      {savingKey === key ? (
                        <span className="shrink-0 text-[9px] font-bold text-slate-400">
                          …
                        </span>
                      ) : savedKey === key ? (
                        <Check size={12} className="shrink-0 text-emerald-600" />
                      ) : null}

                      <select
                        value={row.status}
                        onChange={(e) =>
                          changeStatus(
                            g.section,
                            row.index,
                            `${row.label}${row.sub ? " — " + row.sub : ""}`,
                            e.target.value
                          )
                        }
                        className={`w-[92px] shrink-0 rounded-md border-0 bg-white px-1.5 py-1 text-[10px] font-bold shadow-sm ring-1 ring-inset outline-none transition focus:ring-2 focus:ring-blue-900 dark:bg-white/10 ${color}`}
                      >
                        {g.options.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------ Attendance ------------------------------- */

const ATT_OPTIONS = ["", "Present", "Absent", "Late", "Excused"];
const ATT_STYLE: Record<string, string> = {
  "": "bg-white text-slate-300 ring-slate-200",
  Present: "bg-emerald-50 text-emerald-700 ring-emerald-300",
  Absent: "bg-rose-50 text-rose-700 ring-rose-300",
  Late: "bg-amber-50 text-amber-700 ring-amber-300",
  Excused: "bg-slate-100 text-slate-600 ring-slate-300",
};

type AttStudent = { fullName: string; email: string };

function AttendanceGrid({ programId }: { programId: string }) {
  const [weeks, setWeeks] = useState<string[]>([]);
  const [students, setStudents] = useState<AttStudent[]>([]);
  // marks keyed by `${email}|${week}` -> status
  const [marks, setMarks] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/pgp-mentor/program/${programId}/attendance`);
        const data = await res.json();
        setWeeks(data.weeks || []);
        setStudents(data.students || []);
        const m: Record<string, string> = {};
        for (const r of data.records || []) {
          m[`${r.candidateEmail}|${r.week}`] = r.status;
        }
        setMarks(m);
      } catch {
        setError("Failed to load attendance.");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [programId]);

  async function setMark(student: AttStudent, week: string, status: string) {
    const key = `${student.email}|${week}`;
    setMarks((prev) => ({ ...prev, [key]: status })); // optimistic

    let mentor: { id?: string; fullName?: string } = {};
    try {
      mentor = JSON.parse(localStorage.getItem("mentorUser") || "{}");
    } catch {}

    try {
      await fetch(`/api/pgp-mentor/program/${programId}/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateEmail: student.email,
          candidateName: student.fullName,
          week,
          status,
          markedById: mentor.id || "",
          markedByName: mentor.fullName || "",
        }),
      });
    } catch {
      setError("A change failed to save. Please retry.");
    }
  }

  function pct(student: AttStudent) {
    let credit = 0;
    let marked = 0;
    for (const w of weeks) {
      const s = marks[`${student.email}|${w}`];
      if (s) marked++;
      if (s === "Present" || s === "Late") credit++;
    }
    return marked ? Math.round((credit / marked) * 100) : 0;
  }

  if (loading) {
    return <p className="px-3 py-4 text-sm text-slate-500">Loading attendance…</p>;
  }

  if (students.length === 0) {
    return (
      <div className="p-8 text-center">
        <Users size={26} className="mx-auto text-slate-300" />
        <p className="mt-2 text-sm font-bold text-slate-500">No students enrolled</p>
        <p className="mt-1 text-xs text-slate-400">
          Attendance appears once management assigns students to this program.
        </p>
      </div>
    );
  }

  return (
    <div className="px-3 py-3">
      {error && (
        <p className="mb-2 rounded-lg bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">
          {error}
        </p>
      )}

      <div className="mb-2 flex flex-wrap gap-3 text-[10px] font-semibold text-slate-500">
        {(["Present", "Absent", "Late", "Excused"] as const).map((s) => (
          <span key={s} className="inline-flex items-center gap-1">
            <span
              className={`h-2.5 w-2.5 rounded-sm ring-1 ring-inset ${ATT_STYLE[s]}`}
            />
            {s}
          </span>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg ring-1 ring-slate-200 dark:ring-white/10">
        <table className="w-full border-collapse text-left text-[11px]">
          <thead className="bg-slate-50 dark:bg-white/5 text-[10px] uppercase tracking-wider text-slate-400">
            <tr>
              <th className="sticky left-0 z-10 bg-slate-50 dark:bg-white/5 px-3 py-2 font-bold">
                Student
              </th>
              {weeks.map((w) => (
                <th key={w} className="whitespace-nowrap px-2 py-2 text-center font-bold">
                  {w.replace("Week ", "W")}
                </th>
              ))}
              <th className="px-2 py-2 text-center font-bold">%</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => {
              const p = pct(s);
              return (
                <tr key={s.email} className="border-t border-slate-100 dark:border-white/5">
                  <td className="sticky left-0 z-10 bg-white dark:bg-white/5 px-3 py-1.5">
                    <div className="max-w-[160px] truncate font-bold text-slate-900 dark:text-white">
                      {s.fullName || s.email}
                    </div>
                  </td>
                  {weeks.map((w) => {
                    const status = marks[`${s.email}|${w}`] || "";
                    return (
                      <td key={w} className="px-1 py-1 text-center">
                        <select
                          value={status}
                          onChange={(e) => setMark(s, w, e.target.value)}
                          title={`${s.fullName} · ${w}`}
                          className={`w-[64px] cursor-pointer rounded-md border-0 px-1 py-1 text-[10px] font-bold ring-1 ring-inset outline-none transition focus:ring-2 focus:ring-blue-900 ${ATT_STYLE[status]}`}
                        >
                          {ATT_OPTIONS.map((o) => (
                            <option key={o} value={o}>
                              {o === "" ? "—" : o}
                            </option>
                          ))}
                        </select>
                      </td>
                    );
                  })}
                  <td className="px-2 py-1.5 text-center">
                    <span
                      className={`font-black tabular-nums ${
                        p >= 75
                          ? "text-emerald-600"
                          : p >= 50
                          ? "text-amber-600"
                          : "text-rose-600"
                      }`}
                    >
                      {p}%
                    </span>
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

function StudentsTable({ students }: { students: Student[] }) {
  if (!students.length) {
    return (
      <div className="p-8 text-center">
        <Users size={26} className="mx-auto text-slate-300" />
        <p className="mt-2 text-sm font-bold text-slate-500">No students enrolled yet</p>
        <p className="mt-1 text-xs text-slate-400">
          Students assigned to this program by management will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto px-3 py-2">
      <table className="w-full border-collapse text-left text-xs">
        <thead className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400 dark:border-white/10 dark:bg-white/5">
          <tr>
            <th className="px-3 py-2 font-bold">#</th>
            <th className="px-3 py-2 font-bold">Name</th>
            <th className="px-3 py-2 font-bold">Email</th>
            <th className="px-3 py-2 font-bold">Gender</th>
            <th className="px-3 py-2 font-bold">Qualification</th>
            <th className="px-3 py-2 font-bold">Contact</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s, i) => (
            <tr
              key={`${s.email}-${i}`}
              className="border-b border-slate-100 dark:border-white/5"
            >
              <td className="px-3 py-2 text-slate-400">{i + 1}</td>
              <td className="px-3 py-2 font-bold text-slate-900 dark:text-slate-100">
                {s.fullName || "-"}
              </td>
              <td className="px-3 py-2 text-slate-600 dark:text-slate-300">
                <span className="inline-flex items-center gap-1">
                  <Mail size={11} className="text-slate-400" />
                  {s.email || "-"}
                </span>
              </td>
              <td className="px-3 py-2 text-slate-600 dark:text-slate-300">
                {s.gender || "-"}
              </td>
              <td className="px-3 py-2 text-slate-600 dark:text-slate-300">
                {s.qualification || "-"}
              </td>
              <td className="px-3 py-2 text-slate-600 dark:text-slate-300">
                <span className="inline-flex items-center gap-1">
                  <Phone size={11} className="text-slate-400" />
                  {s.contactNumber || "-"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
