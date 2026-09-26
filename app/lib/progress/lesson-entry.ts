import type { LessonResume, PriorKnowledge } from "./types";

export function resumePhase(
  resume: LessonResume | undefined,
): "overview" | "steps" | "questions" {
  if (!resume || resume.completed) return "overview";
  if (resume.questionsAnswered > 0) return "questions";
  if (resume.stepsCompleted > 0) return "steps";
  return "overview";
}

/**
 * Advanced learners skip the orientation card on a fresh start. Resume and
 * completed retries still open the overview so they can review.
 */
export function lessonEntryPhase(
  resume: LessonResume | undefined,
  priorKnowledge?: PriorKnowledge | null,
): "overview" | "steps" | "questions" {
  if (resume?.completed) return "overview";
  const inProgress = Boolean(
    resume && (resume.stepsCompleted > 0 || resume.questionsAnswered > 0),
  );
  if (inProgress) return resumePhase(resume);
  if (priorKnowledge === "advanced") return "steps";
  return "overview";
}
