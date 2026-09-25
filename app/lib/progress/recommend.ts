import type { PriorKnowledge } from "./types";

export type RecommendReason = "focus" | "gap" | "continue" | "start";

export type RecommendNextArgs = {
  organs: { id: string; system: string }[];
  mastery: { organId: string; mastery: number; lessonCompleted: boolean }[];
  focusSystems?: string[];
  priorKnowledge?: PriorKnowledge | null;
};

export type RecommendNextResult = { organId: string; reason: RecommendReason } | null;

/**
 * Pure next-organ picker. Order is continue → focus → gap → start so a learner
 * already mid-specimen is not yanked into a different system. Beginners only
 * bias the continue pick toward organs whose lesson is still open.
 */
export function recommendNext(args: RecommendNextArgs): RecommendNextResult {
  const { organs, mastery, focusSystems, priorKnowledge } = args;
  if (organs.length === 0) return null;

  const byId = new Map(mastery.map((row) => [row.organId, row]));
  const beginner = priorKnowledge === "beginner";

  const preferOpenLesson = <T extends { id: string }>(candidates: T[]): T | undefined => {
    if (beginner) {
      const open = candidates.filter((item) => !byId.get(item.id)?.lessonCompleted);
      if (open.length > 0) return open[0];
    }
    return candidates[0];
  };

  const inProgress = organs.filter((organ) => {
    const row = byId.get(organ.id);
    return row !== undefined && row.mastery < 80;
  });
  const continuePick = preferOpenLesson(inProgress);
  if (continuePick) return { organId: continuePick.id, reason: "continue" };

  const focus = new Set(focusSystems ?? []);
  if (focus.size > 0) {
    const untouchedFocus = organs.filter((organ) => !byId.has(organ.id) && focus.has(organ.system));
    if (untouchedFocus[0]) return { organId: untouchedFocus[0].id, reason: "focus" };
  }

  const incomplete = organs
    .filter((organ) => {
      const row = byId.get(organ.id);
      return row !== undefined && !row.lessonCompleted;
    })
    .sort((a, b) => {
      const left = byId.get(a.id)?.mastery ?? 0;
      const right = byId.get(b.id)?.mastery ?? 0;
      return left - right;
    });
  if (incomplete[0]) return { organId: incomplete[0].id, reason: "gap" };

  const unseen = organs.find((organ) => !byId.has(organ.id));
  if (unseen) return { organId: unseen.id, reason: "start" };

  return null;
}

/** Consecutive days (ending today or yesterday) in a descending list of ISO
 *  dates. Yesterday still counts so a streak isn't lost until a full day is
 *  missed. Lives here (not db/learners) so tests can import it without the
 *  Workers D1 binding. */
export function currentStreak(daysDesc: string[]): number {
  if (daysDesc.length === 0) return 0;
  const set = new Set(daysDesc);
  const dayMs = 86_400_000;
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const iso = (d: Date) => d.toISOString().slice(0, 10);
  let cursor = today;
  if (!set.has(iso(cursor))) {
    cursor = new Date(cursor.getTime() - dayMs);
    if (!set.has(iso(cursor))) return 0;
  }
  let streak = 0;
  while (set.has(iso(cursor))) {
    streak += 1;
    cursor = new Date(cursor.getTime() - dayMs);
  }
  return streak;
}
