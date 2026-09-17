"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTabParam } from "@/lib/portal/useTabParam";
import { useAuth } from "@/lib/portal/AuthProvider";
import {
  LayoutDashboard,
  ShieldCheck,
  Users,
  GraduationCap,
  UserCog,
  LogOut,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Activity,
  CalendarCheck,
  ClipboardList,
} from "lucide-react";
import CandidatesData from "./component/CandidatesData";
import MentorsData from "./component/MentorsData";
import ProgramsData from "./component/ProgramsData";
import DashboardOverview from "./component/DashboardOverview";
import MonitoringData from "./component/MonitoringData";
import AttendanceData from "./component/AttendanceData";
import EnrollmentsData from "./component/EnrollmentsData";

type Page =
  | "dashboard"
  | "candidates"
  | "applications"
  | "programs"
  | "mentors"
  | "enrollments"
  | "monitoring"
  | "attendance";

const NAV: { key: Page; label: string; icon: React.ReactNode }[] = [
  { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { key: "mentors", label: "Mentors", icon: <UserCog size={18} /> },
  { key: "candidates", label: "Candidates", icon: <Users size={18} /> },
  { key: "programs", label: "Programs", icon: <GraduationCap size={18} /> },
  { key: "enrollments", label: "Enrollments", icon: <ClipboardList size={18} /> },
  { key: "attendance", label: "Attendance", icon: <CalendarCheck size={18} /> },
  { key: "monitoring", label: "Monitoring", icon: <Activity size={18} /> },
];
const NAV_KEYS = NAV.map((n) => n.key);

/**
 * The PGP admin dashboard (formerly the Management Portal dashboard).
 *
 * Identity is the PORTAL account, not a separate management login: the layout
 * above has already confirmed `portal.admin.access` server-side, and logout
 * here ends the portal session — the same one the header's sign-out ends.
 * The page keeps its in-page tabs (`?tab=`) so deep links from the attendance
 * and enrollment sub-pages keep working.
 */
export default function PgpAdminDashboardPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [activePage, setActivePage, tabReady] = useTabParam<Page>(
    "managementTab",
    NAV_KEYS,
    "dashboard"
  );
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace("/pgp-access");
  };

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-darkBlue">
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
            activePage={activePage}
            setActivePage={setActivePage}
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
                activePage={activePage}
                setActivePage={(page) => {
                  setActivePage(page);
                  setMobileMenuOpen(false);
                }}
              />
            </aside>
          </div>
        )}

        <section className="min-w-0 flex-1 p-3 sm:p-4">
          <div className="mb-3 flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-lg bg-white dark:bg-white/10 p-2 text-blue-900 dark:text-white shadow-sm lg:hidden"
            >
              <Menu size={20} />
            </button>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#0b163f] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white dark:bg-white dark:text-[#0b163f]">
              <ShieldCheck size={11} />
              Admin
            </span>
            <h1 className="truncate text-sm font-black text-[#0b163f] dark:text-white sm:text-base">
              PGP {NAV.find((n) => n.key === activePage)?.label ?? "Admin"}
            </h1>
          </div>
          {!tabReady ? (
            <div className="grid place-items-center p-16 text-slate-300 dark:text-slate-600">
              <Activity size={22} className="animate-pulse" />
            </div>
          ) : (
            <>
              {activePage === "dashboard" && <DashboardOverview />}
              {activePage === "candidates" && <CandidatesData />}
              {activePage === "mentors" && <MentorsData />}
              {activePage === "programs" && <ProgramsData />}
              {activePage === "enrollments" && <EnrollmentsData />}
              {activePage === "attendance" && <AttendanceData />}
              {activePage === "monitoring" && <MonitoringData />}
            </>
          )}
        </section>
      </div>
    </main>
  );
}

function SidebarContent({
  collapsed,
  onToggle,
  activePage,
  setActivePage,
  onLogout,
}: {
  collapsed: boolean;
  onToggle?: () => void;
  activePage: Page;
  setActivePage: (page: Page) => void;
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
          <button type="button" onClick={onToggle} title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="mt-1 rounded-lg p-2 text-[#0b163f] transition hover:bg-white dark:text-white dark:hover:bg-white/10"
          >
            {collapsed ? (
              <PanelLeftOpen size={18} />
            ) : (
              <PanelLeftClose size={18} />
            )}
          </button>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map((item) => (
          <MenuItem
            key={item.key}
            icon={item.icon}
            label={item.label}
            collapsed={collapsed}
            active={activePage === item.key}
            onClick={() => setActivePage(item.key)}
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
      } ${active ? "bg-white text-[#1746b5] shadow-sm dark:bg-white/10 dark:text-white" : "text-[#0b163f] hover:bg-white dark:text-white dark:hover:bg-white/10"}`}
    >
      {icon}
      {!collapsed && label}
    </button>
  );
}
