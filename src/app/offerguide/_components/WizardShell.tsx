'use client';

import * as React from 'react';
import ModuleStepper from './ModuleStepper';
// import SectionStepper, { type SectionStep } from './SectionStepper';
import IntroCard from './IntroCard';
import BottomNav from './BottomNav';
import LanguageSwitcher from './LanguageSwitcher';
import type { WizardScreen } from '../_constants/screens';

/**
 * The shared wizard chrome for SCR-001 through SCR-005.
 *
 * Built ONCE and reused, per Sprint 6 handoff §2 — not re-implemented per screen.
 * Composes: module stepper (desktop only) → optional sticky slot (CompensationBar
 * on SCR-004) → section mini-stepper → intro card → the screen's fields →
 * bottom nav with the progress label.
 *
 * SCR-000 deliberately does not use this. It sits outside the 10-step flow and has
 * no stepper, no progress label and no Back/Next.
 *
 * Layout follows the handoff's table: two columns on the data-entry screens
 * (SCR-001, 003, 004, 005), a single centred max-width column on SCR-002, which
 * is intentionally a focused onboarding-style screen rather than a data grid.
 * Mobile is always a single full-width column in the same field order.
 */
export default function WizardShell({
  screen,
  introTitle,
  introPurpose,
  introRequirementNote,
  introVariant = 'card',
  // sections,
  // activeSectionIndex = 0,
  // sectionHeading,
  layout = 'two-column',
  stickySlot,
  onBack,
  onNext,
  nextDisabled,
  nextLabel,
  isSubmitting,
  children,
}: {
  screen: WizardScreen;
  introTitle?: string;
  introPurpose: string;
  introRequirementNote?: string;
  /** 'plain' is SCR-002 only — no card border, centred on desktop. */
  introVariant?: 'card' | 'plain';
  /** Omit (or pass fewer than 2) on screens without a mini-stepper. */
  // sections?: SectionStep[];
  activeSectionIndex?: number;
  sectionHeading?: string;
  layout?: 'two-column' | 'single-centered';
  /**
   * Rendered between the module stepper and the section stepper, sticky at every
   * breakpoint. SCR-004's CompensationBar is the only user this sprint.
   */
  stickySlot?: React.ReactNode;
  onBack: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
  isSubmitting?: boolean;
  children: React.ReactNode;
}) {
  const isTwoColumn = layout === 'two-column';
  // Narrower than before ("too wide, make inputs come closer") — max-w-5xl
  // instead of max-w-6xl for the two-column screens.
  const contentWidth = isTwoColumn ? 'max-w-5xl' : 'max-w-2xl';

  const intro = (
    <IntroCard
      screen={screen}
      title={introTitle}
      purpose={introPurpose}
      requirementNote={introRequirementNote}
      variant={introVariant}
    />
  );

  return (
    // No `min-h-screen`: the wizard is nested inside the portal's nav and footer,
    // so claiming a full viewport just pads the page out. The bottom nav is sticky
    // and sits correctly at the natural content height.
    <div className="flex flex-col">
      {/* Sits above the stepper so it is reachable on every screen of the flow,
          including the ones where the intro card moves into a sidebar. */}
      <div className="flex justify-end px-4 pt-3 sm:px-6">
        <LanguageSwitcher />
      </div>

      <ModuleStepper currentScreenId={screen.id} />

      {stickySlot && (
        <div className="sticky top-0 z-30">{stickySlot}</div>
      )}

      {/* {sections && sections.length > 1 && (
        <SectionStepper
          sections={sections}
          activeIndex={activeSectionIndex}
          heading={sectionHeading}
        />
      )} */}

      <main className="flex-1 px-4 py-4 sm:px-6 sm:py-5">
        <div className={`mx-auto w-full ${contentWidth}`}>
          {isTwoColumn ? (
            // Desktop: intro moves into a right-hand sidebar so the field
            // sections start at the top of the column instead of being pushed
            // down below a full-width intro block. `flex-row-reverse` keeps
            // intro FIRST in DOM — so mobile (`flex-col`, no reverse) still
            // stacks it above the fields — while rendering it on the right once
            // the row direction flips at `lg`.
            <div className="flex flex-col gap-4 lg:flex-row-reverse lg:items-start lg:gap-5">
              <aside className="lg:sticky lg:top-4 lg:w-60 lg:shrink-0">
                {intro}
              </aside>
              <div className="min-w-0 flex-1">{children}</div>
            </div>
          ) : (
            <>
              {intro}
              <div className="mt-4">{children}</div>
            </>
          )}
        </div>
      </main>

      <BottomNav
        screen={screen}
        onBack={onBack}
        onNext={onNext}
        nextDisabled={nextDisabled}
        nextLabel={nextLabel}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
