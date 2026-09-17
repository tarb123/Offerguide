"use client";

import React, { useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  CheckCircle2,
  Clock,
  FileText,
  Flag,
  GraduationCap,
  Layers,
  Link2,
  ListChecks,
  Mail,
  MessageSquare,
  Percent,
  Repeat,
  Sparkles,
  Target,
  Timer,
  Trophy,
  UserCog,
  Zap,
} from "lucide-react";
import {
  compareWeeks,
  totalScheduledHours,
  totalWeightage,
  type Program,
  type SessionFlow,
} from "@/app/pgp-admin/component/pgpProgram";
import type { ViewTab } from "@/app/pgp-admin/component/ProgramView";

/* ------------------------------- helpers -------------------------------- */

const DOT: Record<string, string> = {
  Completed: "bg-emerald-500",
  "In Progress": "bg-sky-500",
  Deferred: "bg-amber-500",
  Delayed: "bg-rose-500",
};
const dotClass = (s?: string) => DOT[(s || "").trim()] || "bg-slate-300";
const weekNum = (w?: string) => (/\d+/.exec(w || "") || ["•"])[0];
const isDone = (s?: string) => (s || "").trim() === "Completed";
const splitFocus = (f?: string) =>
  (f || "")
    .split(/[;•]/)
    .map((x) => x.trim())
    .filter(Boolean);

function pct(done: number, total: number) {
  return total ? Math.round((done / total) * 100) : 0;
}

/* ------------------------------ primitives ------------------------------ */

function StatTile({
  icon,
  value,
  label,
  from,
  to,
}: {
  icon: React.ReactNode;
  value: React.ReactNode;
  label: string;
  from: string;
  to: string;
}) {
  return (
    <div
      title={label}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${from} ${to} p-3 text-white shadow-md`}
    >
      <div className="absolute -right-3 -top-3 h-12 w-12 rounded-full bg-white/10" />
      <div className="relative">
        <span className="opacity-90">{icon}</span>
        <p className="mt-1 text-2xl font-black leading-none">{value}</p>
        <p className="mt-0.5 text-[9px] font-bold uppercase tracking-wide text-white/80">
          {label}
        </p>
      </div>
    </div>
  );
}

function Bar({ value, tone = "blue" }: { value: number; tone?: "blue" | "emerald" }) {
  const grad =
    tone === "emerald"
      ? "from-emerald-400 to-teal-500"
      : "from-[#0b2f5b] to-cyan-400";
  return (
    <span className="block h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
      <span
        className={`block h-full rounded-full bg-gradient-to-r ${grad} transition-all`}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </span>
  );
}

function ProgressCard({
  icon,
  label,
  done,
  total,
  tone = "blue",
}: {
  icon: React.ReactNode;
  label: string;
  done: number;
  total: number;
  tone?: "blue" | "emerald";
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-white/5">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wide text-slate-500 dark:text-slate-300">
          <span className="text-blue-900 dark:text-sky-300">{icon}</span>
          {label}
        </span>
        <span className="text-xs font-black tabular-nums text-slate-900 dark:text-white">
          {done}
          <span className="text-slate-300">/{total}</span>
        </span>
      </div>
      <div className="mt-2">
        <Bar value={pct(done, total)} tone={tone} />
      </div>
    </div>
  );
}

function Fact({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value?: React.ReactNode;
  label: string;
}) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div
      title={label}
      className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 dark:bg-white/5"
    >
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white text-blue-900 shadow-sm dark:bg-white/10 dark:text-sky-300">
        {icon}
      </span>
      <p className="min-w-0 truncate text-xs font-bold text-slate-800 dark:text-white">
        {value}
      </p>
    </div>
  );
}

function Callout({
  icon,
  label,
  text,
  accent = false,
}: {
  icon: React.ReactNode;
  label: string;
  text?: string;
  accent?: boolean;
}) {
  if (!text) return null;
  return (
    <div
      className={`rounded-2xl border p-3 ${
        accent
          ? "border-transparent bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-sky-500/10 dark:to-cyan-500/10"
          : "border-slate-200 bg-white dark:border-white/10 dark:bg-white/5"
      }`}
    >
      <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
        <span className="text-blue-900 dark:text-sky-300">{icon}</span>
        {label}
      </span>
      <p className="mt-1 text-xs leading-relaxed text-slate-700 dark:text-slate-200">
        {text}
      </p>
    </div>
  );
}

function Line({ icon, text }: { icon: React.ReactNode; text?: string }) {
  if (!text) return null;
  return (
    <p className="flex gap-2 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
      <span className="mt-0.5 shrink-0 text-slate-400">{icon}</span>
      {text}
    </p>
  );
}

function ExpandRow({
  badge,
  title,
  right,
  children,
}: {
  badge: React.ReactNode;
  title: string;
  right?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const has = Boolean(children);
  return (
    <li className="rounded-xl border border-slate-100 bg-white dark:border-white/10 dark:bg-white/5">
      <button
        type="button"
        onClick={() => has && setOpen((v) => !v)}
        aria-expanded={open}
        className={`flex w-full items-center gap-2.5 p-2.5 text-left transition ${
          has ? "hover:bg-slate-50 dark:hover:bg-white/5" : "cursor-default"
        }`}
      >
        {badge}
        <span className="min-w-0 flex-1 truncate text-xs font-bold text-slate-800 dark:text-white">
          {title}
        </span>
        {right}
        {has && (
          <ChevronDown
            size={13}
            className={`shrink-0 text-slate-300 transition ${open ? "rotate-180" : ""}`}
          />
        )}
      </button>
      {open && has && (
        <div className="space-y-1.5 border-t border-slate-100 px-2.5 pb-2.5 pt-2 dark:border-white/10">
          {children}
        </div>
      )}
    </li>
  );
}

function DueChip({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-slate-50 px-1.5 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-white/5 dark:text-slate-300">
      <CalendarDays size={10} />
      {text}
    </span>
  );
}

function GradBadge({
  children,
  tone = "blue",
}: {
  children: React.ReactNode;
  tone?: "blue" | "amber" | "emerald";
}) {
  const g =
    tone === "amber"
      ? "from-amber-400 to-orange-500"
      : tone === "emerald"
      ? "from-emerald-400 to-teal-500"
      : "from-[#0b2f5b] to-[#1746b5]";
  return (
    <span
      className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${g} text-[11px] font-black text-white shadow`}
    >
      {children}
    </span>
  );
}

function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center dark:border-white/10 dark:bg-white/5">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-white/10">
        {icon}
      </span>
      <p className="mt-2 text-xs font-black text-slate-400">{text}</p>
    </div>
  );
}

const Shell = ({ children }: { children: React.ReactNode }) => (
  <div className="space-y-3 p-3 sm:p-4">{children}</div>
);

/* ------------------------------- Summary -------------------------------- */

function SummarySection({ p }: { p: Program }) {
  const w = p.weeklySchedule || [];
  const c = p.capstoneTimeline || [];
  const pf = p.portfolioChecklist || [];
  const ev = p.evaluationPlan || [];
  const hours = totalScheduledHours(w);
  const weight = Math.round(totalWeightage(ev) * 100) / 100;

  return (
    <Shell>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        <StatTile icon={<CalendarDays size={16} />} value={w.length} label="Weeks" from="from-blue-500" to="to-indigo-600" />
        <StatTile icon={<Clock size={16} />} value={hours || p.totalHours || "—"} label="Hours" from="from-sky-500" to="to-cyan-600" />
        <StatTile icon={<ListChecks size={16} />} value={pf.length} label="Portfolio" from="from-emerald-500" to="to-teal-600" />
        <StatTile icon={<Trophy size={16} />} value={c.length} label="Capstone" from="from-amber-500" to="to-orange-600" />
        <StatTile icon={<Target size={16} />} value={ev.length} label="Assess." from="from-violet-500" to="to-fuchsia-600" />
        <StatTile icon={<Percent size={16} />} value={`${weight}`} label="Weight" from="from-rose-500" to="to-pink-600" />
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <ProgressCard icon={<CalendarDays size={13} />} label="Weekly" done={w.filter((r) => isDone(r.status)).length} total={w.length} />
        <ProgressCard icon={<Trophy size={13} />} label="Capstone" done={c.filter((r) => isDone(r.status)).length} total={c.length} tone="emerald" />
        <ProgressCard icon={<ListChecks size={13} />} label="Portfolio" done={pf.filter((r) => isDone(r.status)).length} total={pf.length} tone="emerald" />
      </div>
    </Shell>
  );
}

/* ------------------------------ Overview ------------------------------- */

function OverviewSection({ p }: { p: Program }) {
  const dates = [p.startDate, p.endDate].filter(Boolean).join("  →  ");
  return (
    <Shell>
      {(p.assignedMentorName || p.assignedMentorEmail) && (
        <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-[#0b2f5b] to-[#1746b5] p-3 text-white shadow-md">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/15">
            <UserCog size={20} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-black">
              {p.assignedMentorName || "Mentor"}
            </p>
            {p.assignedMentorEmail && (
              <p className="mt-0.5 inline-flex items-center gap-1 truncate text-[11px] text-blue-100">
                <Mail size={11} />
                {p.assignedMentorEmail}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Fact icon={<CalendarDays size={14} />} value={p.recommendedDuration || (p.weeklySchedule?.length ? `${p.weeklySchedule.length} weeks` : "")} label="Duration" />
        <Fact icon={<Repeat size={14} />} value={p.frequency} label="Frequency" />
        <Fact icon={<Timer size={14} />} value={p.sessionDuration} label="Per session" />
        <Fact icon={<Clock size={14} />} value={p.totalHours ? `${p.totalHours} h` : ""} label="Total hours" />
        <Fact icon={<GraduationCap size={14} />} value={p.trainingStyle} label="Training style" />
        <Fact icon={<Layers size={14} />} value={p.category} label="Category" />
        <Fact icon={<CalendarDays size={14} />} value={dates} label="Dates" />
      </div>

      <Callout icon={<Sparkles size={12} />} label="Programme promise" text={p.programPromise} accent />
      <Callout icon={<Flag size={12} />} label="Final output" text={p.finalOutput} />
    </Shell>
  );
}

/* ------------------------------ Schedule ------------------------------- */

function ScheduleSection({ p }: { p: Program }) {
  const rows = p.weeklySchedule || [];
  if (!rows.length)
    return (
      <Shell>
        <EmptyState icon={<CalendarDays size={22} />} text="No sessions yet" />
      </Shell>
    );

  return (
    <Shell>
      <ul className="space-y-1.5">
        {rows.map((r, i) => (
          <ExpandRow
            key={i}
            badge={<GradBadge>{weekNum(r.week)}</GradBadge>}
            title={r.sessionTitle || r.module || `Session ${i + 1}`}
            right={
              <span className="flex shrink-0 items-center gap-1.5">
                {r.duration ? (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-slate-400">
                    <Clock size={10} />
                    {r.duration}h
                  </span>
                ) : null}
                <span className={`h-2 w-2 rounded-full ${dotClass(r.status)}`} title={r.status || "Not started"} />
              </span>
            }
          >
            {(r.focus || r.activity || r.output || r.notes) && (
              <>
                {splitFocus(r.focus).length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {splitFocus(r.focus).map((chip, k) => (
                      <span
                        key={k}
                        className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                )}
                <Line icon={<Zap size={11} />} text={r.activity} />
                <Line icon={<Flag size={11} />} text={r.output} />
                <Line icon={<MessageSquare size={11} />} text={r.notes} />
              </>
            )}
          </ExpandRow>
        ))}
      </ul>
    </Shell>
  );
}

/* -------------------------------- Flow -------------------------------- */

function FlowSection({ p }: { p: Program }) {
  const rows = p.sessionFlow || [];
  if (!rows.length)
    return (
      <Shell>
        <EmptyState icon={<Layers size={22} />} text="No session flow yet" />
      </Shell>
    );

  const grouped = rows.reduce<Record<string, SessionFlow[]>>((acc, row) => {
    const key = row.week || "Unscheduled";
    (acc[key] = acc[key] || []).push(row);
    return acc;
  }, {});
  const weeks = Object.keys(grouped).sort(compareWeeks);

  return (
    <Shell>
      {weeks.map((week) => (
        <div
          key={week}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5"
        >
          <div className="flex items-center justify-between bg-slate-50 px-3 py-2 dark:bg-white/5">
            <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wide text-slate-600 dark:text-slate-200">
              <GradBadge>{weekNum(week)}</GradBadge>
              {week}
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              {grouped[week].length}
            </span>
          </div>
          <ol className="relative space-y-2.5 px-3 py-3">
            <span className="absolute bottom-4 left-[19px] top-4 w-px bg-slate-200 dark:bg-white/10" />
            {grouped[week].map((row, i) => (
              <li key={i} className="relative flex gap-3">
                <span className="relative z-10 mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-white ring-2 ring-blue-900 dark:bg-[#0b1230]">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-900" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {row.activity || "Activity"}
                    </p>
                    {row.deliveryMode && (
                      <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-slate-500 dark:bg-white/10 dark:text-slate-300">
                        {row.deliveryMode}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-slate-400">
                    {row.resourceTemplate && (
                      <span className="inline-flex items-center gap-1">
                        <FileText size={10} />
                        {row.resourceTemplate}
                      </span>
                    )}
                    {row.portfolioLink && (
                      <span className="inline-flex items-center gap-1 font-semibold text-blue-700 dark:text-sky-300">
                        <Link2 size={10} />
                        {row.portfolioLink}
                      </span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </Shell>
  );
}

/* ------------------------------ Capstone ------------------------------ */

function CapstoneSection({ p }: { p: Program }) {
  const rows = p.capstoneTimeline || [];
  if (!rows.length)
    return (
      <Shell>
        <EmptyState icon={<Trophy size={22} />} text="No capstone components yet" />
      </Shell>
    );

  return (
    <Shell>
      <ul className="space-y-1.5">
        {rows.map((r, i) => (
          <ExpandRow
            key={i}
            badge={
              <GradBadge tone="amber">
                <Trophy size={13} />
              </GradBadge>
            }
            title={r.component || `Component ${i + 1}`}
            right={
              <span className="flex shrink-0 items-center gap-1.5">
                <DueChip text={r.due} />
                <span className={`h-2 w-2 rounded-full ${dotClass(r.status)}`} title={r.status || "Not started"} />
              </span>
            }
          >
            {(r.deliverable || r.notes) && (
              <>
                <Line icon={<FileText size={11} />} text={r.deliverable} />
                <Line icon={<MessageSquare size={11} />} text={r.notes} />
              </>
            )}
          </ExpandRow>
        ))}
      </ul>
    </Shell>
  );
}

/* ------------------------------ Portfolio ----------------------------- */

function PortfolioSection({ p }: { p: Program }) {
  const rows = p.portfolioChecklist || [];
  if (!rows.length)
    return (
      <Shell>
        <EmptyState icon={<ListChecks size={22} />} text="No portfolio items yet" />
      </Shell>
    );

  const done = rows.filter((r) => isDone(r.status)).length;

  return (
    <Shell>
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-white/5">
        <div className="mb-2 flex items-center justify-between text-xs font-black text-slate-900 dark:text-white">
          <span className="flex items-center gap-1.5">
            <ListChecks size={14} className="text-blue-900 dark:text-sky-300" />
            {done}/{rows.length} complete
          </span>
          <span className="tabular-nums text-emerald-600">{pct(done, rows.length)}%</span>
        </div>
        <Bar value={pct(done, rows.length)} tone="emerald" />
      </div>

      <ul className="space-y-1.5">
        {rows.map((r, i) => (
          <ExpandRow
            key={i}
            badge={
              isDone(r.status) ? (
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
                  <CheckCircle2 size={14} />
                </span>
              ) : (
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-slate-100 text-[11px] font-black text-slate-400 dark:bg-white/10">
                  {i + 1}
                </span>
              )
            }
            title={r.item || `Item ${i + 1}`}
            right={
              <span className="flex shrink-0 items-center gap-1.5">
                {r.relatedWeek && (
                  <span className="rounded-lg bg-slate-50 px-1.5 py-0.5 text-[9px] font-bold text-slate-400 dark:bg-white/5">
                    {r.relatedWeek}
                  </span>
                )}
                {r.evidenceLink && (
                  <Link2 size={12} className="text-blue-700 dark:text-sky-300" />
                )}
              </span>
            }
          >
            {(r.purpose || r.evidenceLink || r.facilitatorRemarks) && (
              <>
                <Line icon={<Target size={11} />} text={r.purpose} />
                <Line icon={<Link2 size={11} />} text={r.evidenceLink} />
                <Line icon={<MessageSquare size={11} />} text={r.facilitatorRemarks} />
              </>
            )}
          </ExpandRow>
        ))}
      </ul>
    </Shell>
  );
}

/* ----------------------------- Evaluation ---------------------------- */

function EvaluationSection({ p }: { p: Program }) {
  const rows = p.evaluationPlan || [];
  if (!rows.length)
    return (
      <Shell>
        <EmptyState icon={<Target size={22} />} text="No assessment areas yet" />
      </Shell>
    );

  const total = Math.round(totalWeightage(rows) * 100) / 100;
  const balanced = total === 100;
  const max = Math.max(...rows.map((r) => Number(r.weightage) || 0), 1);

  return (
    <Shell>
      <ul className="space-y-1.5">
        {rows.map((r, i) => {
          const weight = Number(r.weightage) || 0;
          return (
            <ExpandRow
              key={i}
              badge={
                <span className="grid h-7 w-11 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#0b2f5b] to-[#1746b5] text-[11px] font-black text-white shadow">
                  {weight}%
                </span>
              }
              title={r.area || `Area ${i + 1}`}
              right={
                <span className="hidden h-1.5 w-20 shrink-0 overflow-hidden rounded-full bg-slate-100 sm:block dark:bg-white/10">
                  <span
                    className="block h-full rounded-full bg-gradient-to-r from-[#0b2f5b] to-cyan-400"
                    style={{ width: `${(weight / max) * 100}%` }}
                  />
                </span>
              }
            >
              {(r.evidenceRequired || r.evaluatorNotes) && (
                <>
                  <Line icon={<FileText size={11} />} text={r.evidenceRequired} />
                  <Line icon={<MessageSquare size={11} />} text={r.evaluatorNotes} />
                </>
              )}
            </ExpandRow>
          );
        })}
      </ul>

      <div
        className={`flex items-center justify-between rounded-2xl px-4 py-3 ${
          balanced
            ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
            : "bg-gradient-to-r from-rose-500 to-pink-500 text-white"
        }`}
      >
        <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider">
          <Percent size={13} />
          Total weight
        </span>
        <span className="text-lg font-black leading-none tabular-nums">{total}%</span>
      </div>
    </Shell>
  );
}

/* ------------------------------- Router ------------------------------- */

export default function CandidateProgramView({
  program,
  tab,
}: {
  program: Program;
  tab: ViewTab;
}) {
  switch (tab) {
    case "overview":
      return <OverviewSection p={program} />;
    case "schedule":
      return <ScheduleSection p={program} />;
    case "flow":
      return <FlowSection p={program} />;
    case "capstone":
      return <CapstoneSection p={program} />;
    case "portfolio":
      return <PortfolioSection p={program} />;
    case "evaluation":
      return <EvaluationSection p={program} />;
    default:
      return <SummarySection p={program} />;
  }
}
