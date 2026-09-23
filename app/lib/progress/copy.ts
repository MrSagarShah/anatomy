import type { EducationLevel, PriorKnowledge, StudyGoal } from "./types";

/**
 * Copy for the learner-progress feature (onboarding + dashboard).
 *
 * This lives outside the strict per-locale `UiDictionary` on purpose: adding a
 * whole feature namespace to all 12 locale files would block this work on
 * translation. Instead every locale falls back to English here, and a locale is
 * upgraded by adding its own entry to `translations` below. No layout depends on
 * string length, so the English fallback renders correctly everywhere today.
 */
export type ProgressCopy = {
  nav: string;
  profileGuest: string;
  signInCta: string;
  onboarding: {
    eyebrow: string;
    title: string;
    subtitle: string;
    levelLabel: string;
    knowledgeLabel: string;
    goalLabel: string;
    focusLabel: string;
    focusHint: string;
    skip: string;
    save: string;
    levels: Record<EducationLevel, string>;
    knowledge: Record<PriorKnowledge, string>;
    goals: Record<StudyGoal, string>;
  };
  dashboard: {
    eyebrow: string;
    title: string;
    close: string;
    empty: string;
    unavailable: string;
    guest: string;
    backgroundTitle: string;
    editBackground: string;
    stats: {
      organs: string;
      lessons: string;
      accuracy: string;
      streak: string;
      streakUnit: string;
      mastery: string;
    };
    masteryTitle: string;
    masteryHint: string;
    activityTitle: string;
    noActivity: string;
    lessonDone: string;
    quizScore: string;
    viewed: string;
    notStarted: string;
  };
  activity: Record<string, string>;
};

const en: ProgressCopy = {
  nav: "Progress",
  profileGuest: "Guest",
  signInCta: "Sign in to save progress",
  onboarding: {
    eyebrow: "Welcome",
    title: "Tell us where you're starting from",
    subtitle:
      "A few quick answers let us tailor lessons and track how far you grow. You can skip and change these anytime.",
    levelLabel: "What best describes you?",
    knowledgeLabel: "How much anatomy do you already know?",
    goalLabel: "What are you here to do?",
    focusLabel: "Systems you want to focus on",
    focusHint: "Optional — pick any that interest you",
    skip: "Skip for now",
    save: "Save & start learning",
    levels: {
      school: "School student",
      university: "University / med student",
      professional: "Healthcare professional",
      educator: "Teacher / educator",
      curious: "Curious learner",
    },
    knowledge: {
      beginner: "Just starting",
      intermediate: "Some background",
      advanced: "Advanced",
    },
    goals: {
      exam: "Prepare for an exam",
      career: "Grow in my career",
      teaching: "Teach others",
      curiosity: "Satisfy curiosity",
      refresh: "Refresh what I knew",
    },
  },
  dashboard: {
    eyebrow: "Your learning",
    title: "Progress",
    close: "Close progress",
    empty: "Start a lesson or a quiz and your growth will show up here.",
    unavailable:
      "Progress tracking isn't connected in this environment yet. Explore freely — nothing is lost.",
    guest: "Sign in with ChatGPT to save your progress and pick up where you left off.",
    backgroundTitle: "Your background",
    editBackground: "Edit",
    stats: {
      organs: "Organs studied",
      lessons: "Lessons completed",
      accuracy: "Quiz accuracy",
      streak: "Day streak",
      streakUnit: "days",
      mastery: "Avg. mastery",
    },
    masteryTitle: "Mastery by organ",
    masteryHint: "Built from views, guided lessons, and quiz scores.",
    activityTitle: "Recent activity",
    noActivity: "No activity yet.",
    lessonDone: "Completed the guided lesson",
    quizScore: "Labelling quiz",
    viewed: "Explored",
    notStarted: "Not started",
  },
  activity: {
    organ_view: "Explored",
    lesson_start: "Started a lesson",
    lesson_step: "Worked through a lesson step",
    lesson_complete: "Completed a guided lesson",
    quiz_answer: "Answered a checkpoint",
    quiz_complete: "Finished a checkpoint",
    label_answer: "Labelled a structure",
    label_quiz_complete: "Finished a labelling quiz",
  },
};

/** Locale → copy. Add entries here to translate; anything missing uses English. */
const translations: Record<string, ProgressCopy> = { en };

export function progressCopy(locale: string): ProgressCopy {
  return translations[locale] ?? en;
}
