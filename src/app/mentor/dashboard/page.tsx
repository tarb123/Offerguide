"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  FileText,
  LogOut,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  GraduationCap,
  ListChecks,
  Trophy,
  CalendarDays,
  ArrowRight,
  ChevronDown,
} from "lucide-react";

type MentorProgram = {
  programId: string;
  programName: string;
  status: string;
  recommendedDuration: string;
  weeks: number;
  portfolioItems: number;
  capstoneItems: number;
  studentCount: number;
  students: { fullName: string; email: string }[];
};

const NAV: { label: string; icon: React.ReactNode }[] = [
  { label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { label: "Assigned Candidates", icon: <Users size={18} /> },
  { label: "Feedback", icon: <FileText size={18} /> },
];

export default function MentorDashboardPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [active, setActive] = useState("Dashboard");

  const handleLogout = async () => {
    try {
      await fetch("/api/pgp-mentor/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      });
    } catch {}

    localStorage.removeItem("mentorUser");
    window.location.href = "/mentor";
  };

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-darkBlue">
      <div className="flex min-h-screen">
        <aside
          className={`hidden min-w-0 shrink-0 mt-20 overflow-hidden bg-zinc-300 dark:bg-[#0b1230] lg:block ${
            collapsed ? "w-16" : "w-52"
          }`}
        >
          <SidebarContent collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} 
            onLogout={handleLogout} active={active} setActive={setActive}/>
        </aside>

        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setMobileMenuOpen(false)} />

            <aside className="relative h-full w-60 bg-[#0b2f5b] text-white shadow-2xl">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="absolute right-3 top-3 rounded-lg bg-white/10 p-1.5"
              >
                <X size={18} />
              </button>

              <SidebarContent
                collapsed={false}
                onLogout={handleLogout}
                active={active}
                setActive={(v) => {
                  setActive(v);
                  setMobileMenuOpen(false);
                }}
              />
            </aside>
          </div>
        )}

        <section className="min-w-0 flex-1 p-3 sm:p-4">
          <div className="mb-3 flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-lg bg-white dark:bg-white/10 p-2 text-blue-900 dark:text-white shadow-sm"
            >
              <Menu size={20} />
            </button>
          </div>

          <div className="mb-4">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Mentor Dashboard</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Your assigned programs and enrolled students.</p>
          </div>

          <MentorPrograms />

        </section>
      </div>
    </main>
  );
}

const STATUS_PILL: Record<string, string> = {
  Active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Completed: "bg-blue-50 text-blue-700 ring-blue-200",
  Draft: "bg-slate-100 text-slate-600 ring-slate-200",
  Paused: "bg-amber-50 text-amber-700 ring-amber-200",
};

function MentorPrograms() {
  const [programs, setPrograms] = useState<MentorProgram[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mentorName, setMentorName] = useState("");
  const [openStudents, setOpenStudents] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("mentorUser");
    if (!saved) {
      setLoading(false);
      return;
    }

    const mentor = JSON.parse(saved);
    setMentorName(mentor.fullName || "");

    const params = new URLSearchParams();
    if (mentor.id) params.set("mentorId", mentor.id);
    if (mentor.email) params.set("email", mentor.email);

    async function load() {
      try {
        const res = await fetch(`/api/pgp-mentor/programs?${params.toString()}`);
        const data = await res.json();
        setPrograms(data.programs || []);
        setTotalStudents(data.totalStudents || 0);
      } catch (error) {
        console.error("Mentor programs load error:", error);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl bg-white dark:bg-white/5 p-5 text-sm text-slate-500 shadow-sm">
        Loading your programs…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 mt-14">
        <StatTile
          icon={<GraduationCap size={18} />}
          label="Assigned Programs"
          value={programs.length}
          from="from-blue-500"
          to="to-blue-700"
        />
        <StatTile
          icon={<Users size={18} />}
          label="Total Students"
          value={totalStudents}
          from="from-emerald-500"
          to="to-emerald-700"
        />
        <StatTile
          icon={<CalendarDays size={18} />}
          label="Active Programs"
          value={programs.filter((p) => p.status === "Active").length}
          from="from-violet-500"
          to="to-violet-700"
        />
      </div>

      {/* Program cards */}
      {programs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-8 text-center">
          <GraduationCap size={26} className="mx-auto text-slate-300" />
          <p className="mt-2 text-sm font-bold text-slate-500">No program assigned yet</p>
          <p className="mt-1 text-xs text-slate-400">
            {mentorName ? `${mentorName}, once` : "Once"} management assigns you to a
            program, it will appear here with its enrolled students.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {programs.map((p) => {
            const pill =
              STATUS_PILL[p.status] || "bg-slate-100 text-slate-600 ring-slate-200";
            return (
              <Link
                key={p.programId}
                href={`/mentor/program/${p.programId}`}
                className="group block rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-4 shadow-sm transition hover:border-blue-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Program
                    </p>
                    <h3 className="truncate text-base font-black text-slate-900 dark:text-white">
                      {p.programName}
                    </h3>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ring-1 ring-inset ${pill}`}
                  >
                    {p.status}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setOpenStudents((v) =>
                      v === p.programId ? "" : p.programId
                    );
                  }}
                  className="mt-3 flex w-full items-center gap-3 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 px-3 py-2 text-left transition hover:bg-emerald-100 dark:hover:bg-emerald-500/20"
                >
                  <Users size={20} className="text-emerald-600 dark:text-emerald-300" />
                  <div className="flex-1">
                    <p className="text-2xl font-black leading-none text-emerald-700 dark:text-emerald-300">
                      {p.studentCount}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700/70 dark:text-emerald-300/70">
                      Students Assigned {p.studentCount > 0 && "· view list"}
                    </p>
                  </div>
                  {p.studentCount > 0 && (
                    <ChevronDown
                      size={16}
                      className={`text-emerald-600 dark:text-emerald-300 transition ${
                        openStudents === p.programId ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </button>

                {openStudents === p.programId && p.students.length > 0 && (
                  <ul className="mt-2 max-h-40 divide-y divide-slate-100 overflow-y-auto rounded-lg ring-1 ring-slate-200 dark:divide-white/5 dark:ring-white/10">
                    {p.students.map((s, i) => (
                      <li
                        key={s.email || i}
                        className="flex items-center gap-2 px-3 py-1.5"
                      >
                        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-slate-100 text-[9px] font-black text-slate-500 dark:bg-white/10">
                          {i + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-[11px] font-bold text-slate-900 dark:text-white">
                            {s.fullName || "—"}
                          </p>
                          <p className="truncate text-[10px] text-slate-400">
                            {s.email}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1" title="Weeks">
                    <CalendarDays size={12} />
                    {p.weeks} weeks
                  </span>
                  <span className="inline-flex items-center gap-1" title="Portfolio items">
                    <ListChecks size={12} />
                    {p.portfolioItems} portfolio
                  </span>
                  <span className="inline-flex items-center gap-1" title="Capstone items">
                    <Trophy size={12} />
                    {p.capstoneItems} capstone
                  </span>
                  <span className="ml-auto inline-flex items-center gap-1 font-bold text-blue-900 dark:text-sky-300">
                    View full program
                    <ArrowRight size={12} className="transition group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatTile({
  icon,
  label,
  value,
  from,
  to,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  from: string;
  to: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${from} ${to} p-3 text-white shadow-sm`}
    >
      <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-white/10" />
      <div className="relative">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-white/80">
          {icon}
          {label}
        </div>
        <p className="mt-1 text-2xl font-black leading-none">{value}</p>
      </div>
    </div>
  );
}

function SidebarContent({
  collapsed,
  onToggle,
  active,
  setActive,
  onLogout,
}: {
  collapsed: boolean;
  onToggle?: () => void;
  active: string;
  setActive: (v: string) => void;
  onLogout: () => void;
}) {
  return (
    <div className="flex h-full flex-col p-2">
      <div
        className={`mb-2 flex items-center ${
          collapsed ? "justify-center" : "justify-between"
        }`}
      >
        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="mt-3 rounded-lg p-2 text-zinc-500 transition hover:bg-white/10"
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map((item) => (
          <MenuItem
            key={item.label}
            icon={item.icon}
            label={item.label}
            collapsed={collapsed}
            active={active === item.label}
            onClick={() => setActive(item.label)}
          />
        ))}

        <button
          type="button"
          onClick={onLogout}
          title="Logout"
          className={`-mt-2 flex items-center gap-3 py-2 text-sm font-bold text-zinc-500 hover:text-white ${
            collapsed ? "justify-center px-0" : "px-3"
          }`}
        >
          <LogOut size={18} />
          {!collapsed && "Logout"}
        </button>
      </nav>
    </div>
  );
}

function MenuItem({
  icon,
  label,
  active = false,
  collapsed,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  collapsed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={`flex items-center gap-3 rounded-lg py-2.5 text-sm font-bold transition ${
        collapsed ? "justify-center px-0" : "px-3"
      } ${active ? "bg-zinc-400 dark:bg-blue-900 text-white" : "text-blue-900 dark:text-slate-200 hover:bg-white/10"}`}
    >
      {icon}
      {!collapsed && label}
    </button>
  );
}
