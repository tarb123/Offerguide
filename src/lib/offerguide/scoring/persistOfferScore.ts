// OfferGuide — scoring persistence
// Sprint 5, Epic 5.1. Loads everything scoreOffer() needs for one offer,
// runs the engine, and upserts the result into MySQL's offer_scores table.
// This is the only place in Sprint 5 that touches both Mongo (questions,
// scoring config, benchmarks) and MySQL (the offer itself) for scoring.

import { prisma } from "@/lib/db/prisma";
import dbConnect from "@/utils/dbConnect";
import { OgQuestions, OgMarketBenchmarks } from "@/lib/db/mongo/models/index.js";
import { scoreOffer, type OfferScoreResult } from "./scoreOffer";
import { loadScoringConfigByVersion } from "./configVersion";
import { deriveGuidance, type Guidance } from "./deriveGuidance";
import type { ScoringQuestionDoc } from "./fieldScore";
import type { MarketBenchmark } from "./salaryScore";

export class OfferNotFoundError extends Error {}

export async function computeAndPersistOfferScore(
  offerId: number,
): Promise<OfferScoreResult & Guidance> {
  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
    include: {
      evaluationSession: true,
      compensation: true,
      benefitsSecurity: true,
      workLife: true,
      growth: true,
      culture: true,
    },
  });
  if (!offer) throw new OfferNotFoundError(`Offer ${offerId} not found.`);

  await dbConnect();
  const [questions, benchmarks, config] = await Promise.all([
    OgQuestions.find({ active: true }).lean<ScoringQuestionDoc[]>(),
    // active: true for the same reason questions filter on it — a benchmark
    // retired via the admin API (soft-deleted, Sprint 8) must stop feeding new
    // Salary scores, while staying in the collection to explain old ones.
    OgMarketBenchmarks.find({ active: true }).lean<MarketBenchmark[]>(),
    // Reads the exact version this offer's session was pinned to at
    // creation time — never "whatever is currently active" — so retuning
    // weights later never silently shifts an already-computed score.
    loadScoringConfigByVersion(offer.evaluationSession.scoringConfigVersion),
  ]);

  const compensation = offer.compensation
    ? {
        offerBaseSalary: offer.compensation.offerBaseSalary.toNumber(),
        offerPayPeriod: offer.compensation.offerPayPeriod,
        offerNegotiationRoom: offer.compensation.offerNegotiationRoom,
      }
    : null;

  const result = scoreOffer({
    compensation,
    roleTitle: offer.roleTitle,
    offerCity: offer.offerCity,
    offerCountry: offer.offerCountry,
    answerSources: [offer.benefitsSecurity, offer.workLife, offer.growth, offer.culture],
    session: {
      evaluationPriorities: (offer.evaluationSession.evaluationPriorities as string[] | null) ?? [],
      evaluationType: offer.evaluationSession.evaluationType,
    },
    questions,
    config,
    configVersion: offer.evaluationSession.scoringConfigVersion,
    benchmarks,
  });

  // SCR-010's three guidance panels. Derived here, server-side, from the scores
  // just computed plus the offer's raw answers — never on the client (Sprint 7
  // §5). Reads only fields already loaded above, so no extra queries.
  const guidance = deriveGuidance(
    {
      salaryScore: result.salaryScore,
      benefitsScore: result.benefitsScore,
      stabilityScore: result.stabilityScore,
      worklifeScore: result.worklifeScore,
      growthScore: result.growthScore,
      cultureScore: result.cultureScore,
      purposeScore: result.purposeScore,
    },
    {
      offerAnnualBonusType: offer.compensation?.offerAnnualBonusType ?? null,
      offerAnnualBonus: offer.compensation?.offerAnnualBonus?.toNumber() ?? null,
      offerNegotiationRoom: offer.compensation?.offerNegotiationRoom ?? null,
      offerOvertimeCompensation: offer.workLife?.offerOvertimeCompensation ?? null,
      offerRestrictiveClause: offer.benefitsSecurity?.offerRestrictiveClause ?? null,
      offerRedFlags: offer.culture?.offerRedFlags ?? null,
    },
  );

  const scoreFields = {
    salaryScore: result.salaryScore,
    benefitsScore: result.benefitsScore,
    stabilityScore: result.stabilityScore,
    worklifeScore: result.worklifeScore,
    growthScore: result.growthScore,
    cultureScore: result.cultureScore,
    purposeScore: result.purposeScore,
    overallScore: result.overallScore,
    recommendationLabel: result.recommendationLabel,
    // Round-tripped through JSON to strip `undefined` field values (an
    // unanswered question) before hitting Prisma's Json column, which only
    // accepts valid JSON values.
    scoreBreakdown: JSON.parse(JSON.stringify(result.scoreBreakdown)),
    strengths: guidance.strengths,
    watchOuts: guidance.watchOuts,
    nextSteps: guidance.nextSteps,
    scoringConfigVersion: result.scoringConfigVersion,
    fieldScoringRulesVersion: result.fieldScoringRulesVersion,
  };

  await prisma.offerScore.upsert({
    where: { offerId },
    create: { offerId, ...scoreFields },
    update: scoreFields,
  });

  // Returned alongside the raw engine result so the /score route hands SCR-010
  // everything it renders in one response.
  return { ...result, ...guidance };
}
