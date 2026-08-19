'use client';

import * as React from 'react';
import toast from 'react-hot-toast';

import WizardShell from '../../_components/WizardShell';
import Field, { FieldSection } from '../../_components/fields/Field';
import RadioCards from '../../_components/fields/RadioCards';
import Combobox from '../../_components/fields/Combobox';
import { DateInput, Select, TextInput } from '../../_components/fields/Inputs';

import { getScreen } from '../../_constants/screens';
import {
  CONTRACT_DURATIONS,
  CONTRACT_DURATION_TRIGGER,
  OFFER_EMPLOYMENT_TYPES,
  OFFER_WORK_ARRANGEMENTS,
  PROBATION_PERIODS,
  REPORTING_LEVELS,
  SCR003_COPY,
  SCR003_DEFAULTS,
  SCR003_LIMITS,
} from '../../_constants/scr003';
import * as api from '../../_state/api';
import { useWizardContext } from '../../_state/useWizardContext';
import { useReferenceData } from '../../_state/useReferenceData';
import { useDraftAutosave } from '../../_state/useDraftAutosave';

const SCREEN = getScreen('SCR-003');
const C = SCR003_COPY;

type OfferForm = {
  companyName: string;
  roleTitle: string;
  offerFunctionalDomain: string;
  offerReceivedDate: string;
  offerEmploymentType: string;
  offerCountry: string | null;
  offerCity: string | null;
  offerWorkArrangement: string;
  offerContractDuration: string;
  offerContractDurationOtherText: string;
  offerProbation: string;
  offerProbationOtherText: string;
  reportingLevel: string;
  reportingLevelOtherText: string;
};

const EMPTY_FORM: OfferForm = {
  companyName: '',
  roleTitle: '',
  offerFunctionalDomain: '',
  offerReceivedDate: '',
  offerEmploymentType: SCR003_DEFAULTS.offerEmploymentType,
  offerCountry: null,
  offerCity: null,
  offerWorkArrangement: SCR003_DEFAULTS.offerWorkArrangement,
  offerContractDuration: SCR003_DEFAULTS.offerContractDuration,
  offerContractDurationOtherText: '',
  offerProbation: SCR003_DEFAULTS.offerProbation,
  offerProbationOtherText: '',
  reportingLevel: '',
  reportingLevelOtherText: '',
};

const TODAY = new Date().toISOString().slice(0, 10);

/**
 * SCR-003 — Offer Details. 11 fields, 2 required, single scrollable page (no
 * pagination), two sections with mini-stepper.
 *
 * Shown once per offer, repeated for each additional offer when
 * evaluation_offer_count = Multiple offers (SCR-003 FRS §2). This sprint only
 * builds the single-offer path: the wizard creates one offer per session and
 * carries its id forward via `?offer=`. Multi-offer add/switch UI is SCR-009,
 * Sprint 7.
 *
 * offer_contract_duration is always rendered — dimmed and inactive until
 * Contract or Temporary is selected, never unmounted, which is the one thing
 * this screen is most often gotten wrong.
 */
export default function OfferDetailsPage() {
  // Opt out of inferring an offer from the session: on THIS screen an absent
  // `?offer=` always means "new offer". With inference on, "Add another offer"
  // would resolve to the session's latest offer and overwrite it.
  const { sessionId, offerId, resolving, navigateWithContext } =
    useWizardContext({ inferOfferFromSession: false });
  const { scheduleSave, saveNow } = useDraftAutosave(SCREEN.id);

  const [form, setForm] = React.useState<OfferForm>(EMPTY_FORM);
  const [loading, setLoading] = React.useState(true);
  const [showErrors, setShowErrors] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  // "Offer A", "Offer B", … assigned in session order and used as the offer's
  // identity throughout the wizard (SCR-003 FRS §5). Computed once from the
  // session's existing offers, not sent by the candidate.
  const [nextLabel, setNextLabel] = React.useState<string>('Offer A');

  const { countries, cities, loadingCountries } = useReferenceData(
    form.offerCountry,
  );

  React.useEffect(() => {
    if (resolving) return;
    let cancelled = false;

    async function load() {
      if (!sessionId) {
        // No session yet — SCR-002 was skipped somehow. Send the candidate back
        // rather than letting this screen create an orphaned offer.
        navigateWithContext(getScreen('SCR-002').href);
        return;
      }

      if (!offerId) {
        // New offer — compute its label from how many offers this session
        // already has. A, B, C, … by session order.
        const session = await api.getEvaluationSession(sessionId).catch(() => null);
        const count = session?.offers?.length ?? 0;
        if (!cancelled) {
          setNextLabel(`Offer ${String.fromCharCode(65 + count)}`);
        }
      }

      if (offerId) {
        const offer = await api.getOffer(offerId).catch(() => null);
        if (!cancelled && offer) {
          setForm({
            companyName: offer.companyName ?? '',
            roleTitle: offer.roleTitle ?? '',
            offerFunctionalDomain: offer.offerFunctionalDomain ?? '',
            offerReceivedDate: offer.offerReceivedDate
              ? offer.offerReceivedDate.slice(0, 10)
              : '',
            offerEmploymentType:
              offer.offerEmploymentType || SCR003_DEFAULTS.offerEmploymentType,
            offerCountry: offer.offerCountry,
            offerCity: offer.offerCity,
            offerWorkArrangement:
              offer.offerWorkArrangement || SCR003_DEFAULTS.offerWorkArrangement,
            offerContractDuration:
              offer.offerContractDuration ?? SCR003_DEFAULTS.offerContractDuration,
            offerContractDurationOtherText: offer.offerContractDurationOtherText ?? '',
            offerProbation: offer.offerProbation ?? SCR003_DEFAULTS.offerProbation,
            offerProbationOtherText: offer.offerProbationOtherText ?? '',
            reportingLevel: offer.reportingLevel ?? '',
            reportingLevelOtherText: offer.reportingLevelOtherText ?? '',
          });
        }
      }

      if (!cancelled) setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolving, sessionId, offerId]);

  const set = React.useCallback(
    <K extends keyof OfferForm>(key: K, value: OfferForm[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const onBlur = React.useCallback(() => scheduleSave(form), [scheduleSave, form]);

  React.useEffect(() => {
    if (loading) return;
    scheduleSave(form);
  }, [form, loading, scheduleSave]);

  const contractDurationActive = CONTRACT_DURATION_TRIGGER.includes(
    form.offerEmploymentType,
  );

  const missingEmploymentType = !form.offerEmploymentType;
  const missingWorkArrangement = !form.offerWorkArrangement;
  const canProceed = !missingEmploymentType && !missingWorkArrangement;

  async function handleNext() {
    setShowErrors(true);
    if (!canProceed) {
      toast.error('Employment type and work arrangement are required.');
      return;
    }
    if (!sessionId) return;

    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        companyName: form.companyName || null,
        roleTitle: form.roleTitle || null,
        offerFunctionalDomain: form.offerFunctionalDomain || null,
        offerReceivedDate: form.offerReceivedDate || null,
        offerEmploymentType: form.offerEmploymentType,
        offerCountry: form.offerCountry,
        offerCity: form.offerCity,
        offerWorkArrangement: form.offerWorkArrangement,
        // Only the active field's value is meaningful — reset to the default
        // when inactive so a candidate who briefly selected Contract, filled in
        // a duration, then switched back to Full-time doesn't leave a stale
        // "6 months" sitting behind an unrelated employment type.
        offerContractDuration: contractDurationActive
          ? form.offerContractDuration
          : SCR003_DEFAULTS.offerContractDuration,
        offerContractDurationOtherText: contractDurationActive
          ? form.offerContractDurationOtherText
          : null,
        offerProbation: form.offerProbation,
        offerProbationOtherText:
          form.offerProbation === 'Other' ? form.offerProbationOtherText : null,
        reportingLevel: form.reportingLevel || null,
        reportingLevelOtherText:
          form.reportingLevel === 'Other' ? form.reportingLevelOtherText : null,
      };

      let resolvedOfferId = offerId;
      if (resolvedOfferId) {
        await api.updateOffer(resolvedOfferId, payload);
      } else {
        const created = await api.createOffer(sessionId, {
          ...payload,
          label: nextLabel,
        });
        if (!created) throw new Error('Could not save the offer.');
        resolvedOfferId = created.id;
      }

      await saveNow(form);
      navigateWithContext(getScreen('SCR-004').href, {
        session: sessionId,
        offer: resolvedOfferId,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save the offer.');
    } finally {
      setSubmitting(false);
    }
  }

  if (resolving || loading) {
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
      sections={[
        { label: C.sections.identity, shortLabel: 'Identity' },
        { label: C.sections.logistics, shortLabel: 'Location' },
      ]}
      activeSectionIndex={0}
      sectionHeading={`${SCREEN.title} — 2 sections`}
      onBack={() => navigateWithContext(getScreen('SCR-002').href)}
      onNext={handleNext}
      nextDisabled={showErrors && !canProceed}
      isSubmitting={submitting}
    >
      <FieldSection index={1} title={C.sections.identity} meta="5 fields">
        <Field label={C.labels.companyName} helpText={C.helpText.companyName}>
          <TextInput
            value={form.companyName}
            onChange={(v) => set('companyName', v)}
            onBlur={onBlur}
            maxLength={SCR003_LIMITS.companyNameMax}
            placeholder="e.g. Unilever Pakistan"
          />
        </Field>

        <Field label={C.labels.jobTitle} helpText={C.helpText.jobTitle}>
          <TextInput
            value={form.roleTitle}
            onChange={(v) => set('roleTitle', v)}
            onBlur={onBlur}
            maxLength={SCR003_LIMITS.jobTitleMax}
            placeholder="e.g. Senior Data Analyst"
          />
        </Field>

        <Field
          label={C.labels.functionalDomain}
          helpText={C.helpText.functionalDomain}
        >
          <TextInput
            value={form.offerFunctionalDomain}
            onChange={(v) => set('offerFunctionalDomain', v)}
            onBlur={onBlur}
            maxLength={SCR003_LIMITS.functionalDomainMax}
            placeholder="e.g. Finance, Engineering"
          />
        </Field>

        <Field label={C.labels.receivedDate} helpText={C.helpText.receivedDate}>
          <DateInput
            value={form.offerReceivedDate}
            onChange={(v) => set('offerReceivedDate', v)}
            onBlur={onBlur}
            max={TODAY}
          />
        </Field>

        <Field
          label={C.labels.employmentType}
          required
          helpText={C.helpText.employmentType}
          fullWidth
        >
          <RadioCards
            name={C.labels.employmentType}
            options={OFFER_EMPLOYMENT_TYPES}
            value={form.offerEmploymentType}
            onChange={(v) => set('offerEmploymentType', v)}
          />
          {showErrors && missingEmploymentType && (
            <p className="mt-1 text-xs text-destructive">
              Select the employment type to continue.
            </p>
          )}
        </Field>
      </FieldSection>

      <FieldSection index={2} title={C.sections.logistics} meta="6 fields">
        <Field label={C.labels.country} helpText={C.helpText.country}>
          <Combobox
            options={countries}
            value={form.offerCountry}
            onChange={(v) => {
              set('offerCountry', v);
              set('offerCity', null);
            }}
            onBlur={onBlur}
            loading={loadingCountries}
            placeholder="Select a country"
          />
        </Field>

        <Field label={C.labels.city} helpText={C.helpText.city}>
          <Combobox
            options={cities}
            value={form.offerCity}
            onChange={(v) => set('offerCity', v)}
            onBlur={onBlur}
            disabled={!form.offerCountry}
            placeholder={
              form.offerCountry ? 'Select a city' : 'Select a country first'
            }
          />
        </Field>

        <Field label={C.labels.workArrangement} required helpText={C.helpText.workArrangement} fullWidth>
          <RadioCards
            name={C.labels.workArrangement}
            options={OFFER_WORK_ARRANGEMENTS}
            value={form.offerWorkArrangement}
            onChange={(v) => set('offerWorkArrangement', v)}
          />
          {showErrors && missingWorkArrangement && (
            <p className="mt-1 text-xs text-destructive">
              Select the work arrangement to continue.
            </p>
          )}
        </Field>

        {/* Always rendered, dimmed until Contract/Temporary — never unmounted. */}
        <Field
          label={C.labels.contractDuration}
          helpText={C.helpText.contractDuration}
          conditional={{
            pill: 'if Contract / Temporary',
            active: contractDurationActive,
          }}
        >
          <RadioCards name={C.labels.contractDuration}
            options={CONTRACT_DURATIONS}
            value={form.offerContractDuration}
            onChange={(v) => set('offerContractDuration', v)}
            disabled={!contractDurationActive}
            otherText={form.offerContractDurationOtherText}
            onOtherTextChange={(t) => set('offerContractDurationOtherText', t)}
            otherMaxLength={SCR003_LIMITS.contractDurationOtherMax}
          />
        </Field>

        <Field label={C.labels.probation} helpText={C.helpText.probation}>
          <Select
            options={PROBATION_PERIODS}
            value={form.offerProbation}
            onChange={(v) => set('offerProbation', v)}
            onBlur={onBlur}
          />
          {form.offerProbation === 'Other' && (
            <TextInput
              value={form.offerProbationOtherText}
              onChange={(v) => set('offerProbationOtherText', v)}
              onBlur={onBlur}
              maxLength={SCR003_LIMITS.probationOtherMax}
              placeholder="Please specify"
            />
          )}
        </Field>

        <Field label={C.labels.reportingLevel} helpText={C.helpText.reportingLevel} fullWidth>
          <Select
            options={REPORTING_LEVELS}
            value={form.reportingLevel}
            onChange={(v) => set('reportingLevel', v)}
            onBlur={onBlur}
            placeholder="Select a level"
          />
          {form.reportingLevel === 'Other' && (
            <TextInput
              value={form.reportingLevelOtherText}
              onChange={(v) => set('reportingLevelOtherText', v)}
              onBlur={onBlur}
              maxLength={SCR003_LIMITS.reportingLevelOtherMax}
              placeholder="Please specify"
            />
          )}
        </Field>
      </FieldSection>
    </WizardShell>
  );
}
