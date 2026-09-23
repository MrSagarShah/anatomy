import type { OrganId } from "../anatomy-data";

/** The kinds of learning events we record. Kept as a union so the client, the
 *  API, and the rollup logic all agree on the vocabulary. */
export type ProgressEventKind =
  | "organ_view"
  | "lesson_start"
  | "lesson_step"
  | "lesson_complete"
  | "quiz_answer"
  | "quiz_complete"
  | "label_answer"
  | "label_quiz_complete";

/** What the client POSTs to /api/progress. Identity is taken from the auth
 *  headers server-side, never trusted from the body. */
export type ProgressEventInput = {
  kind: ProgressEventKind;
  organId?: OrganId | string;
  /** Step id, question id, or lesson id, depending on `kind`. */
  refId?: string;
  correct?: boolean;
  value?: number;
  total?: number;
  meta?: Record<string, unknown>;
};

export type EducationLevel =
  | "school"
  | "university"
  | "professional"
  | "educator"
  | "curious";

export type PriorKnowledge = "beginner" | "intermediate" | "advanced";

export type StudyGoal = "exam" | "career" | "teaching" | "curiosity" | "refresh";

/** Educational background saved at onboarding. Every field is optional so the
 *  learner can skip and still get tracked. */
export type OnboardingInput = {
  educationLevel?: EducationLevel;
  priorKnowledge?: PriorKnowledge;
  studyGoal?: StudyGoal;
  focusSystems?: string[];
};

export type LearnerProfile = {
  displayName: string;
  fullName: string | null;
  locale: string;
  educationLevel: EducationLevel | null;
  priorKnowledge: PriorKnowledge | null;
  studyGoal: StudyGoal | null;
  focusSystems: string[];
  onboarded: boolean;
};

export type OrganMasterySummary = {
  organId: string;
  views: number;
  lessonCompleted: boolean;
  lessonScore: number;
  lessonTotal: number;
  quizBest: number;
  quizTotal: number;
  mastery: number;
  lastSeenAt: string;
};

export type LessonProgressSummary = {
  lessonId: string;
  organId: string;
  stepsCompleted: number;
  totalSteps: number;
  questionsCorrect: number;
  questionsAnswered: number;
  totalQuestions: number;
  completed: boolean;
  lastSeenAt: string;
};

export type RecentActivity = {
  kind: ProgressEventKind;
  organId: string | null;
  correct: boolean | null;
  value: number | null;
  total: number | null;
  createdAt: string;
};

/** Everything the dashboard needs, in one payload. */
export type ProgressSnapshot = {
  profile: LearnerProfile;
  totals: {
    organsStudied: number;
    lessonsCompleted: number;
    /** Percentage 0–100 across every graded answer. */
    quizAccuracy: number;
    quizAnswers: number;
    /** Consecutive days (ending today) with at least one event. */
    streakDays: number;
    /** Average mastery across organs the learner has touched, 0–100. */
    averageMastery: number;
    eventsRecorded: number;
  };
  organs: OrganMasterySummary[];
  lessons: LessonProgressSummary[];
  recent: RecentActivity[];
};

/** Response envelope shared by both API routes. `available: false` means the D1
 *  binding is missing (e.g. local dev) — the UI degrades quietly instead of
 *  throwing. `authenticated: false` means no ChatGPT user. */
export type ProgressResponse =
  | { available: false }
  | { available: true; authenticated: false }
  | { available: true; authenticated: true; snapshot: ProgressSnapshot };

export type LearnerResponse =
  | { available: false }
  | { available: true; authenticated: false }
  | { available: true; authenticated: true; profile: LearnerProfile };

/**
 * Mastery formula (0–100), pure so it can run on the server rollup and be
 * unit-reasoned about. Exposure is capped quickly; real mastery comes from
 * completing the lesson and scoring on the labelling quiz.
 *   exposure   up to 20  (viewing the organ)
 *   lesson     up to 40  (10 for finishing + 30 scaled by checkpoint score)
 *   quiz       up to 40  (scaled by best labelling-quiz accuracy)
 */
export function computeMastery(row: {
  views: number;
  lessonCompleted: number;
  lessonScore: number;
  lessonTotal: number;
  quizBest: number;
  quizTotal: number;
}): number {
  const exposure = Math.min(row.views, 3) * (20 / 3);
  const lessonBase = row.lessonCompleted > 0 ? 10 : 0;
  const lessonScored =
    row.lessonTotal > 0 ? (row.lessonScore / row.lessonTotal) * 30 : 0;
  const quiz = row.quizTotal > 0 ? (row.quizBest / row.quizTotal) * 40 : 0;
  return Math.max(
    0,
    Math.min(100, Math.round(exposure + lessonBase + lessonScored + quiz)),
  );
}
