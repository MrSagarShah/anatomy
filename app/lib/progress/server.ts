// Server-only helpers for the progress API routes.
//
// Every database access here is behind a *dynamic* import of `../../../db`,
// which itself imports the virtual `cloudflare:workers` module. Importing that
// eagerly at module top-level makes `next build` fail while collecting page
// data (the virtual module only exists under the vinext/Workers runtime). By
// deferring it to request time, the route modules load anywhere and simply
// report `available: false` when the binding is missing.
import { getChatGPTUser } from "../../chatgpt-auth";
import type {
  LearnerResponse,
  OnboardingInput,
  ProgressEventInput,
  ProgressResponse,
} from "./types";

/** A missing table / missing binding means the schema hasn't been migrated onto
 *  the live D1 database yet — surfaced as "unavailable" so the UI hides progress
 *  rather than erroring. */
function isSchemaMissing(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  const cause =
    error instanceof Error && error.cause instanceof Error ? error.cause.message : "";
  const combined = `${message} ${cause}`.toLowerCase();
  return (
    combined.includes("no such table") ||
    combined.includes("binding") ||
    combined.includes("d1_error") ||
    combined.includes("cloudflare:workers")
  );
}

const UNAVAILABLE = { available: false } as const;
const ANON = { available: true, authenticated: false } as const;

/**
 * SHA-256 of the normalized email — the only form of the address that ever
 * leaves this function. We never persist or return the raw email, so the DB
 * holds a stable per-user key with no PII. Web Crypto is available in both the
 * Workers runtime and Node 20+.
 */
async function hashEmail(email: string): Promise<string> {
  const data = new TextEncoder().encode(email.trim().toLowerCase());
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

type Db = Awaited<ReturnType<typeof import("../../../db")["getDb"]>>;
type LearnerRow = Awaited<ReturnType<typeof import("../../../db/learners")["upsertLearner"]>>;

/**
 * Resolve identity and open the database, all lazily, then run `work`. Any of
 * the three "not ready" states short-circuits to a serializable envelope; only
 * genuine errors propagate. This is the one place that touches the D1 layer.
 */
async function withLearner<T>(
  locale: string,
  fallbacks: { unavailable: T; anon: T },
  work: (ctx: { db: Db; learner: LearnerRow }) => Promise<T>,
): Promise<T> {
  try {
    const user = await getChatGPTUser();
    if (!user) return fallbacks.anon;

    const { getDb } = await import("../../../db");
    const { upsertLearner } = await import("../../../db/learners");
    const db = getDb();
    const learner = await upsertLearner(db, {
      emailHash: await hashEmail(user.email),
      displayName: user.displayName,
      fullName: user.fullName,
      locale,
    });
    return await work({ db, learner });
  } catch (error) {
    if (isSchemaMissing(error)) return fallbacks.unavailable;
    throw error;
  }
}

/** GET /api/learner — identity + onboarding status. */
export function identifyLearner(locale: string): Promise<LearnerResponse> {
  return withLearner<LearnerResponse>(locale, { unavailable: UNAVAILABLE, anon: ANON }, async ({ learner }) => {
    const { toProfile } = await import("../../../db/learners");
    return { available: true, authenticated: true, profile: toProfile(learner) };
  });
}

/** GET /api/progress — the full snapshot. */
export function loadSnapshot(locale: string): Promise<ProgressResponse> {
  return withLearner<ProgressResponse>(locale, { unavailable: UNAVAILABLE, anon: ANON }, async ({ db, learner }) => {
    const { getSnapshot } = await import("../../../db/learners");
    return { available: true, authenticated: true, snapshot: await getSnapshot(db, learner) };
  });
}

/** PATCH /api/learner — save educational background, return fresh snapshot. */
export function applyOnboarding(locale: string, input: OnboardingInput): Promise<ProgressResponse> {
  return withLearner<ProgressResponse>(locale, { unavailable: UNAVAILABLE, anon: ANON }, async ({ db, learner }) => {
    const { saveOnboarding, getSnapshot } = await import("../../../db/learners");
    const updated = await saveOnboarding(db, learner.id, input);
    return { available: true, authenticated: true, snapshot: await getSnapshot(db, updated) };
  });
}

type EventResult = { available: false } | { available: true; authenticated: boolean };

/** POST /api/progress — record one event. The client fires and forgets, so this
 *  only needs to report availability. */
export function logEvent(locale: string, event: ProgressEventInput): Promise<EventResult> {
  return withLearner<EventResult>(locale, { unavailable: UNAVAILABLE, anon: ANON }, async ({ db, learner }) => {
    const { recordEvent } = await import("../../../db/learners");
    await recordEvent(db, learner.id, event);
    return { available: true, authenticated: true };
  });
}
