'use client';

import * as React from 'react';
import * as api from './api';
import type { ComboboxOption } from '../_components/fields/Combobox';

/**
 * Reference lists for the location and domain dropdowns.
 *
 * All three come from `/config/*`, never a hardcoded array — that is a Sprint 6 DoD
 * requirement, and it is what lets a data steward add a country or retire a domain
 * without a release.
 *
 * Cities cascade from the selected country (`?countryCode=`), matching the SCR-001
 * and SCR-003 field cards. Changing country clears the city at the call site.
 *
 * A config fetch that fails leaves the list empty rather than throwing: every field
 * these feed is optional, so an unreachable config endpoint must not block a
 * candidate from finishing the wizard.
 */
export function useReferenceData(countryCode: string | null | undefined) {
  const [countries, setCountries] = React.useState<ComboboxOption[]>([]);
  const [cities, setCities] = React.useState<ComboboxOption[]>([]);
  const [functionalDomains, setFunctionalDomains] = React.useState<
    ComboboxOption[]
  >([]);
  const [loadingCountries, setLoadingCountries] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;

    Promise.all([
      api.getCountries().catch(() => []),
      api.getFunctionalDomains().catch(() => []),
    ]).then(([countryList, domainList]) => {
      if (cancelled) return;

      setCountries(
        (countryList ?? []).map((c) => ({
          value: c.countryCode,
          label: c.countryName,
        })),
      );
      setFunctionalDomains(
        (domainList ?? []).map((d) => ({
          value: d.name,
          label: d.name,
        })),
      );
      setLoadingCountries(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    if (!countryCode) {
      setCities([]);
      return;
    }

    let cancelled = false;
    api
      .getCities(countryCode)
      .then((cityList) => {
        if (cancelled) return;
        setCities(
          (cityList ?? []).map((c) => ({ value: c.name, label: c.name })),
        );
      })
      .catch(() => {
        if (!cancelled) setCities([]);
      });

    return () => {
      cancelled = true;
    };
  }, [countryCode]);

  return { countries, cities, functionalDomains, loadingCountries };
}
