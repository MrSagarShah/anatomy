"use client";

import { useState } from "react";
import { GraduationCap, Sparkles, X } from "lucide-react";
import type { ProgressCopy } from "../lib/progress/copy";
import type {
  EducationLevel,
  OnboardingInput,
  PriorKnowledge,
  StudyGoal,
} from "../lib/progress/types";

type Props = {
  copy: ProgressCopy;
  /** Body systems the learner can choose to focus on, derived from the corpus. */
  focusOptions: string[];
  /** Seed chips when editing an existing background so the form is not blank. */
  initial?: {
    educationLevel?: EducationLevel | null;
    priorKnowledge?: PriorKnowledge | null;
    studyGoal?: StudyGoal | null;
    focusSystems?: string[];
  };
  onSubmit: (input: OnboardingInput) => void;
  onSkip: () => void;
};

const LEVEL_ORDER: EducationLevel[] = [
  "school",
  "university",
  "professional",
  "educator",
  "curious",
];
const KNOWLEDGE_ORDER: PriorKnowledge[] = ["beginner", "intermediate", "advanced"];
const GOAL_ORDER: StudyGoal[] = ["exam", "career", "teaching", "curiosity", "refresh"];

/** First-run capture of the learner's educational background. Everything is
 *  optional — the learner can skip and is still tracked. */
export function OnboardingModal({ copy, focusOptions, onSubmit, onSkip, initial }: Props) {
  const c = copy.onboarding;
  const [level, setLevel] = useState<EducationLevel | null>(initial?.educationLevel ?? null);
  const [knowledge, setKnowledge] = useState<PriorKnowledge | null>(initial?.priorKnowledge ?? null);
  const [goal, setGoal] = useState<StudyGoal | null>(initial?.studyGoal ?? null);
  const [focus, setFocus] = useState<Set<string>>(() => new Set(initial?.focusSystems ?? []));

  const toggleFocus = (slug: string) =>
    setFocus((current) => {
      const next = new Set(current);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });

  const submit = () =>
    onSubmit({
      educationLevel: level ?? undefined,
      priorKnowledge: knowledge ?? undefined,
      studyGoal: goal ?? undefined,
      focusSystems: [...focus],
    });

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onSkip}>
      <section
        className="learning-modal pg-onboarding"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pg-onboarding-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="modal-close" onClick={onSkip} aria-label={c.skip}>
          <X size={18} />
        </button>
        <span className="modal-icon"><GraduationCap size={20} /></span>
        <em>{c.eyebrow}</em>
        <h2 id="pg-onboarding-title">{c.title}</h2>
        <p className="pg-onboarding-sub">{c.subtitle}</p>

        <fieldset className="pg-field">
          <legend>{c.levelLabel}</legend>
          <div className="pg-chips">
            {LEVEL_ORDER.map((value) => (
              <button
                key={value}
                type="button"
                className={`pg-chip ${level === value ? "on" : ""}`}
                aria-pressed={level === value}
                onClick={() => setLevel(value)}
              >
                {c.levels[value]}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="pg-field">
          <legend>{c.knowledgeLabel}</legend>
          <div className="pg-chips">
            {KNOWLEDGE_ORDER.map((value) => (
              <button
                key={value}
                type="button"
                className={`pg-chip ${knowledge === value ? "on" : ""}`}
                aria-pressed={knowledge === value}
                onClick={() => setKnowledge(value)}
              >
                {c.knowledge[value]}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="pg-field">
          <legend>{c.goalLabel}</legend>
          <div className="pg-chips">
            {GOAL_ORDER.map((value) => (
              <button
                key={value}
                type="button"
                className={`pg-chip ${goal === value ? "on" : ""}`}
                aria-pressed={goal === value}
                onClick={() => setGoal(value)}
              >
                {c.goals[value]}
              </button>
            ))}
          </div>
        </fieldset>

        {focusOptions.length > 0 && (
          <fieldset className="pg-field">
            <legend>{c.focusLabel} <small>{c.focusHint}</small></legend>
            <div className="pg-chips">
              {focusOptions.map((slug) => (
                <button
                  key={slug}
                  type="button"
                  className={`pg-chip ${focus.has(slug) ? "on" : ""}`}
                  aria-pressed={focus.has(slug)}
                  onClick={() => toggleFocus(slug)}
                >
                  {slug}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        <div className="pg-onboarding-actions">
          <button type="button" onClick={onSkip}>{c.skip}</button>
          <button type="button" className="lesson-button" onClick={submit}>
            {c.save} <Sparkles size={15} />
          </button>
        </div>
      </section>
    </div>
  );
}
