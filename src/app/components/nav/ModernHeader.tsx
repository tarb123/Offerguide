"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  Calculator,
  ChevronDown,
  FileText,
  GraduationCap,
  Layers3,
  LogIn,
  Sparkles,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const mainLinks = [
  { label: "Khudi Assessment", href: "/khudiassessment", icon: Sparkles },
  { label: "PGP", href: "/pgp-access", icon: GraduationCap },
  { label: "Offer Guide", href: "/offerguide", icon: FileText },
  { label: "Blogs", href: "/Blogs/", icon: BookOpen },
];

const serviceLinks = [
  { label: "Khudi Assessment", href: "/khudiassessment", icon: Sparkles },
  { label: "3D CVs", href: "/cv", icon: Layers3 },
  { label: "Offer Calculator", href: "/FinancialOffer", icon: Calculator },
  { label: "Professional Growth Program", href: "/pgp-access", icon: GraduationCap },
];

export default function ModernHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-[#0b163f]/10 bg-white/90 shadow-[0_8px_35px_rgba(11,22,63,0.06)] backdrop-blur-xl dark:border-white/10 dark:bg-[#070d2b]/90">
        <div className="mx-auto flex h-20 max-w-[1400px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <div className="flex min-w-0 items-center gap-4 lg:gap-6">
            <Link href="/" aria-label="Sanjeeda home" className="shrink-0">
              <span className="text-xl font-black tracking-[-0.04em] text-[#1559bd] sm:hidden">
                Sanjeed<span className="text-[#ef3340]">a!</span>
              </span>
              <Image
                src="/sanjeeda logo1.png"
                alt="Sanjeeda"
                width={600}
                height={180}
                priority
                className="hidden h-auto w-[138px] sm:block sm:w-[158px]"
              />
            </Link>

            <span className="hidden h-8 w-px bg-[#0b163f]/10 dark:bg-white/10 sm:block" />

            <a
              href="https://conductivity.com.pk"
              target="_blank"
              rel="noreferrer"
              aria-label="A Conductivity initiative"
              className="hidden items-center gap-2 sm:flex"
            >
              <span className="hidden text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400 xl:block">
                Powered by
              </span>
              <Image
                src="/conductivitylogo.png"
                alt="Conductivity"
                width={1000}
                height={220}
                className="h-auto w-[104px] lg:w-[118px]"
              />
            </a>
          </div>

          <nav aria-label="Primary navigation" className="hidden items-center gap-1 lg:flex">
            <div className="relative">
              <button
                type="button"
                onClick={() => setServicesOpen((open) => !open)}
                aria-expanded={servicesOpen}
                className="inline-flex h-11 items-center gap-1.5 rounded-full px-4 text-sm font-bold text-[#0b163f] transition hover:bg-[#f2eee8] dark:text-white dark:hover:bg-white/10"
              >
                Services
                <ChevronDown
                  size={15}
                  className={`transition ${servicesOpen ? "rotate-180" : ""}`}
                />
              </button>

              {servicesOpen && (
                <div className="absolute left-0 top-[calc(100%+12px)] w-72 overflow-hidden rounded-2xl border border-[#0b163f]/10 bg-white p-2 shadow-[0_24px_60px_rgba(11,22,63,0.16)] dark:border-white/10 dark:bg-[#101a3f]">
                  {serviceLinks.map(({ label, href, icon: Icon }) => (
                    <Link
                      key={label}
                      href={href}
                      onClick={() => setServicesOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-[#0b163f] transition hover:bg-[#f4f0ea] dark:text-white dark:hover:bg-white/10"
                    >
                      <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#e9efff] text-[#1746b5] dark:bg-white/10 dark:text-[#8eb4ff]">
                        <Icon size={17} />
                      </span>
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {mainLinks.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="inline-flex h-11 items-center rounded-full px-4 text-sm font-bold text-[#0b163f] transition hover:bg-[#f2eee8] dark:text-white dark:hover:bg-white/10"
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
            <Link
              href="/auth"
              className="hidden h-11 items-center gap-2 rounded-full bg-[#0b163f] px-5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#1746b5] dark:bg-white dark:text-[#0b163f] dark:hover:bg-[#dfe8ff] sm:inline-flex"
            >
              <LogIn size={16} />
              Log in
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open navigation"
              className="grid h-11 w-11 place-items-center rounded-full border border-[#0b163f]/10 text-[#0b163f] transition hover:bg-[#f2eee8] dark:border-white/10 dark:text-white dark:hover:bg-white/10 lg:hidden"
            >
              <span className="text-2xl font-black leading-none" aria-hidden="true">☰</span>
            </button>
          </div>
        </div>
      </header>

      <div className="h-20" aria-hidden="true" />

      <button
        type="button"
        aria-label="Close navigation overlay"
        onClick={() => setMenuOpen(false)}
        className={`fixed inset-0 z-[60] bg-[#050b20]/55 backdrop-blur-sm transition lg:hidden ${
          menuOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
      />

      <aside
        aria-label="Mobile navigation"
        className={`fixed right-0 top-0 z-[70] flex h-full w-[min(90vw,380px)] flex-col bg-[#fbf7f1] p-5 shadow-2xl transition duration-300 dark:bg-[#0b163f] lg:hidden ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-[#0b163f]/10 pb-5 dark:border-white/10">
          <span className="text-2xl font-black tracking-[-0.04em] text-[#1559bd]">
            Sanjeed<span className="text-[#ef3340]">a!</span>
          </span>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label="Close navigation"
            className="grid h-10 w-10 place-items-center rounded-full bg-[#ece7df] text-[#0b163f] dark:bg-white/10 dark:text-white"
          >
            <span className="text-2xl font-medium leading-none" aria-hidden="true">×</span>
          </button>
        </div>

        <nav className="mt-5 flex flex-col gap-1 overflow-y-auto" aria-label="Mobile primary navigation">
          <p className="px-3 pb-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Explore
          </p>
          {mainLinks.map(({ label, href, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 rounded-2xl px-3 py-3.5 text-sm font-black text-[#0b163f] transition hover:bg-white dark:text-white dark:hover:bg-white/10"
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#e8efff] text-[#1746b5] dark:bg-white/10 dark:text-[#8eb4ff]">
                <Icon size={17} />
              </span>
              {label}
            </Link>
          ))}

          <p className="mt-5 px-3 pb-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Services
          </p>
          {serviceLinks.map(({ label, href, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 rounded-2xl px-3 py-3.5 text-sm font-black text-[#0b163f] transition hover:bg-white dark:text-white dark:hover:bg-white/10"
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#fff0e8] text-[#e83444] dark:bg-white/10 dark:text-[#ff707a]">
                <Icon size={17} />
              </span>
              {label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto space-y-4 border-t border-[#0b163f]/10 pt-5 dark:border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-white/50">Appearance</span>
            <ThemeToggle />
          </div>
          <Link
            href="/auth"
            onClick={() => setMenuOpen(false)}
            className="flex h-12 items-center justify-center gap-2 rounded-full bg-[#e83444] text-sm font-black text-white"
          >
            <LogIn size={17} />
            Log in
          </Link>
          <div className="flex items-center justify-center gap-2 pt-1">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Powered by</span>
            <Image
              src="/conductivitylogo.png"
              alt="Conductivity"
              width={1000}
              height={220}
              className="h-auto w-24"
            />
          </div>
        </div>
      </aside>
    </>
  );
}
