'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import * as api from './api';

/**
 * Resolves which evaluation session — and, from SCR-004 onward, which offer —
 * the candidate is currently working on.
 *
 * SCR-002 is shown once per session, not repeated when a second or third offer is
 * added, and SCR-003 is "repeated for each additional offer when
 * evaluation_offer_count = Multiple offers" (SCR-003 FRS §2). So session and offer
 * identity can't just be "the most recent one" once multi-offer sessions exist —
 * they need to travel through the wizard explicitly. `?session=` and `?offer=`
 * query params carry that, which also keeps a screen reload or a shared link
 * working without re-deriving state.
 *
 * When no query param is present the hook falls back to "most recent session /
 * most recent offer in it", which is what a guest's first pass through the
 * wizard needs.
 *
 * SCR-003 must OPT OUT of the offer half of that fallback via
 * `{ inferOfferFromSession: false }`. On that screen, an absent `?offer=` always
 * means "create a new offer" — inferring the session's latest offer there makes
 * "Add another offer" silently overwrite the offer you just entered instead of
 * adding a second one.
 */
export function useWizardContext(
  { inferOfferFromSession = true }: { inferOfferFromSession?: boolean } = {},
) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [sessionId, setSessionId] = React.useState<number | null>(
    toId(searchParams.get('session')),
  );
  const [offerId, setOfferId] = React.useState<number | null>(
    toId(searchParams.get('offer')),
  );
  const [resolving, setResolving] = React.useState(true);

  // The offer id exactly as the URL gave it — never inferred. SCR-003 uses this
  // (not `offerId`) to decide create-vs-edit, because on that screen "no offer
  // in the URL" always means "start a new offer", and inferring the session's
  // most recent offer there would silently overwrite it.
  const offerIdFromUrl = toId(searchParams.get('offer'));

  React.useEffect(() => {
    let cancelled = false;

    async function resolve() {
      let resolvedSessionId = toId(searchParams.get('session'));
      let resolvedOfferId = toId(searchParams.get('offer'));

      if (!resolvedSessionId) {
        const sessions = await api.getEvaluationSessions().catch(() => null);
        resolvedSessionId = sessions?.[0]?.id ?? null;
      }

      // Convenience fallback for landing on a later screen without the param
      // (e.g. a bookmarked /results). Deliberately NOT authoritative for
      // create-vs-edit — see `offerIdFromUrl` above.
      if (!resolvedOfferId && resolvedSessionId && inferOfferFromSession) {
        const session = await api
          .getEvaluationSession(resolvedSessionId)
          .catch(() => null);
        const offers = session?.offers ?? [];
        resolvedOfferId = offers[offers.length - 1]?.id ?? null;
      }

      if (cancelled) return;
      setSessionId(resolvedSessionId);
      setOfferId(resolvedOfferId);
      setResolving(false);
    }

    resolve();
    return () => {
      cancelled = true;
    };
    // Re-resolving on every searchParams change would race the navigation calls
    // below — this runs once per mount, which is what a wizard step needs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Push `?session=&offer=` onto a wizard href without dropping either id.
   *
   * Pass `offer: null` to explicitly DROP the offer id — that is how
   * "Add another offer" says "start a blank one". Without an explicit null the
   * current offer id is carried forward, and SCR-003 would treat the visit as
   * an edit of that offer and overwrite it instead of creating the new one.
   * `'offer' in overrides` is what distinguishes "not specified" (inherit) from
   * "explicitly cleared" — a plain `?? offerId` fallback cannot express the
   * difference, which is precisely the bug this replaced.
   */
  const withContext = React.useCallback(
    (
      href: string,
      overrides?: { session?: number | null; offer?: number | null },
    ) => {
      const params = new URLSearchParams();
      const s =
        overrides && 'session' in overrides ? overrides.session : sessionId;
      const o = overrides && 'offer' in overrides ? overrides.offer : offerId;
      if (s) params.set('session', String(s));
      if (o) params.set('offer', String(o));
      const qs = params.toString();
      return qs ? `${href}?${qs}` : href;
    },
    [sessionId, offerId],
  );

  const navigateWithContext = React.useCallback(
    (
      href: string,
      overrides?: { session?: number | null; offer?: number | null },
    ) => {
      router.push(withContext(href, overrides));
    },
    [router, withContext],
  );

  return {
    sessionId,
    offerId,
    offerIdFromUrl,
    resolving,
    withContext,
    navigateWithContext,
  };
}

function toId(raw: string | null): number | null {
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}
