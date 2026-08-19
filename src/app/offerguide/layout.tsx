import type { Metadata } from 'next';

/**
 * OfferGuide module shell.
 *
 * Exists for one structural reason: `globals.css` paints a hardcoded
 * `body { background-color: #efefef }` for the whole portal and only overrides it
 * under `.dark`. OfferGuide's default is light and it must be built entirely on
 * theme tokens (Sprint 6 handoff §2), so the module paints its own token-driven
 * surface here rather than inheriting the legacy grey. The global `body` rule is
 * deliberately left alone — changing it would restyle every existing page.
 *
 * This is layout only. No auth gate, no permission check, no role logic: OfferGuide
 * is public and a guest completes the entire wizard with no account.
 */

export const metadata: Metadata = {
  title: 'OfferGuide | Sanjeeda',
  description:
    'Understand how well a job offer fits your needs before you say yes. Scored across seven things that shape your life.',
};

export default function OfferGuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">{children}</div>
  );
}
