'use client';

import { Check } from 'lucide-react';
import { WIZARD_SCREENS, type WizardScreenId } from '../_constants/screens';

/**
 * The 10-step module stepper.
 *
 * DESKTOP ONLY — hidden on mobile at every screen (Sprint 6 handoff §2; each FRS §9
 * repeats it). Mobile gets the step count in the bottom nav label instead.
 *
 * Display only. It is not a navigation control: the wizard moves through Back/Next,
 * and letting a candidate jump to step 9 before a session exists would just 404.
 */
export default function ModuleStepper({
  currentScreenId,
}: {
  currentScreenId: WizardScreenId;
}) {
  const currentStep =
    WIZARD_SCREENS.find((s) => s.id === currentScreenId)?.step ?? 1;

  return (
    <nav
      aria-label="Wizard progress"
      className="hidden border-b border-border bg-card/50 px-6 py-3 md:block"
    >
      <ol className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto text-xs font-sans font-bold">
        {WIZARD_SCREENS.map((screen, index) => {
          const isDone = screen.step < currentStep;
          const isCurrent = screen.step === currentStep;

          return (
            <li key={screen.id} className="flex shrink-0 items-center gap-1">
              <span
                className={[
                  'flex items-center gap-1.5 rounded-full px-2 py-1 text-xs',
                  isCurrent
                    ? 'font-semibold text-primary'
                    : isDone
                      ? 'text-success'
                      : 'text-muted-foreground',
                ].join(' ')}
                aria-current={isCurrent ? 'step' : undefined}
              >
                <span
                  className={[
                    'flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold',
                    isCurrent
                      ? 'bg-primary text-primary-foreground'
                      : isDone
                        ? 'bg-success text-success-foreground'
                        : 'border border-border text-muted-foreground',
                  ].join(' ')}
                >
                  {isDone ? (
                    <Check className="h-3 w-3" aria-hidden="true" />
                  ) : (
                    screen.step
                  )}
                </span>
                {screen.stepperLabel}
              </span>
              {index < WIZARD_SCREENS.length - 1 && (
                <span
                  className="text-muted-foreground/50"
                  aria-hidden="true"
                >
                  ›
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
