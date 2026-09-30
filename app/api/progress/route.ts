import { loadSnapshot, logEvent } from "../../lib/progress/server";
import type { ProgressEventInput } from "../../lib/progress/types";

// Reads auth headers + D1 at request time; never prerender.
export const dynamic = "force-dynamic";

const KINDS = new Set([
  "organ_view",
  "lesson_start",
  "lesson_step",
  "lesson_complete",
  "quiz_answer",
  "quiz_complete",
  "label_answer",
  "label_quiz_complete",
]);

function localeOf(value: string | null | undefined): string {
  return value && /^[a-z]{2}$/.test(value) ? value : "en";
}

/** Validate one incoming event. Identity is never taken from the body — only the
 *  event's own shape is trusted, and even then loosely (bad events are dropped). */
function sanitizeEvent(body: Record<string, unknown>): ProgressEventInput | null {
  const kind = body.kind;
  if (typeof kind !== "string" || !KINDS.has(kind)) return null;
  const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : undefined);
  return {
    kind: kind as ProgressEventInput["kind"],
    organId: typeof body.organId === "string" ? body.organId : undefined,
    refId: typeof body.refId === "string" ? body.refId.slice(0, 120) : undefined,
    correct: typeof body.correct === "boolean" ? body.correct : undefined,
    value: num(body.value),
    total: num(body.total),
    meta:
      body.meta && typeof body.meta === "object" && !Array.isArray(body.meta)
        ? (body.meta as Record<string, unknown>)
        : undefined,
  };
}

/** Record a single learning event and fold it into the rollups. Returns 202 so
 *  the client can fire-and-forget without waiting on the write. */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const event = sanitizeEvent(body);
  if (!event) return Response.json({ error: "invalid event" }, { status: 400 });

  const locale = localeOf(
    typeof body.locale === "string" ? body.locale : new URL(request.url).searchParams.get("locale"),
  );
  const result = await logEvent(locale, event);
  return Response.json(result, { status: 202 });
}

/** The full progress snapshot for the dashboard. */
export async function GET(request: Request) {
  const locale = localeOf(new URL(request.url).searchParams.get("locale"));
  return Response.json(await loadSnapshot(locale));
}
