'use client';

import * as React from 'react';
import { ArrowRight, Check, Download, Plus, RotateCcw, TriangleAlert } from 'lucide-react';
import toast from 'react-hot-toast';

import WizardShell from '../../_components/WizardShell';
import { SectionHeader } from '@/components/shared/OfferCompareTable';
import ScoreBreakdown from '@/components/shared/ScoreBreakdown';

import { getScreen } from '../../_constants/screens';
import {
  buildSummaryText,
  RESULT_CATEGORIES,
  SCR010_COPY,
} from '../../_constants/scr010';
import * as api from '../../_state/api';
import { useWizardContext } from '../../_state/useWizardContext';

const SCREEN = getScreen('SCR-010');
const C = SCR010_COPY;

/**
 * SCR-010 — Results. Zero input fields, fully read-only.
 *
 * Every number, label, strength, watch-out and next step is READ from the
 * scoring engine response. There is deliberately no threshold comparison
 * anywhere in this file — the recommendation label, the three guidance lists
 * and their empty states all arrive already derived from
 * `deriveGuidance()` server-side.
 *
 * "Next" becomes "Finish" here; this is the last screen of the flow.
 */
export default function ResultsPage() {
  const { sessionId, offerId, resolving, navigateWithContext } = useWizardContext();

  const [score, setScore] = React.useState<api.OfferScore | null>(null);
  const [offer, setOffer] = React.useState<{
    label: string | null;
    companyName: string | null;
    roleTitle: string | null;
  } | null>(null);
  const [isSingleOffer, setIsSingleOffer] = React.useState(true);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (resolving) return;
    let cancelled = false;

    async function load() {
      if (!sessionId || !offerId) {
        navigateWithContext(getScreen('SCR-009').href, {
          session: sessionId ?? undefined,
        });
        return;
      }

      const [full, computed, session] = await Promise.all([
        api.getOffer(offerId).catch(() => null),
        api.computeOfferScore(offerId).catch(() => null),
        api.getEvaluationSession(sessionId).catch(() => null),
      ]);
      if (cancelled) return;

      setOffer({
        label: full?.label ?? null,
        companyName: full?.companyName ?? null,
        roleTitle: full?.roleTitle ?? null,
      });
      setScore(computed);

      // Community insight shows for a single offer only — multiple-offer
      // candidates already got comparison context on SCR-009.
      setIsSingleOffer((session?.offers?.length ?? 1) <= 1);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolving, sessionId, offerId]);

  // Keyed `category` to match ScoreBreakdown's Recharts `dataKey`.
  const categories = React.useMemo<{ category: string; score: number }[]>(
    () =>
      score
        ? RESULT_CATEGORIES.map((c) => ({
            category: c.label as string,
            score: score[c.key as keyof api.OfferScore] as number,
          }))
        : [],
    [score],
  );

  function handleDownload() {
    if (!score) return;
    const text = buildSummaryText({
      offerLabel: offer?.label ?? 'Offer',
      companyName: offer?.companyName ?? null,
      roleTitle: offer?.roleTitle ?? null,
      overallScore: score.overallScore,
      recommendationLabel: score.recommendationLabel,
      categories: categories.map((c) => ({ label: c.category, score: c.score })),
      strengths: score.strengths ?? [],
      watchOuts: score.watchOuts ?? [],
      nextSteps: score.nextSteps ?? [],
    });

    // Plain text, real browser download — PDF export is backlogged.
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `offerguide-summary-${(offer?.label ?? 'offer')
      .toLowerCase()
      .replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  if (resolving || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Calculating your results…</p>
      </div>
    );
  }

  if (!score) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <p className="max-w-sm text-center text-sm text-muted-foreground">
          We couldn&apos;t calculate results for this offer yet. Go back and make
          sure the offer&apos;s compensation details are saved.
        </p>
      </div>
    );
  }

  const strengths = score.strengths ?? [];
  const watchOuts = score.watchOuts ?? [];
  const nextSteps = score.nextSteps ?? [];

  return (
    <WizardShell
      screen={SCREEN}
      introPurpose={C.purpose}
      introRequirementNote={C.requirementNote}
      onBack={() =>
        navigateWithContext(getScreen('SCR-009').href, {
          session: sessionId ?? undefined,
          offer: offerId ?? undefined,
        })
      }
      // Last screen of the flow — "Next →" becomes "Finish".
      onNext={() => {
        toast.success('Evaluation complete.');
        navigateWithContext('/offerguide');
      }}
      nextLabel={C.finishLabel}
    >
      {/* ============================ 1 — Offer fit score ==================== */}
      <section>
        <SectionHeader
          index={1}
          title={C.sections.fitScore}
          helpText={C.sectionHelp.fitScore}
          meta={
            [offer?.companyName, offer?.label].filter(Boolean).join(' · ') ||
            undefined
          }
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="flex items-baseline gap-1.5">
              <span className="text-4xl font-bold tabular-nums text-primary">
                {score.overallScore}
              </span>
              <span className="text-sm text-muted-foreground">/ 100</span>
            </p>
            <div
              className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-valuenow={score.overallScore}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full bg-success"
                style={{
                  width: `${Math.max(0, Math.min(100, score.overallScore))}%`,
                }}
              />
            </div>
            <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
              {C.scoreHint}
            </p>
          </div>

          {/* Label comes straight from the engine — never recomputed here. */}
          <div className="rounded-lg border border-success bg-success-subtle p-4">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold text-success">
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              {C.recommendationEyebrow}
            </p>
            <p className="mt-1.5 text-base font-bold leading-snug">
              {score.recommendationLabel}
            </p>
            {(offer?.companyName || offer?.roleTitle) && (
              <p className="mt-1 text-[11px] text-muted-foreground">
                {[offer?.companyName, offer?.roleTitle].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ============================ 2 — Category scores ==================== */}
      <section className="mt-6">
        <SectionHeader
          index={2}
          title={C.sections.categories}
          helpText={C.sectionHelp.categories}
        />
        <ScoreBreakdown scores={categories} infoNote={C.categoriesInfoNote} />
      </section>

      {/* ==================== 3 — Strengths & watch-outs ===================== */}
      <section className="mt-6">
        <SectionHeader
          index={3}
          title={C.sections.strengthsWatchOuts}
          helpText={C.sectionHelp.strengthsWatchOuts}
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-3.5">
            <h3 className="flex items-center gap-1.5 text-xs font-semibold text-success">
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              {C.strengthsTitle}
            </h3>
            {strengths.length === 0 ? (
              <p className="mt-2 text-xs text-muted-foreground">
                {C.strengthsEmpty}
              </p>
            ) : (
              <ul className="mt-2 space-y-1.5">
                {strengths.map((s) => (
                  <li key={s.category} className="flex items-center gap-2 text-xs">
                    <Check
                      className="h-3 w-3 shrink-0 text-success"
                      aria-hidden="true"
                    />
                    <span>
                      {s.category}: {s.score} / 100
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-lg border border-warning/40 bg-warning-subtle p-3.5">
            <h3 className="flex items-center gap-1.5 text-xs font-semibold text-warning">
              <TriangleAlert className="h-3.5 w-3.5" aria-hidden="true" />
              {C.watchOutsTitle}
            </h3>
            {watchOuts.length === 0 ? (
              <p className="mt-2 text-xs text-muted-foreground">
                {C.watchOutsEmpty}
              </p>
            ) : (
              <ul className="mt-2 space-y-1.5">
                {watchOuts.map((w) => (
                  <li key={w} className="flex items-start gap-2 text-xs">
                    <TriangleAlert
                      className="mt-0.5 h-3 w-3 shrink-0 text-warning"
                      aria-hidden="true"
                    />
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* ======================= 4 — Suggested next steps ==================== */}
      <section className="mt-6">
        <SectionHeader
          index={4}
          title={C.sections.nextSteps}
          helpText={C.sectionHelp.nextSteps}
        />
        <ul className="space-y-2">
          {nextSteps.map((step) => (
            <li key={step}>
              <div className="flex w-full items-center gap-2.5 rounded-lg border border-border bg-card px-3.5 py-2.5 text-xs font-medium">
                <ArrowRight
                  className="h-3.5 w-3.5 shrink-0 text-primary"
                  aria-hidden="true"
                />
                {step}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* ===================== 5 — Community insight (single) ================ */}
      {isSingleOffer && (
        <section className="mt-6">
          <SectionHeader
            index={5}
            title={C.sections.community}
            helpText={C.sectionHelp.community}
            meta={C.communityMeta}
          />
          <div className="rounded-lg border border-border bg-card p-3.5">
            <p className="text-xs font-semibold">{C.communityTitle}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {C.communityBody}
            </p>
          </div>
        </section>
      )}

      {/* ============================== action strip ========================= */}
      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleDownload}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Download className="h-3.5 w-3.5" aria-hidden="true" />
          {C.actions.download}
        </button>

        <button
          type="button"
          onClick={() =>
            // `offer: null` drops the current offer id so SCR-003 creates a new
            // offer rather than editing this one — see useWizardContext.
            navigateWithContext(getScreen('SCR-003').href, {
              session: sessionId ?? undefined,
              offer: null,
            })
          }
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-xs font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          {C.actions.addOffer}
        </button>

        <button
          type="button"
          onClick={() => navigateWithContext(getScreen('SCR-001').href)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-xs font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          {C.actions.revisit}
        </button>
      </div>

      {/* ============================ footer disclaimer ====================== */}
      <div className="mt-4 rounded-lg border border-border bg-muted/40 px-4 py-3 text-center">
        <p className="text-xs font-semibold">{C.disclaimerPrimary}</p>
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
          {C.disclaimerSecondary}
        </p>
      </div>
    </WizardShell>
  );
}
