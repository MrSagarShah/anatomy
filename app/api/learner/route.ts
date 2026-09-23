import { applyOnboarding, identifyLearner } from "../../lib/progress/server";
import type { OnboardingInput } from "../../lib/progress/types";

// These routes read auth headers and the D1 binding at request time, so they
// must never be statically prerendered.
export const dynamic = "force-dynamic";

function localeFrom(request: Request): string {
  const value = new URL(request.url).searchParams.get("locale");
  return value && /^[a-z]{2}$/.test(value) ? value : "en";
}

/** Identify the learner (creating the row on first sight) and return their
 *  profile, including whether onboarding is still needed. */
export async function GET(request: Request) {
  return Response.json(await identifyLearner(localeFrom(request)));
}

const LEVELS = new Set(["school", "university", "professional", "educator", "curious"]);
const KNOWLEDGE = new Set(["beginner", "intermediate", "advanced"]);
const GOALS = new Set(["exam", "career", "teaching", "curiosity", "refresh"]);

function sanitizeOnboarding(body: unknown): OnboardingInput {
  const input = (body ?? {}) as Record<string, unknown>;
  const pick = <T,>(value: unknown, allowed: Set<string>): T | undefined =>
    typeof value === "string" && allowed.has(value) ? (value as T) : undefined;
  const focus = Array.isArray(input.focusSystems)
    ? (input.focusSystems.filter((s) => typeof s === "string") as string[]).slice(0, 12)
    : undefined;
  return {
    educationLevel: pick<OnboardingInput["educationLevel"]>(input.educationLevel, LEVELS),
    priorKnowledge: pick<OnboardingInput["priorKnowledge"]>(input.priorKnowledge, KNOWLEDGE),
    studyGoal: pick<OnboardingInput["studyGoal"]>(input.studyGoal, GOALS),
    focusSystems: focus,
  };
}

/** Save the educational-background answers from onboarding, then return the
 *  full snapshot so the dashboard can render immediately. */
export async function PATCH(request: Request) {
  const body = await request.json().catch(() => ({}));
  return Response.json(await applyOnboarding(localeFrom(request), sanitizeOnboarding(body)));
}
