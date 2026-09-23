import { and, desc, eq, sql } from "drizzle-orm";
import { getDb } from "./index";
import {
  learners,
  lessonProgress,
  organMastery,
  progressEvents,
  type Learner,
} from "./schema";
import {
  computeMastery,
  type LearnerProfile,
  type OnboardingInput,
  type ProgressEventInput,
  type ProgressSnapshot,
} from "../app/lib/progress/types";

type Db = ReturnType<typeof getDb>;

const NOW = sql`CURRENT_TIMESTAMP`;

function parseFocusSystems(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function toProfile(row: Learner): LearnerProfile {
  return {
    displayName: row.displayName,
    fullName: row.fullName,
    locale: row.locale,
    educationLevel: (row.educationLevel as LearnerProfile["educationLevel"]) ?? null,
    priorKnowledge: (row.priorKnowledge as LearnerProfile["priorKnowledge"]) ?? null,
    studyGoal: (row.studyGoal as LearnerProfile["studyGoal"]) ?? null,
    focusSystems: parseFocusSystems(row.focusSystems),
    onboarded: Boolean(row.onboardedAt),
  };
}

/** Insert the learner on first sight, or refresh their display fields. Keyed by
 *  the verified email from the auth headers. */
export async function upsertLearner(
  db: Db,
  input: { emailHash: string; displayName: string; fullName: string | null; locale: string },
): Promise<Learner> {
  const rows = await db
    .insert(learners)
    .values({
      emailHash: input.emailHash,
      displayName: input.displayName,
      fullName: input.fullName,
      locale: input.locale,
    })
    .onConflictDoUpdate({
      target: learners.emailHash,
      set: {
        displayName: input.displayName,
        fullName: input.fullName,
        locale: input.locale,
        updatedAt: NOW,
      },
    })
    .returning();
  return rows[0];
}

export async function saveOnboarding(
  db: Db,
  learnerId: number,
  input: OnboardingInput,
): Promise<Learner> {
  const rows = await db
    .update(learners)
    .set({
      educationLevel: input.educationLevel ?? null,
      priorKnowledge: input.priorKnowledge ?? null,
      studyGoal: input.studyGoal ?? null,
      focusSystems: JSON.stringify(input.focusSystems ?? []),
      onboardedAt: NOW,
      updatedAt: NOW,
    })
    .where(eq(learners.id, learnerId))
    .returning();
  return rows[0];
}

async function getOrganRow(db: Db, learnerId: number, organId: string) {
  const rows = await db
    .select()
    .from(organMastery)
    .where(and(eq(organMastery.learnerId, learnerId), eq(organMastery.organId, organId)))
    .limit(1);
  return rows[0];
}

/** Read-modify-write the per-organ rollup and recompute the mastery score. Low
 *  contention (one learner acting on one organ at a time) makes this safe. */
async function bumpOrganMastery(
  db: Db,
  learnerId: number,
  organId: string,
  patch: (base: {
    views: number;
    lessonCompleted: number;
    lessonScore: number;
    lessonTotal: number;
    quizBest: number;
    quizTotal: number;
  }) => Partial<{
    views: number;
    lessonCompleted: number;
    lessonScore: number;
    lessonTotal: number;
    quizBest: number;
    quizTotal: number;
  }>,
) {
  const existing = await getOrganRow(db, learnerId, organId);
  const base = {
    views: existing?.views ?? 0,
    lessonCompleted: existing?.lessonCompleted ?? 0,
    lessonScore: existing?.lessonScore ?? 0,
    lessonTotal: existing?.lessonTotal ?? 0,
    quizBest: existing?.quizBest ?? 0,
    quizTotal: existing?.quizTotal ?? 0,
  };
  const next = { ...base, ...patch(base) };
  const mastery = computeMastery(next);

  if (existing) {
    await db
      .update(organMastery)
      .set({ ...next, mastery, lastSeenAt: NOW })
      .where(eq(organMastery.id, existing.id));
  } else {
    await db.insert(organMastery).values({
      learnerId,
      organId,
      ...next,
      mastery,
    });
  }
}

async function bumpLessonProgress(
  db: Db,
  learnerId: number,
  lessonId: string,
  organId: string,
  patch: (base: {
    stepsCompleted: number;
    totalSteps: number;
    questionsCorrect: number;
    questionsAnswered: number;
    totalQuestions: number;
    completed: boolean;
  }) => Partial<{
    stepsCompleted: number;
    totalSteps: number;
    questionsCorrect: number;
    questionsAnswered: number;
    totalQuestions: number;
    completed: boolean;
  }>,
) {
  const rows = await db
    .select()
    .from(lessonProgress)
    .where(and(eq(lessonProgress.learnerId, learnerId), eq(lessonProgress.lessonId, lessonId)))
    .limit(1);
  const existing = rows[0];
  const base = {
    stepsCompleted: existing?.stepsCompleted ?? 0,
    totalSteps: existing?.totalSteps ?? 0,
    questionsCorrect: existing?.questionsCorrect ?? 0,
    questionsAnswered: existing?.questionsAnswered ?? 0,
    totalQuestions: existing?.totalQuestions ?? 0,
    completed: Boolean(existing?.completedAt),
  };
  const merged = { ...base, ...patch(base) };
  const completedAt = merged.completed
    ? existing?.completedAt ?? new Date().toISOString()
    : existing?.completedAt ?? null;

  if (existing) {
    await db
      .update(lessonProgress)
      .set({
        stepsCompleted: merged.stepsCompleted,
        totalSteps: merged.totalSteps,
        questionsCorrect: merged.questionsCorrect,
        questionsAnswered: merged.questionsAnswered,
        totalQuestions: merged.totalQuestions,
        completedAt,
        lastSeenAt: NOW,
      })
      .where(eq(lessonProgress.id, existing.id));
  } else {
    await db.insert(lessonProgress).values({
      learnerId,
      lessonId,
      organId,
      stepsCompleted: merged.stepsCompleted,
      totalSteps: merged.totalSteps,
      questionsCorrect: merged.questionsCorrect,
      questionsAnswered: merged.questionsAnswered,
      totalQuestions: merged.totalQuestions,
      completedAt,
    });
  }
}

/** Append the raw event, then fold it into the affected rollups. */
export async function recordEvent(
  db: Db,
  learnerId: number,
  event: ProgressEventInput,
): Promise<void> {
  const organId = event.organId ?? null;
  const lessonId = (event.meta?.lessonId as string | undefined) ?? event.refId ?? null;

  await db.insert(progressEvents).values({
    learnerId,
    kind: event.kind,
    organId,
    refId: event.refId ?? null,
    correct: event.correct === undefined ? null : event.correct ? 1 : 0,
    value: event.value ?? null,
    total: event.total ?? null,
    meta: event.meta ? JSON.stringify(event.meta) : null,
  });

  switch (event.kind) {
    case "organ_view":
      if (organId) await bumpOrganMastery(db, learnerId, organId, (b) => ({ views: b.views + 1 }));
      break;

    case "lesson_step":
      if (organId && lessonId)
        await bumpLessonProgress(db, learnerId, lessonId, organId, (b) => ({
          stepsCompleted: Math.max(b.stepsCompleted, (event.value ?? 0) + 1),
          totalSteps: Math.max(b.totalSteps, event.total ?? b.totalSteps),
        }));
      break;

    case "quiz_answer":
      if (organId && lessonId)
        await bumpLessonProgress(db, learnerId, lessonId, organId, (b) => ({
          questionsAnswered: b.questionsAnswered + 1,
          questionsCorrect: b.questionsCorrect + (event.correct ? 1 : 0),
          totalQuestions: Math.max(b.totalQuestions, event.total ?? b.totalQuestions),
        }));
      break;

    case "lesson_complete":
      if (organId && lessonId) {
        await bumpLessonProgress(db, learnerId, lessonId, organId, () => ({
          completed: true,
          totalQuestions: event.total ?? 0,
        }));
        await bumpOrganMastery(db, learnerId, organId, () => ({
          lessonCompleted: 1,
          lessonScore: event.value ?? 0,
          lessonTotal: event.total ?? 0,
        }));
      }
      break;

    case "label_quiz_complete":
      if (organId)
        await bumpOrganMastery(db, learnerId, organId, (b) => ({
          // Keep the learner's best labelling run, not their latest.
          quizBest: Math.max(b.quizBest, event.value ?? 0),
          quizTotal: Math.max(b.quizTotal, event.total ?? 0),
        }));
      break;

    default:
      // lesson_start, label_answer, quiz_complete: logged only, no rollup.
      break;
  }
}

export async function getSnapshot(
  db: Db,
  learner: Learner,
): Promise<ProgressSnapshot> {
  const learnerId = learner.id;

  const [organs, lessons, gradedRows, totalRows, dateRows, recentRows] =
    await Promise.all([
      db.select().from(organMastery).where(eq(organMastery.learnerId, learnerId)),
      db.select().from(lessonProgress).where(eq(lessonProgress.learnerId, learnerId)),
      db
        .select({
          graded: sql<number>`count(*)`,
          correct: sql<number>`sum(case when ${progressEvents.correct} = 1 then 1 else 0 end)`,
        })
        .from(progressEvents)
        .where(
          and(eq(progressEvents.learnerId, learnerId), sql`${progressEvents.correct} is not null`),
        ),
      db
        .select({ count: sql<number>`count(*)` })
        .from(progressEvents)
        .where(eq(progressEvents.learnerId, learnerId)),
      db
        .select({ day: sql<string>`date(${progressEvents.createdAt})` })
        .from(progressEvents)
        .where(eq(progressEvents.learnerId, learnerId))
        .groupBy(sql`date(${progressEvents.createdAt})`)
        .orderBy(desc(sql`date(${progressEvents.createdAt})`))
        .limit(90),
      db
        .select()
        .from(progressEvents)
        .where(eq(progressEvents.learnerId, learnerId))
        .orderBy(desc(progressEvents.createdAt), desc(progressEvents.id))
        .limit(12),
    ]);

  const graded = Number(gradedRows[0]?.graded ?? 0);
  const correct = Number(gradedRows[0]?.correct ?? 0);
  const quizAccuracy = graded > 0 ? Math.round((correct / graded) * 100) : 0;

  const averageMastery =
    organs.length > 0
      ? Math.round(organs.reduce((sum, o) => sum + o.mastery, 0) / organs.length)
      : 0;

  return {
    profile: toProfile(learner),
    totals: {
      organsStudied: organs.length,
      lessonsCompleted: lessons.filter((l) => l.completedAt).length,
      quizAccuracy,
      quizAnswers: graded,
      streakDays: currentStreak(dateRows.map((r) => r.day)),
      averageMastery,
      eventsRecorded: Number(totalRows[0]?.count ?? 0),
    },
    organs: organs
      .map((o) => ({
        organId: o.organId,
        views: o.views,
        lessonCompleted: o.lessonCompleted > 0,
        lessonScore: o.lessonScore,
        lessonTotal: o.lessonTotal,
        quizBest: o.quizBest,
        quizTotal: o.quizTotal,
        mastery: o.mastery,
        lastSeenAt: o.lastSeenAt,
      }))
      .sort((a, b) => b.mastery - a.mastery),
    lessons: lessons.map((l) => ({
      lessonId: l.lessonId,
      organId: l.organId,
      stepsCompleted: l.stepsCompleted,
      totalSteps: l.totalSteps,
      questionsCorrect: l.questionsCorrect,
      questionsAnswered: l.questionsAnswered,
      totalQuestions: l.totalQuestions,
      completed: Boolean(l.completedAt),
      lastSeenAt: l.lastSeenAt,
    })),
    recent: recentRows.map((e) => ({
      kind: e.kind as ProgressSnapshot["recent"][number]["kind"],
      organId: e.organId,
      correct: e.correct === null ? null : e.correct === 1,
      value: e.value,
      total: e.total,
      createdAt: e.createdAt,
    })),
  };
}

/** Consecutive days (ending today or yesterday) present in the given descending
 *  list of ISO dates. Yesterday still counts so a streak isn't lost until a full
 *  day is missed. */
function currentStreak(daysDesc: string[]): number {
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
