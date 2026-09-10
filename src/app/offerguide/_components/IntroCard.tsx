'use client';

import { TOTAL_STEPS, type WizardScreen } from '../_constants/screens';
import { useT } from '../_i18n/LocaleProvider';

/**
 * Intro card — step badge, screen title, one-line purpose.
 *
 * Present on SCR-001 onward (never on SCR-000, which sits outside the flow).
 * Each FRS §9 says the same thing: "Step badge (Step N of 10), screen title,
 * one-line purpose", and SCR-004/005 add "States which fields are required."
 *
 * `requirementNote` carries that last part and must state the requirement
 * honestly — "All fields are optional" on SCR-005, the named required fields
 * elsewhere. It is the candidate's only up-front signal about what blocks Next.
 */
export default function IntroCard({
  screen,
  title,
  purpose,
  requirementNote,
  variant = 'card',
}: {
  screen: WizardScreen;
  /** Defaults to the screen's FRS title. */
  title?: string;
  purpose: string;
  requirementNote?: string;
  /**
   * SCR-002 is the odd one out. Its FRS §9 asks for a centred intro block with
   * "No card border — this screen intentionally differs from the data-entry
   * screens", separated from the fields by a single hairline divider. Every other
   * screen uses the bordered card.
   */
  variant?: 'card' | 'plain';
}) {
  const t = useT();

  if (variant === 'plain') {
    return (
      <section className="border-b border-border pb-4 text-left sm:text-center">
        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
          Step {screen.step} of {TOTAL_STEPS} — {title ?? screen.title}
        </span>
        <h1 dir="auto" className="mt-2 text-lg font-semibold tracking-tight">
          {t(purpose)}
        </h1>
        {requirementNote && (
          <p
            dir="auto"
            className="mx-auto mt-1.5 max-w-xl text-xs leading-relaxed text-muted-foreground"
          >
            {t(requirementNote)}
          </p>
        )}
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-primary/25 bg-primary/5 p-3.5">
      <span className="inline-flex w-auto font-sans
       items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary">
        Step {screen.step} of {TOTAL_STEPS}
        <span className="hidden sm:inline">  —  {title ?? screen.title}</span>
      </span>
      {/* dir="auto" so an untranslated English sentence keeps its punctuation
          in place inside the RTL wrapper. */}
      <h1
        dir="auto"
        className="mt-1.5 text-base font-sans font-bold tracking-tight"
      >
        {t(purpose)}
      </h1>
      {requirementNote && (
        <p
          dir="auto"
          className="mt-1 text-sm font-sans leading-snug text-muted-foreground"
        >
          {t(requirementNote)}
        </p>
      )}
    </section>
  );
}
