import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Construction } from "lucide-react";
import { ADMIN_BASE, ADMIN_RESOURCES, API_DOCS_LINK } from "../_lib/adminNav";

/**
 * Honest placeholder for the resource screens Epics 10.2–10.5 deliver.
 *
 * Exists so the shell built in Epic 10.1 is navigable end to end today rather
 * than a sidebar of dead links. Each later epic adds a real static route —
 * `questions/page.tsx`, `scoring/page.tsx`, and so on — which Next resolves in
 * preference to this dynamic segment, so this file needs no editing as screens
 * land. Delete it once all six exist.
 *
 * Anything that is not one of the six declared resources is a genuine 404, not
 * a placeholder — the shell must not imply screens the plan never promised.
 */

const DELIVERED_BY: Record<string, string> = {
  questions: "Epic 10.3",
  scoring: "Epic 10.2",
  "market-benchmarks": "Epic 10.4",
  geography: "Epic 10.5",
  "functional-domains": "Epic 10.5",
  "consent-toggles": "Epic 10.5",
};

export default async function AdminResourcePlaceholder({
  params,
}: {
  params: Promise<{ resource: string }>;
}) {
  const { resource } = await params;
  const destination = ADMIN_RESOURCES.find((d) => d.segment === resource);
  if (!destination) notFound();

  const { label, icon: Icon, screenId, blurb, collection } = destination;

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href={ADMIN_BASE}
        className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-[#0b163f] dark:hover:text-white"
      >
        <ArrowLeft size={14} />
        Overview
      </Link>

      <div className="rounded-2xl border border-dashed border-[#0b163f]/20 bg-white/60 p-8 text-center dark:border-white/20 dark:bg-white/5">
        <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-[#e9efff] text-[#1746b5] dark:bg-white/10 dark:text-[#8eb4ff]">
          <Icon size={22} />
        </span>
        <h2 className="text-xl font-black text-[#0b163f] dark:text-white">
          {label}{" "}
          <span className="text-xs font-semibold text-slate-400">{screenId}</span>
        </h2>
        {blurb && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{blurb}</p>}

        <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
          <Construction size={13} />
          Screen arrives in {DELIVERED_BY[resource]}
        </p>

        <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
          Until then the API is live and gated — edit through{" "}
          <Link
            href={API_DOCS_LINK.href}
            className="font-semibold text-[#1746b5] underline-offset-2 hover:underline dark:text-[#8eb4ff]"
          >
            {API_DOCS_LINK.label}
          </Link>{" "}
          under <code className="rounded bg-slate-100 px-1 py-0.5 text-xs dark:bg-white/10">/admin/config/{collection}</code>.
        </p>
      </div>
    </div>
  );
}
