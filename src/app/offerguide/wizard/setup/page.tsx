'use client';

import * as React from 'react';
import toast from 'react-hot-toast';

import WizardShell from '../../_components/WizardShell';
import { BinaryRadioCards } from '../../_components/fields/RadioCards';
import RadioCards from '../../_components/fields/RadioCards';
import Chips from '../../_components/fields/Chips';
import HelpIcon from '@/components/shared/HelpIcon';

import { getScreen } from '../../_constants/screens';
import {
  EVALUATION_OFFER_COUNTS,
  EVALUATION_PRIORITIES,
  EVALUATION_TYPES,
  SCR002_COPY,
  SCR002_DEFAULTS,
  SCR002_LIMITS,
} from '../../_constants/scr002';
import * as api from '../../_state/api';
import { useWizardContext } from '../../_state/useWizardContext';
import { useDraftAutosave } from '../../_state/useDraftAutosave';

const SCREEN = getScreen('SCR-002');
const C = SCR002_COPY;

/**
 * SCR-002 — Evaluation Setup. 3 fields, all required, shown once per session.
 *
 * Single centred column — this is the one screen in the wizard that deliberately
 * differs from the two-column data-entry layout (SCR-002 FRS §9), which is why
 * `WizardShell` gets `layout="single-centered"` and `introVariant="plain"` here
 * and nowhere else.
 *
 * If a session already exists for this candidate, the fields render read-only:
 * the FRS is explicit that priority editing mid-session is deferred and "no edit
 * path back into this screen" should be built once a session has started.
 */
export default function EvaluationSetupPage() {
  const { sessionId, resolving, navigateWithContext } = useWizardContext();
  const { scheduleSave, saveNow } = useDraftAutosave(SCREEN.id);

  const [offerCount, setOfferCount] = React.useState<string>(
    SCR002_DEFAULTS.evaluationOfferCount,
  );
  const [evalType, setEvalType] = React.useState<string>(
    SCR002_DEFAULTS.evaluationType,
  );
  const [priorities, setPriorities] = React.useState<string[]>([]);
  const [otherText, setOtherText] = React.useState('');
  const [showErrors, setShowErrors] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [existingSession, setExistingSession] =
    React.useState<api.EvaluationSession | null>(null);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    if (resolving) return;
    let cancelled = false;

    async function load() {
      if (sessionId) {
        const session = await api.getEvaluationSession(sessionId).catch(() => null);
        if (cancelled) return;
        if (session) {
          setExistingSession(session);
          setOfferCount(session.evaluationOfferCount);
          setEvalType(session.evaluationType);
          setPriorities(session.evaluationPriorities ?? []);
          setOtherText(session.evaluationPriorityOtherText ?? '');
        }
      }

      const draft = await api.getWizardDraft().catch(() => null);
      if (cancelled) return;
      const answers = draft?.answers as
        | { offerCount?: string; evalType?: string; priorities?: string[]; otherText?: string }
        | undefined;
      if (!existingSession && answers) {
        if (answers.offerCount) setOfferCount(answers.offerCount);
        if (answers.evalType) setEvalType(answers.evalType);
        if (answers.priorities) setPriorities(answers.priorities);
        if (answers.otherText) setOtherText(answers.otherText);
      }

      setLoaded(true);
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolving, sessionId]);

  const isLocked = !!existingSession;

  React.useEffect(() => {
    if (!loaded || isLocked) return;
    scheduleSave({ offerCount, evalType, priorities, otherText });
  }, [loaded, isLocked, offerCount, evalType, priorities, otherText, scheduleSave]);

  const otherSelected = priorities.includes('Other');
  const otherMissing = otherSelected && otherText.trim() === '';
  const canProceed =
    !!offerCount &&
    !!evalType &&
    priorities.length >= SCR002_LIMITS.minPriorities &&
    priorities.length <= SCR002_LIMITS.maxPriorities &&
    !otherMissing;

  async function handleNext() {
    if (isLocked && existingSession) {
      await saveNow({});
      navigateWithContext(getScreen('SCR-003').href, { session: existingSession.id });
      return;
    }

    setShowErrors(true);
    if (!canProceed) {
      toast.error('All three questions are required to continue.');
      return;
    }

    setSubmitting(true);
    try {
      const session = await api.createEvaluationSession({
        evaluationType: evalType,
        evaluationOfferCount: offerCount,
        evaluationPriorities: priorities,
        evaluationPriorityOtherText: otherSelected ? otherText : null,
      });
      if (!session) throw new Error('Could not start your evaluation.');

      await saveNow({});
      navigateWithContext(getScreen('SCR-003').href, { session: session.id });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Could not start your evaluation.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (resolving || !loaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <WizardShell
      screen={SCREEN}
      introPurpose={C.purpose}
      introRequirementNote={C.requirementNote}
      introVariant="plain"
      layout="single-centered"
      onBack={() => navigateWithContext(getScreen('SCR-001').href)}
      onNext={handleNext}
      nextDisabled={!isLocked && !canProceed}
      isSubmitting={submitting}
    >
      <div className="space-y-6">
        {isLocked && (
          <p className="rounded-md border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
            {C.lockedNote}
          </p>
        )}

        <div>
          <label className="mb-1.5 flex items-center text-xs font-medium">
            {C.labels.evaluationOfferCount}
            <HelpIcon text={C.helpText.evaluationOfferCount} label={C.labels.evaluationOfferCount} />
            <span className="ml-1.5 text-xs font-semibold text-destructive">
              required
            </span>
          </label>
          <BinaryRadioCards
            name={C.labels.evaluationOfferCount}
            options={EVALUATION_OFFER_COUNTS}
            value={offerCount}
            onChange={setOfferCount}
            disabled={isLocked}
          />
        </div>

        <div>
          <label className="mb-1.5 flex items-center text-xs font-medium">
            {C.labels.evaluationType}
            <HelpIcon text={C.helpText.evaluationType} label={C.labels.evaluationType} />
            <span className="ml-1.5 text-xs font-semibold text-destructive">
              required
            </span>
          </label>
          <RadioCards
            name={C.labels.evaluationType}
            options={EVALUATION_TYPES}
            value={evalType}
            onChange={setEvalType}
            disabled={isLocked}
            withDot
            gridCols={2}
          />
        </div>

        <div>
          <label className="mb-1.5 flex items-center text-xs font-medium">
            {C.labels.evaluationPriorities}
            <HelpIcon text={C.helpText.evaluationPriorities} label={C.labels.evaluationPriorities} />
            <span className="ml-1.5 text-xs font-semibold text-destructive">
              required
            </span>
          </label>
          <Chips
            name={C.labels.evaluationPriorities}
            options={EVALUATION_PRIORITIES}
            value={priorities}
            onChange={setPriorities}
            maxSelections={SCR002_LIMITS.maxPriorities}
            showCounter
            disabled={isLocked}
            otherText={otherText}
            onOtherTextChange={setOtherText}
            otherMaxLength={SCR002_LIMITS.priorityOtherTextMax}
          />
          {showErrors && priorities.length < SCR002_LIMITS.minPriorities && (
            <p className="mt-1 text-xs text-destructive">
              Select at least one priority to continue.
            </p>
          )}
        </div>
      </div>
    </WizardShell>
  );
}
