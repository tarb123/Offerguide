'use client';

import * as React from 'react';
import HelpIcon from '@/components/shared/HelpIcon';

/**
 * Conditional pill — the amber tag that explains WHY a field is inactive.
 *
 * Product Discovery §3.4: the default treatment for a conditional field is dimmed
 * and inactive with a pill naming its trigger, NOT hidden. That avoids layout shift
 * and tells the candidate what to change to unlock it. Only the handful of fields
 * listed in the Sprint 6 handoff §2 (plus SCR-004's three, per that FRS §5) are
 * fully removed instead.
 *
 * Pill text is FRS copy — "if not Remote", "if Contract / Temporary",
 * "if offer country ≠ current country" — so it is passed in, never generated here.
 */
export function ConditionalPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="ml-2 inline-flex items-center rounded-full border border-warning/40 bg-warning-subtle px-2 py-0.5 text-[11px] font-medium text-warning">
      {children}
    </span>
  );
}

/**
 * Standard field wrapper: label, required marker, optional conditional pill,
 * the control itself, then help text.
 *
 * Help text sits BELOW the control deliberately. On these screens it is guidance
 * for an answer already in progress ("Do not include bonuses or allowances"),
 * not a precondition for understanding the label.
 *
 * When `conditional` is supplied and inactive, the whole block dims and stops
 * accepting pointer events. The control is still in the DOM and still in the tab
 * order's natural position — child inputs get `disabled` from their own props, so
 * pass that through at the call site too.
 */
export default function Field({
  label,
  htmlFor,
  required = false,
  helpText,
  conditional,
  fullWidth = false,
  helpIcon = false,
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  helpText?: string;
  /** Omit entirely for unconditional fields. */
  conditional?: { pill: string; active: boolean };
  /** Span both columns of the two-column desktop grid. */
  fullWidth?: boolean;
  /**
   * Render the ⓘ HelpIcon inline with the label, using this field's own
   * `helpText` as the tooltip content (Sprint 7 §2.1 — content must be the FRS
   * Help Text, never new copy, which is why it reuses the same prop rather than
   * taking separate tooltip text).
   *
   * Opt-in per screen: SCR-008 sets it on every field as the standard's
   * introduction; the Epic 7.4 retrofit turns it on for SCR-001→007.
   */
  helpIcon?: boolean;
  children: React.ReactNode;
}) {
  const isDimmed = conditional !== undefined && !conditional.active;

  return (
    <div
      className={[
        fullWidth ? 'sm:col-span-2' : '',
        isDimmed ? 'pointer-events-none opacity-45' : '',
      ].join(' ')}
      aria-disabled={isDimmed || undefined}
    >
      <label htmlFor={htmlFor} className="mb-1 flex flex-wrap items-center text-sm font-sans   font-bold">
        {label}
        {helpIcon && helpText && <HelpIcon text={helpText} label={label} />}
        {required && (
          <span className="ml-1.5 text-xs font-semibold text-destructive">
            required
          </span>
        )}
        {conditional && <ConditionalPill>{conditional.pill}</ConditionalPill>}
      </label>

      {children}

      {helpText && (
        <p className="mt-1 text-[11px] text-yellow-700 leading-snug">
          {helpText}
        </p>
      )}
    </div>
  );
}

/**
 * A titled group of fields — one section of a screen. The two-column desktop grid
 * lives here; mobile collapses to a single column in the same source order, which
 * is what keeps "same field order as desktop" true by construction rather than by
 * discipline.
 */
export function FieldSection({
  index,
  title,
  meta,
  columns = 2,
  children,
}: {
  /** 1-based, matches the section mini-stepper. */
  index: number;
  title: string;
  /** Right-aligned note, e.g. "5 fields" or "optional". */
  meta?: string;
  columns?: 1 | 2;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-4 first:mt-0">
      <div className="mb-2.5 flex items-center justify-between gap-3 border-b border-border pb-1.5">
        <h2 className="flex items-center gap-2 text-base uppercase font-mono font-bold text-red-700">
          <span className="flex h-6 w-6 items-center justify-center rounded-full 
          bg-red-700 text-[12px] text-primary-foreground">
            {index}.
          </span>
          {title}
        </h2>

        {meta && (
          <span className="shrink-0 text-sm font-mono text-zinc-900">
            {meta}
          </span>
        )}
      </div>
      <div
        className={[
          'grid grid-cols-1 gap-x-3 gap-y-1',
          columns === 2 ? 'sm:grid-cols-2' : '',
        ].join(' ')}
      >
        {children}
      </div>
    </section>
  );
}

/** Sub-heading inside a section, e.g. "Professional information" on SCR-001. */
export function FieldSubSection({ title }: { title: string }) {
  return (
    <p className="mt-1 text-sm font-bold uppercase text-blue-800 sm:col-span-2">
      {title}:
    </p>
  );
}
