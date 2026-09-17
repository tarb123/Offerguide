"use client";

import CandidateApplicationForm from "@/app/candidate/component/CandidateApplicationForm";
import CandidateAttendance from "@/app/candidate/component/CandidateAttendance";
import CandidatePrograms from "@/app/candidate/component/CandidatePrograms";
import CandidateProfile from "@/app/candidate/component/CandidateProfile";
import CandidateAvatar from "@/components/portal/CandidateAvatar";
import {
  FileText,
  User,
  LogOut,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  CalendarCheck,
  GraduationCap,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTabParam } from "@/lib/portal/useTabParam";

const NAV: { label: string; icon: React.ReactNode }[] = [
  { label: "Application Form", icon: <FileText size={18} /> },
  { label: "Programs", icon: <GraduationCap size={18} /> },
  { label: "Attendance", icon: <CalendarCheck size={18} /> },
  { label: "Profile", icon: <User size={18} /> },
];

const SUBTITLE: Record<string, string> = {
  Programs: "Browse programs offered by management and join one.",
  Profile: "Your photo and account details.",
};

const NAV_LABELS = NAV.map((n) => n.label);

export default function CandidateDashboardPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [active, selectTab, tabReady] = useTabParam(
    "candidateTab",
    NAV_LABELS,
    "Application Form"
  );
  const [me, setMe] = useState<{ fullName?: string; email?: string }>({});

  useEffect(() => {
    const saved = localStorage.getItem("candidateUser");
    if (saved) setMe(JSON.parse(saved));
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/pgp-candidate/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      });
    } catch (err) {
      console.error(err);
    }

    localStorage.removeItem("candidateUser");
    window.location.href = "/pgp-access?role=candidate";
  };

  return (
    <main className="min-h-screen bg-whute dark:bg-slate-800">
      <div className="flex min-h-screen">
        <aside
          className={`sticky top-20 hidden h-[calc(100vh-5rem)] shrink-0 self-start overflow-y-auto border-r border-[#0b163f]/10 bg-[#fbf7f1] shadow-[0_8px_35px_rgba(11,22,63,0.06)] dark:border-white/10 dark:bg-[#003f81] lg:block ${
            collapsed ? "w-16" : "w-52"
          }`}
        >
          <SidebarContent
            collapsed={collapsed}
            onToggle={() => setCollapsed((v) => !v)}
            onLogout={handleLogout}
            active={active}
            setActive={selectTab}
          />
        </aside>

        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setMobileMenuOpen(false)}
            />

            <aside className="relative h-full w-60 bg-[#fbf7f1] shadow-2xl dark:bg-[#003f81]">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="absolute right-3 top-3 rounded-lg bg-[#0b163f]/5 p-1.5 text-[#0b163f] dark:bg-white/10 dark:text-white"
              >
                <X size={18} />
              </button>

              <SidebarContent
                collapsed={false}
                onLogout={handleLogout}
                active={active}
                setActive={(v) => {
                  selectTab(v);
                  setMobileMenuOpen(false);
                }}
              />
            </aside>
          </div>
        )}

        <section className="min-w-0 flex-1 p-3 sm:p-4">
          <div className="mb-1 flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="rounded-lg bg-white p-2 text-blue-900 shadow-sm dark:bg-white/10 dark:text-white lg:hidden"
              >
                <Menu size={20} />
              </button>
              {SUBTITLE[active] && (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {SUBTITLE[active]}
                </p>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-2 rounded-full bg-white px-2 py-1 shadow-sm dark:bg-white/10">
              <CandidateAvatar email={me.email} name={me.fullName} size={26} />
              <span className="max-w-[140px] truncate text-xs font-bold text-slate-700 dark:text-slate-200">
                {me.fullName || "Candidate"}
              </span>
            </div>
          </div>

          {!tabReady ? (
            <div className="grid place-items-center p-16 text-slate-300 dark:text-slate-600">
              <Loader2 size={22} className="animate-spin" />
            </div>
          ) : active === "Attendance" ? (
            <CandidateAttendance />
          ) : active === "Programs" ? (
            <CandidatePrograms />
          ) : active === "Profile" ? (
            <CandidateProfile />
          ) : (
            <CandidateApplicationForm />
          )}
        </section>
      </div>
    </main>
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
    <div className="flex h-full flex-col p-3">
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
            className="mt-1 rounded-lg p-2 text-[#0b163f] transition hover:bg-white dark:text-white dark:hover:bg-white/10"
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
          className={`mt-1 flex items-center gap-3 rounded-2xl py-3 text-sm font-black text-[#0b163f] transition hover:bg-white dark:text-white dark:hover:bg-white/10 ${
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
      className={`flex items-center gap-3 rounded-2xl py-3 text-sm font-black transition ${
        collapsed ? "justify-center px-0" : "px-3"
      } ${
        active
          ? "bg-white text-[#1746b5] shadow-sm dark:bg-white/10 dark:text-white"
          : "text-[#0b163f] hover:bg-white dark:text-white dark:hover:bg-white/10"
      }`}
    >
      {icon}
      {!collapsed && label}
    </button>
  );
}
