"use client";

import { Award, BookCheck, CircleUser, Flame, Pencil, Target, X } from "lucide-react";
import type { ProgressCopy } from "../lib/progress/copy";
import type { ProgressState } from "../lib/progress/client";
import { recommendNext, type RecommendReason } from "../lib/progress/recommend";

type Props = {
  copy: ProgressCopy;
  state: ProgressState;
  /** organId → localized organ name, for readable labels. */
  organLabel: (organId: string) => string;
  /** Catalog used to recommend an untouched / focus-system organ. */
  catalog?: { id: string; system: string }[];
  onClose: () => void;
  onEditBackground: () => void;
  onContinueLesson?: (organId: string) => void;
  onSelectOrgan?: (organId: string) => void;
  onKeepGoing?: () => void;
};

function Stat({
  icon,
  value,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  onClick?: () => void;
}) {
  const body = (
    <>
      <span className="pg-stat-icon">{icon}</span>
      <strong>{value}</strong>
      <small>{label}</small>
    </>
  );
  if (onClick) {
    return (
      <button type="button" className="pg-stat pg-stat-button" onClick={onClick}>
        {body}
      </button>
    );
  }
  return <div className="pg-stat">{body}</div>;
}

function reasonLabel(
  reason: RecommendReason,
  d: ProgressCopy["dashboard"],
  focusLabel: string,
): string {
  if (reason === "continue") return d.resume;
  if (reason === "start") return d.notStarted;
  if (reason === "focus") return focusLabel;
  return d.recommendedHint;
}

/** The learner's growth panel: background, headline stats, per-organ mastery,
 *  and recent activity. Degrades to a message when tracking is unavailable or
 *  the learner is a guest. */
export function ProgressDashboard({
  copy,
  state,
  organLabel,
  catalog,
  onClose,
  onEditBackground,
  onContinueLesson,
  onSelectOrgan,
  onKeepGoing,
}: Props) {
  const d = copy.dashboard;
  const signInHref = `/signin-with-chatgpt?return_to=${encodeURIComponent(
    typeof window !== "undefined" ? window.location.pathname : "/",
  )}`;

  let body: React.ReactNode;
  if (state.available === false) {
    body = <p className="pg-note">{d.unavailable}</p>;
  } else if (!state.authenticated || !state.snapshot) {
    body = (
      <div className="pg-guest">
        <CircleUser size={30} />
        <p>{d.guest}</p>
        <a className="lesson-button" href={signInHref}>{copy.signInCta}</a>
      </div>
    );
  } else {
    const { profile, totals, organs, lessons, recent } = state.snapshot;
    const backgroundBits = [
      profile.educationLevel && copy.onboarding.levels[profile.educationLevel],
      profile.priorKnowledge && copy.onboarding.knowledge[profile.priorKnowledge],
      profile.studyGoal && copy.onboarding.goals[profile.studyGoal],
    ].filter(Boolean) as string[];
    const nothingYet = totals.eventsRecorded === 0;
    const recommendOrgans =
      catalog && catalog.length > 0
        ? catalog
        : organs.map((o) => ({ id: o.organId, system: "" }));
    const recommended = recommendNext({
      organs: recommendOrgans,
      mastery: organs.map((o) => ({
        organId: o.organId,
        mastery: o.mastery,
        lessonCompleted: o.lessonCompleted,
      })),
      focusSystems: profile.focusSystems,
      priorKnowledge: profile.priorKnowledge,
    });
    const openRecommended = () => {
      if (!recommended) {
        onKeepGoing?.();
        return;
      }
      if (onSelectOrgan) onSelectOrgan(recommended.organId);
      else if (onContinueLesson) onContinueLesson(recommended.organId);
      else onKeepGoing?.();
    };
    const sortedLessons = [...lessons].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return b.lastSeenAt.localeCompare(a.lastSeenAt);
    });

    body = (
      <>
        <div className="pg-background">
          <div>
            <span className="pg-background-name">{profile.displayName}</span>
            <p>{backgroundBits.length ? backgroundBits.join(" · ") : d.empty}</p>
          </div>
          <button type="button" onClick={onEditBackground} aria-label={d.editBackground}>
            <Pencil size={14} /> {d.editBackground}
          </button>
        </div>

        <div className="pg-stats">
          <Stat icon={<CircleUser size={16} />} value={String(totals.organsStudied)} label={d.stats.organs} />
          <Stat icon={<BookCheck size={16} />} value={String(totals.lessonsCompleted)} label={d.stats.lessons} />
          <Stat icon={<Target size={16} />} value={`${totals.quizAccuracy}%`} label={d.stats.accuracy} />
          <Stat icon={<Flame size={16} />} value={String(totals.streakDays)} label={d.stats.streak} onClick={onKeepGoing} />
          <Stat icon={<Award size={16} />} value={`${totals.averageMastery}%`} label={d.stats.mastery} onClick={onKeepGoing} />
        </div>

        {recommended && (
          <section className="pg-section">
            <header>
              <h3>{d.recommended}</h3>
              <small>{d.recommendedHint}</small>
            </header>
            <div className="pg-background">
              <div>
                <span className="pg-background-name">{organLabel(recommended.organId)}</span>
                <p>{reasonLabel(recommended.reason, d, copy.onboarding.focusLabel)}</p>
              </div>
              <button type="button" onClick={openRecommended}>
                {recommended.reason === "continue" ? d.resume : d.keepGoing}
              </button>
            </div>
          </section>
        )}

        {nothingYet ? (
          <p className="pg-note">{d.empty}</p>
        ) : (
          <>
            {sortedLessons.length > 0 && (
              <section className="pg-section">
                <header>
                  <h3>{d.lessonsTitle}</h3>
                </header>
                <ul className="pg-activity">
                  {sortedLessons.map((lesson) => {
                    const open = () => {
                      if (onContinueLesson) onContinueLesson(lesson.organId);
                      else onSelectOrgan?.(lesson.organId);
                    };
                    const progress =
                      lesson.totalSteps > 0
                        ? `${lesson.stepsCompleted}/${lesson.totalSteps}`
                        : lesson.questionsAnswered > 0
                          ? `${lesson.questionsAnswered}/${lesson.totalQuestions || "–"}`
                          : d.notStarted;
                    return (
                      <li key={lesson.lessonId}>
                        <button type="button" className="pg-row-button" onClick={open}>
                          <span>
                            {organLabel(lesson.organId)}
                            {" · "}
                            {lesson.completed ? d.lessonDone : progress}
                          </span>
                          {!lesson.completed && <b>{d.resume}</b>}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}

            {organs.length > 0 && (
              <section className="pg-section">
                <header>
                  <h3>{d.masteryTitle}</h3>
                  <small>{d.masteryHint}</small>
                </header>
                <ul className="pg-mastery">
                  {organs.map((o) => (
                    <li key={o.organId}>
                      <button
                        type="button"
                        className="pg-row-button stacked"
                        onClick={() => onSelectOrgan?.(o.organId)}
                      >
                        <div className="pg-mastery-row">
                          <span>{organLabel(o.organId)}</span>
                          <b>{o.mastery}%</b>
                        </div>
                        <div className="pg-bar" role="progressbar" aria-valuenow={o.mastery} aria-valuemin={0} aria-valuemax={100}>
                          <i style={{ width: `${o.mastery}%` }} />
                        </div>
                        <small>
                          {o.lessonCompleted ? d.lessonDone : d.viewed}
                          {o.quizTotal > 0 ? ` · ${d.quizScore} ${o.quizBest}/${o.quizTotal}` : ""}
                        </small>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="pg-section">
              <header><h3>{d.activityTitle}</h3></header>
              {recent.length === 0 ? (
                <p className="pg-note">{d.noActivity}</p>
              ) : (
                <ul className="pg-activity">
                  {recent.map((a, i) => (
                    <li key={`${a.createdAt}-${i}`}>
                      <span>
                        {copy.activity[a.kind] ?? a.kind}
                        {a.organId ? ` · ${organLabel(a.organId)}` : ""}
                      </span>
                      {a.total != null && a.value != null && (
                        <b>{a.value}/{a.total}</b>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </>
    );
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="learning-modal pg-dashboard"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pg-dashboard-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label={d.close}><X size={18} /></button>
        <span className="modal-icon"><Award size={20} /></span>
        <em>{d.eyebrow}</em>
        <h2 id="pg-dashboard-title">{d.title}</h2>
        {body}
      </section>
    </div>
  );
}
