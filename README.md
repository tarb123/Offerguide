# sanjeeda.io

Career services portal. Next.js (App Router), MySQL via Prisma, MongoDB via
Mongoose for configuration data.

## Getting started

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm test` | Vitest suite (unit + contract verification) |
| `npm run lint` | ESLint |

## API documentation

The full API contract lives in [`public/openapi.yaml`](public/openapi.yaml) and
renders as Swagger UI at **`/docs`** (also mounted at `/api-docs`). It is
hand-authored — there is no JSDoc generation step, so a new route means a new
entry in that file. `src/lib/offerguide/contract.test.ts` fails the build if the
two ever drift apart in either direction.

---

# OfferGuide — known limitations

These are current, accepted limitations of the OfferGuide module as it ships.
They are stated here rather than buried in code comments so that anyone
operating or extending the module finds them first.

### Guest data has no automatic expiry

A candidate can complete the entire wizard without an account; their answers are
tied to a `guestToken` httpOnly cookie and stored in `candidate_profiles`. That
data has **no TTL and is never automatically removed**. This is deliberate — a
guest who returns weeks later still finds their evaluation — but it means guest
rows accumulate indefinitely and need a retention policy before they become a
compliance question.

Note the asymmetry: `WizardDraft` (the autosaved in-progress answers, in Mongo)
*does* carry a 30-day TTL index. The draft expires; the profile it was drafting
does not.

### Cross-device registration orphans guest history

`POST /claim-guest-profile` links a guest profile to a newly registered account
by reading the `guestToken` cookie from the same browser. A candidate who
evaluates offers on their phone and then registers on their laptop has no cookie
to link, so the guest profile stays unlinked and their history is effectively
lost to them. **There is no email-based linking.** The endpoint reports this
outcome in its response `message` rather than failing.

### The admin config API has no UI

The six admin-editable Mongo collections (`OgQuestions`, `OgScoringConfig`,
`OgGeography`, `OgMarketBenchmarks`, `OgFunctionalDomains`, `OgConsentToggles`)
are edited through Swagger, `curl`, or a script. No admin interface exists, and
none is planned before Sprint 9. Everything under `/admin/config/*` is a
26-operation surface intended for operators, not end users.

### The admin gate is temporary and is replaced in Sprint 9

`/admin/config/*` is protected by a single env-configured token
(`OFFERGUIDE_ADMIN_TOKEN`, sent as the `x-og-admin-token` header). **This is not
RBAC.** There is no `role` column, no `usePermission()`, and no per-user admin
identity — those land in Sprint 9. The gate fails closed: if the env var is
unset, no request passes.

Because the admin API has no UI, this gate is the only thing protecting
configuration integrity, which is why it is treated as launch-blocking despite
being interim.

### Weighting layers ship at their defaults, untuned

The importance-slider layer (`offer_worklife_importance`,
`offer_growth_importance`, `offer_culture_importance`) and the
`evaluation_type` bonus layer are live infrastructure, wired end to end and
exercised by tests — but they ship at their **default settings with no
real-world tuning applied**. They are mechanisms waiting for data, not
calibrated weights. Retuning them is a new `OgScoringConfig` version, not a
deploy.

### Market intelligence has no community data yet

The SCR-009 market intelligence panel and the SCR-010 community insight card
render honest empty states ("not enough community data yet"). They are fed by
candidate-contributed consent data, which does not exist until candidates start
opting in. This is **not** the same source as `OgMarketBenchmarks`, which is
admin-maintained reference data and does drive a real Salary score — so a
correct build shows a real Salary score alongside an empty market intelligence
panel.

## Scoring

Scoring is configuration-driven. Category composition comes from each question's
own `category` field in `OgQuestions` — there is no field-to-category map in
code, so moving a question between categories is a document edit. Salary is the
exception: it uses a dedicated market-percentile formula against
`OgMarketBenchmarks` and never enters the generic averaging path.

Every `offer_scores` row records the `scoringConfigVersion` that produced it, and
config versions are immutable, so a stored score can always be traced back to
the exact weights behind it. Creating a new version never alters previously
computed scores.

`src/lib/offerguide/scoring/goldenFixtures.ts` holds five committed fixtures with
their expected output. Any change that moves those numbers fails
`goldenFixtures.test.ts` — intentionally, so the movement gets reviewed.
