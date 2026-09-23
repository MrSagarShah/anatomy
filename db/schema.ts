import { sql } from "drizzle-orm";
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

/**
 * Learning-progress schema.
 *
 * Identity comes from the ChatGPT auth headers (see app/chatgpt-auth.ts), so a
 * learner is keyed by their verified email. Everything else hangs off that:
 *  - `learners`        the person + their educational background
 *  - `progressEvents`  an append-only log of everything they did (the audit trail)
 *  - `organMastery`    per-organ rollup used to draw mastery bars, one row per organ
 *  - `lessonProgress`  per-lesson rollup used to resume and score guided lessons
 *
 * The rollup tables are derived from the event log; they exist so the dashboard
 * reads a handful of rows instead of replaying every event. If a rollup is ever
 * wrong it can be rebuilt from `progressEvents` alone.
 */

export const learners = sqliteTable(
  "learners",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    /**
     * SHA-256 of the verified auth email — a stable per-user key that is NOT
     * personally identifying. We deliberately never store the raw address; the
     * app only ever shows `displayName`. See app/lib/progress/server.ts.
     */
    emailHash: text("email_hash").notNull(),
    displayName: text("display_name").notNull().default(""),
    fullName: text("full_name"),
    /** UI locale the learner was last seen in, e.g. "en", "hi". */
    locale: text("locale").notNull().default("en"),

    // --- Educational background (captured at onboarding) ---
    /** school | university | professional | educator | curious */
    educationLevel: text("education_level"),
    /** beginner | intermediate | advanced */
    priorKnowledge: text("prior_knowledge"),
    /** exam | career | teaching | curiosity | refresh */
    studyGoal: text("study_goal"),
    /** JSON array of body-system slugs the learner wants to focus on. */
    focusSystems: text("focus_systems").notNull().default("[]"),

    /** Null until the learner finishes onboarding; gates the onboarding prompt. */
    onboardedAt: text("onboarded_at"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [uniqueIndex("learners_email_hash_unique").on(table.emailHash)],
);

export const progressEvents = sqliteTable(
  "progress_events",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    learnerId: integer("learner_id")
      .notNull()
      .references(() => learners.id, { onDelete: "cascade" }),
    /**
     * organ_view | lesson_start | lesson_step | lesson_complete |
     * quiz_answer | quiz_complete | label_answer | label_quiz_complete
     */
    kind: text("kind").notNull(),
    organId: text("organ_id"),
    /** Step id, question id, or lesson id the event refers to. */
    refId: text("ref_id"),
    /** 1 correct, 0 incorrect, null when not applicable. */
    correct: integer("correct"),
    /** Score numerator (e.g. correct answers) for completion events. */
    value: integer("value"),
    /** Score denominator (e.g. total questions). */
    total: integer("total"),
    /** JSON blob for anything event-specific we don't want columns for. */
    meta: text("meta"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("progress_events_learner_idx").on(table.learnerId, table.createdAt),
  ],
);

export const organMastery = sqliteTable(
  "organ_mastery",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    learnerId: integer("learner_id")
      .notNull()
      .references(() => learners.id, { onDelete: "cascade" }),
    organId: text("organ_id").notNull(),
    views: integer("views").notNull().default(0),
    lessonCompleted: integer("lesson_completed").notNull().default(0),
    lessonScore: integer("lesson_score").notNull().default(0),
    lessonTotal: integer("lesson_total").notNull().default(0),
    /** Best labelling-quiz score seen so far, and its denominator. */
    quizBest: integer("quiz_best").notNull().default(0),
    quizTotal: integer("quiz_total").notNull().default(0),
    /** Derived 0–100 mastery, recomputed on every event. */
    mastery: integer("mastery").notNull().default(0),
    firstSeenAt: text("first_seen_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    lastSeenAt: text("last_seen_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("organ_mastery_learner_organ_unique").on(
      table.learnerId,
      table.organId,
    ),
  ],
);

export const lessonProgress = sqliteTable(
  "lesson_progress",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    learnerId: integer("learner_id")
      .notNull()
      .references(() => learners.id, { onDelete: "cascade" }),
    lessonId: text("lesson_id").notNull(),
    organId: text("organ_id").notNull(),
    stepsCompleted: integer("steps_completed").notNull().default(0),
    totalSteps: integer("total_steps").notNull().default(0),
    questionsCorrect: integer("questions_correct").notNull().default(0),
    questionsAnswered: integer("questions_answered").notNull().default(0),
    totalQuestions: integer("total_questions").notNull().default(0),
    completedAt: text("completed_at"),
    lastSeenAt: text("last_seen_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("lesson_progress_learner_lesson_unique").on(
      table.learnerId,
      table.lessonId,
    ),
  ],
);

export type Learner = typeof learners.$inferSelect;
export type NewLearner = typeof learners.$inferInsert;
export type ProgressEvent = typeof progressEvents.$inferSelect;
export type OrganMasteryRow = typeof organMastery.$inferSelect;
export type LessonProgressRow = typeof lessonProgress.$inferSelect;
