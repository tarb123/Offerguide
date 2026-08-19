// OfferGuide — per-field scoring
// Sprint 5, Epic 5.1 §2/§3.4. Scores a single OgQuestions field against a
// candidate's raw answer. Every rule below (option scores, rating
// multiplier, numeric bands, nullScore, the offer_probation/
// offer_restrictive_clause "Not clear" overrides) is data read off the
// question document — nothing field-specific is hardcoded here.

export type ScoreableAnswer = string | number | null | undefined;

export type QuestionOption = { value: string; score: number; active?: boolean };
export type NumericBand = { upTo?: number; score: number };

export type ScoringQuestionDoc = {
  fieldId: string;
  category: string;
  scoreType: "enum" | "yesno" | "rating" | "numeric";
  options?: QuestionOption[];
  ratingMultiplier?: number;
  numericBands?: NumericBand[];
  nullScore?: number;
};

// A blank/unmatched enum answer is genuine uncertainty, not an engine
// error — this mirrors the seed data's own UNCLEAR=45 anchor score used
// throughout for "Not clear"/"Not sure" style answers, applied the same way
// here for consistency rather than crashing on partially-answered offers.
export const ENUM_FALLBACK_SCORE = 45;

export class ScoringDataError extends Error {}

export function scoreField(
  question: ScoringQuestionDoc,
  answer: ScoreableAnswer
): number {
  switch (question.scoreType) {
    case "enum":
      return scoreEnum(question, answer);
    case "rating":
      return scoreRating(question, answer);
    case "numeric":
      return scoreNumeric(question, answer);
    case "yesno":
      // There is no yesno type per the Sprint 5 handoff — the generic
      // "yesno" scoreType was retired when the seed data was rewritten to
      // give every field its own literal enum options. Encountering one
      // live is stale data, not a case the engine should silently handle.
      throw new ScoringDataError(
        `Field "${question.fieldId}" is tagged scoreType "yesno", which was retired — this is a data bug, not a type the engine handles.`
      );
    default:
      throw new ScoringDataError(
        `Field "${question.fieldId}" has unknown scoreType "${question.scoreType}".`
      );
  }
}

function isBlank(answer: ScoreableAnswer): boolean {
  return answer === null || answer === undefined || answer === "";
}

/** The score for an unanswered field — per-question when configured, else the shared anchor. */
function blankScore(question: ScoringQuestionDoc): number {
  return question.nullScore ?? ENUM_FALLBACK_SCORE;
}

function scoreEnum(question: ScoringQuestionDoc, answer: ScoreableAnswer): number {
  if (isBlank(answer)) return blankScore(question);
  const options = (question.options ?? []).filter((opt) => opt.active !== false);
  const match = options.find((opt) => opt.value === answer);
  return match ? match.score : blankScore(question);
}

function scoreRating(question: ScoringQuestionDoc, answer: ScoreableAnswer): number {
  // The blank check has to come first and be explicit. Number(null) is 0, not
  // NaN, so falling through to the Number.isFinite guard below would score an
  // untouched 1-5 slider as 0 — worse than the worst answer a candidate could
  // actually give (1 x 20 = 20), and nothing like the "genuine uncertainty"
  // that a blank field means everywhere else in the engine.
  if (isBlank(answer)) return blankScore(question);

  const multiplier = question.ratingMultiplier ?? 20;
  const value = typeof answer === "number" ? answer : Number(answer);
  if (!Number.isFinite(value)) return blankScore(question);
  return value * multiplier;
}

function scoreNumeric(question: ScoringQuestionDoc, answer: ScoreableAnswer): number {
  const nullScore = blankScore(question);
  if (isBlank(answer)) return nullScore;

  const value = typeof answer === "number" ? answer : Number(answer);
  if (!Number.isFinite(value)) return nullScore;

  const bands = question.numericBands ?? [];
  for (const band of bands) {
    if (band.upTo === undefined || value <= band.upTo) return band.score;
  }
  return nullScore;
}
