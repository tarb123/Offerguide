/**
 * ISO 4217 currency list.
 *
 * TEMPORARY HOME. Every other reference list in this module comes from `/config/*`
 * (geography, functional domains, consent toggles), but no currency endpoint or
 * seed collection exists yet — so this ships as a frontend constant and is logged
 * as a backlog item to move behind `/config/currencies` alongside the others.
 * Adding a currency should not be a code change.
 *
 * Not the full ISO 4217 register: this is the working set for the target market
 * and the corridors candidates actually receive offers from. PKR leads because the
 * FRS examples and the seeded market benchmarks are Pakistan-based.
 *
 * Related backlog item, already recorded in both the SCR-001 and SCR-004 FRS:
 * auto-suggesting the currency from the selected country. Deferred, so the
 * candidate picks it themselves and there is no default.
 */

export type Currency = { code: string; name: string };

export const CURRENCIES: readonly Currency[] = [
  { code: 'PKR', name: 'Pakistani Rupee' },
  { code: 'USD', name: 'US Dollar' },
  { code: 'AED', name: 'UAE Dirham' },
  { code: 'SAR', name: 'Saudi Riyal' },
  { code: 'GBP', name: 'Pound Sterling' },
  { code: 'EUR', name: 'Euro' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'QAR', name: 'Qatari Riyal' },
  { code: 'KWD', name: 'Kuwaiti Dinar' },
  { code: 'BHD', name: 'Bahraini Dinar' },
  { code: 'OMR', name: 'Omani Rial' },
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'BDT', name: 'Bangladeshi Taka' },
  { code: 'LKR', name: 'Sri Lankan Rupee' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'SGD', name: 'Singapore Dollar' },
  { code: 'MYR', name: 'Malaysian Ringgit' },
  { code: 'HKD', name: 'Hong Kong Dollar' },
  { code: 'NZD', name: 'New Zealand Dollar' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'SEK', name: 'Swedish Krona' },
  { code: 'NOK', name: 'Norwegian Krone' },
  { code: 'DKK', name: 'Danish Krone' },
  { code: 'TRY', name: 'Turkish Lira' },
  { code: 'ZAR', name: 'South African Rand' },
  { code: 'EGP', name: 'Egyptian Pound' },
  { code: 'NGN', name: 'Nigerian Naira' },
  { code: 'KES', name: 'Kenyan Shilling' },
  { code: 'IDR', name: 'Indonesian Rupiah' },
  { code: 'PHP', name: 'Philippine Peso' },
  { code: 'THB', name: 'Thai Baht' },
  { code: 'VND', name: 'Vietnamese Dong' },
  { code: 'BRL', name: 'Brazilian Real' },
  { code: 'MXN', name: 'Mexican Peso' },
  { code: 'AFN', name: 'Afghan Afghani' },
  { code: 'IRR', name: 'Iranian Rial' },
] as const;

/** Combobox-ready — "PKR — Pakistani Rupee", matching the SCR-004 mockup. */
export const CURRENCY_OPTIONS = CURRENCIES.map((c) => ({
  value: c.code,
  label: `${c.code} — ${c.name}`,
}));
