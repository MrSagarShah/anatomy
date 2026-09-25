"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Box,
  CheckCircle2,
  CircleDashed,
  Layers3,
  Maximize2,
  RotateCcw,
  ScanLine,
  Search,
  Check,
  Crosshair,
  Sparkles,
  X,
} from "lucide-react";
import type { Hotspot, Organ } from "../i18n/merge";
import { format, type GuidedLesson, type UiDictionary } from "../i18n/types";
import type { AnatomyViewer } from "../lib/three/viewer";
import type { LessonResume, ProgressEventInput } from "../lib/progress/types";

type Props = {
  organ: Organ;
  t: UiDictionary;
  autoRotate: boolean;
  onAutoRotate: (enabled: boolean) => void;
  compare: boolean;
  onCompare: () => void;
  quizActive: boolean;
  onQuizExit: () => void;
  lesson: GuidedLesson | null;
  onLessonExit: () => void;
  /** Reopen a guided lesson at the last recorded step or checkpoint. */
  resume?: LessonResume;
  /** Records a learning event (best-effort, may be a no-op when tracking is off). */
  onEvent?: (event: ProgressEventInput) => void;
};

/** Stable no-op so children can always call the recorder unconditionally. */
const noEvent: (event: ProgressEventInput) => void = () => {};

/** Fisher–Yates. The quiz asks for every structure once, in a fresh order. */
function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

type PickRef = { current: (hotspot: Hotspot) => void };

/**
 * The labelling quiz. Owns its own round state and is mounted with a `key` per
 * organ, so switching specimens restarts it without a resetting effect.
 */
function LabelQuiz({
  hotspots, t, pickRef, flash, screenY, onExit, onEvent, organId,
}: {
  hotspots: Hotspot[];
  t: UiDictionary;
  pickRef: PickRef;
  flash: (id: string, correct: boolean) => void;
  screenY: (id: string) => number | null;
  onExit: () => void;
  onEvent: (event: ProgressEventInput) => void;
  organId: string;
}) {
  const [seed, setSeed] = useState(0);
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [answer, setAnswer] = useState<{ correct: boolean; picked: string; target: string; atTop: boolean } | null>(null);
  const [results, setResults] = useState<boolean[]>([]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const order = useMemo(() => shuffle(hotspots), [hotspots, seed]);
  const target = order[step];
  const finished = step >= order.length;

  // Report the final score once the round completes (each round has a fresh
  // `seed`, so a retry reports again). Depends only on the finished transition.
  const reportedSeed = useRef(-1);
  useEffect(() => {
    if (finished && order.length > 0 && reportedSeed.current !== seed) {
      reportedSeed.current = seed;
      onEvent({ kind: "label_quiz_complete", organId, value: score, total: order.length });
    }
  }, [finished, onEvent, order.length, organId, score, seed]);

  // Refreshed after every render so the viewer's long-lived callback always
  // sees the current question. Writing a ref in an effect is safe; writing one
  // during render is not.
  useEffect(() => {
    pickRef.current = (hotspot) => {
      if (!target || answer) return;   // ignore extra clicks while feedback shows
      const correct = hotspot.id === target.id;
      onEvent({ kind: "label_answer", organId, refId: target.id, correct });
      flash(hotspot.id, correct);
      // A miss also marks where the answer actually was — otherwise the learner
      // is told they were wrong but never shown the right structure.
      if (!correct) flash(target.id, true);
      // Sit the card on the opposite half from the structure being revealed —
      // otherwise the panel hides the dot it is telling the learner to look at.
      const revealed = screenY(correct ? hotspot.id : target.id);
      setAnswer({ correct, picked: hotspot.label, target: target.label, atTop: (revealed ?? 0) > 0.55 });
      setResults((list) => [...list, correct]);
      if (correct) setScore((value) => value + 1);
      window.setTimeout(() => {
        setAnswer(null);
        setStep((value) => value + 1);
      }, correct ? 1200 : 2400);   // a miss carries more to read
    };
  });

  const retry = () => {
    setStep(0);
    setScore(0);
    setAnswer(null);
    setResults([]);
    setSeed((value) => value + 1);
  };

  return (
    <>
      {target && (
        <div className="quiz-bar" role="status" aria-live="polite">
          <div className="quiz-prompt">
            <em>{t.quiz.find}</em>
            <strong>{target.label}</strong>
          </div>
          <div className="quiz-meta">
            <span className="quiz-progress">{format(t.quiz.progress, { current: String(step + 1), total: String(order.length) })}</span>
            <ol className="quiz-pips" aria-hidden>
              {order.map((hotspot, index) => (
                <li
                  key={hotspot.id}
                  className={index < results.length ? (results[index] ? "ok" : "no") : index === step ? "now" : ""}
                />
              ))}
            </ol>
            <small>{t.quiz.hint}</small>
          </div>
          <button type="button" onClick={onExit} aria-label={t.quiz.exit}><X size={16} /></button>
        </div>
      )}

      {answer && (
        <div className={`quiz-answer ${answer.correct ? "ok" : "no"} ${answer.atTop ? "at-top" : ""}`} role="status" aria-live="assertive">
          <span className="quiz-answer-icon">{answer.correct ? <Check size={22} /> : <X size={22} />}</span>
          <div>
            <strong>{answer.correct ? t.quiz.correct : t.quiz.wrong}</strong>
            {answer.correct ? (
              <span>{answer.target}</span>
            ) : (
              <>
                <span>{format(t.quiz.reveal, { label: answer.picked })}</span>
                <span className="quiz-answer-hint">{format(t.quiz.answer, { label: answer.target })}</span>
              </>
            )}
          </div>
        </div>
      )}

      {finished && (
        <div className="quiz-summary" role="dialog" aria-modal="true">
          <span className="modal-icon">{score === order.length ? "★" : "✓"}</span>
          <h2>{t.quiz.done}</h2>
          <p>{format(t.quiz.score, { score: String(score), total: String(order.length) })}</p>
          <div className="quiz-summary-actions">
            <button type="button" className="lesson-button" onClick={retry}>{t.quiz.retry}</button>
            <button type="button" onClick={onExit}>{t.quiz.exit}</button>
          </div>
        </div>
      )}
    </>
  );
}

/** `?authoring=1` is read from the URL without a hydration mismatch. */
function useAuthoringFlag() {
  return useSyncExternalStore(
    () => () => {},
    () => new URLSearchParams(window.location.search).get("authoring") === "1",
    () => false,
  );
}

function lastIndex(count: number): number {
  return Math.max(0, count - 1);
}

function resumePhase(
  resume: LessonResume | undefined,
): "overview" | "steps" | "questions" {
  if (!resume || resume.completed) return "overview";
  if (resume.questionsAnswered > 0) return "questions";
  if (resume.stepsCompleted > 0) return "steps";
  return "overview";
}

function GuidedLessonPanel({
  lesson,
  onFocus,
  onExit,
  onEvent,
  organId,
  resume,
}: {
  lesson: GuidedLesson;
  onFocus: (hotspotId: string | null) => void;
  onExit: () => void;
  onEvent: (event: ProgressEventInput) => void;
  organId: string;
  resume?: LessonResume;
}) {
  const [phase, setPhase] = useState<"overview" | "steps" | "questions" | "complete">(
    () => resumePhase(resume),
  );
  const [stepIndex, setStepIndex] = useState(() => {
    if (!resume || resume.completed || resume.questionsAnswered > 0 || resume.stepsCompleted <= 0) {
      return 0;
    }
    return Math.min(resume.stepsCompleted, lastIndex(lesson.steps.length));
  });
  const [questionIndex, setQuestionIndex] = useState(() => {
    if (!resume || resume.completed || resume.questionsAnswered <= 0) return 0;
    return Math.min(resume.questionsAnswered, lastIndex(lesson.questions.length));
  });
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const headingRef = useRef<HTMLHeadingElement>(null);
  const step = lesson.steps[stepIndex];
  const question = lesson.questions[questionIndex];
  const answer = question ? answers[question.id] : undefined;
  const score = lesson.questions.filter((item) => answers[item.id] === item.answerId).length;

  // Emit completion once when the learner reaches the summary. Meta carries the
  // lesson id so the rollup can attribute steps/questions to this lesson.
  const completeReported = useRef(false);
  useEffect(() => {
    if (phase === "complete" && !completeReported.current) {
      completeReported.current = true;
      onEvent({
        kind: "lesson_complete",
        organId,
        refId: lesson.id,
        value: score,
        total: lesson.questions.length,
        meta: { lessonId: lesson.id },
      });
    }
    if (phase === "overview") completeReported.current = false;
  }, [phase, onEvent, organId, lesson.id, lesson.questions.length, score]);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, [phase, stepIndex, questionIndex]);

  useEffect(() => {
    if (phase === "steps") onFocus(step?.hotspotId ?? null);
    else if (phase === "questions" && answer) onFocus(question?.hotspotId ?? null);
    else onFocus(null);
  }, [answer, onFocus, phase, question?.hotspotId, step?.hotspotId]);

  const begin = () => {
    onEvent({ kind: "lesson_start", organId, refId: lesson.id, meta: { lessonId: lesson.id } });
    setStepIndex(0);
    setPhase("steps");
  };

  const nextStep = () => {
    onEvent({
      kind: "lesson_step",
      organId,
      refId: step?.id,
      value: stepIndex,
      total: lesson.steps.length,
      meta: { lessonId: lesson.id },
    });
    if (stepIndex < lesson.steps.length - 1) setStepIndex((value) => value + 1);
    else {
      setQuestionIndex(0);
      setPhase("questions");
    }
  };

  const continueQuestion = () => {
    if (questionIndex < lesson.questions.length - 1) setQuestionIndex((value) => value + 1);
    else setPhase("complete");
  };

  const restart = () => {
    setAnswers({});
    setQuestionIndex(0);
    setStepIndex(0);
    setPhase("overview");
  };

  return (
    <section className="guided-lesson" aria-labelledby="guided-lesson-title">
      <button className="guided-lesson-close" type="button" onClick={onExit} aria-label={lesson.labels.exit}>
        <X size={17} />
      </button>

      {phase === "overview" && (
        <div className="guided-lesson-page guided-lesson-overview">
          <span className="guided-lesson-icon"><BookOpen size={19} /></span>
          <em>{lesson.eyebrow}</em>
          <h2 id="guided-lesson-title" ref={headingRef} tabIndex={-1}>{lesson.title}</h2>
          <p>{lesson.summary}</p>
          <span className="guided-duration">{lesson.duration}</span>
          <div className="guided-objectives">
            <strong>{lesson.labels.objectives}</strong>
            <ul>{lesson.objectives.map((objective) => <li key={objective}>{objective}</li>)}</ul>
          </div>
          <button className="guided-primary" type="button" onClick={begin}>
            {lesson.labels.begin} <ArrowRight size={15} />
          </button>
        </div>
      )}

      {phase === "steps" && step && (
        <div className="guided-lesson-page">
          <div className="guided-progress" aria-label={format(lesson.labels.stepProgress, { current: String(stepIndex + 1), total: String(lesson.steps.length) })}>
            {lesson.steps.map((item, index) => <i key={item.id} className={index <= stepIndex ? "active" : ""} />)}
          </div>
          <div className="guided-step-meta">
            <span>{format(lesson.labels.stepProgress, { current: String(stepIndex + 1), total: String(lesson.steps.length) })}</span>
            <em>{step.eyebrow}</em>
          </div>
          <h2 id="guided-lesson-title" ref={headingRef} tabIndex={-1}>{step.title}</h2>
          <p>{step.body}</p>
          {step.route && <div className="guided-route"><span>{lesson.labels.flow}</span><strong>{step.route}</strong></div>}
          <aside className="guided-insight"><Sparkles size={15} /><span>{step.insight}</span></aside>
          <div className="guided-actions">
            <button type="button" onClick={() => stepIndex === 0 ? setPhase("overview") : setStepIndex((value) => value - 1)}>
              <ArrowLeft size={15} /> {lesson.labels.previous}
            </button>
            <button className="guided-primary" type="button" onClick={nextStep}>
              {stepIndex === lesson.steps.length - 1 ? lesson.labels.checkpoint : lesson.labels.next} <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {phase === "questions" && question && (
        <div className="guided-lesson-page guided-question">
          <em>{lesson.labels.checkpoint}</em>
          <span className="guided-question-progress">
            {format(lesson.labels.questionProgress, { current: String(questionIndex + 1), total: String(lesson.questions.length) })}
          </span>
          <h2 id="guided-lesson-title" ref={headingRef} tabIndex={-1}>{question.prompt}</h2>
          <div className="guided-options">
            {question.options.map((option) => {
              const chosen = answer === option.id;
              const correct = answer && option.id === question.answerId;
              return (
                <button
                  key={option.id}
                  type="button"
                  className={`${chosen ? "chosen" : ""} ${correct ? "correct" : ""}`}
                  onClick={() => {
                    if (answer) return;
                    const correct = option.id === question.answerId;
                    const nextAnswers = { ...answers, [question.id]: option.id };
                    setAnswers(nextAnswers);
                    onEvent({
                      kind: "quiz_answer",
                      organId,
                      refId: question.id,
                      correct,
                      total: lesson.questions.length,
                      meta: { lessonId: lesson.id },
                    });
                    // The summary also fires lesson_complete; this marks the
                    // checkpoint itself so the activity log and rollup agree.
                    if (questionIndex >= lesson.questions.length - 1) {
                      const nextScore = lesson.questions.filter(
                        (item) => nextAnswers[item.id] === item.answerId,
                      ).length;
                      onEvent({
                        kind: "quiz_complete",
                        organId,
                        refId: lesson.id,
                        value: nextScore,
                        total: lesson.questions.length,
                        meta: { lessonId: lesson.id },
                      });
                    }
                  }}
                  disabled={Boolean(answer)}
                >
                  <span>{option.label}</span>
                  {correct && <CheckCircle2 size={17} />}
                </button>
              );
            })}
          </div>
          {answer && (
            <div className={`guided-feedback ${answer === question.answerId ? "correct" : "incorrect"}`} role="status">
              <strong>{answer === question.answerId ? lesson.labels.correct : lesson.labels.incorrect}</strong>
              <p>{question.explanation}</p>
            </div>
          )}
          {answer && (
            <button className="guided-primary guided-continue" type="button" onClick={continueQuestion}>
              {lesson.labels.continue} <ArrowRight size={15} />
            </button>
          )}
        </div>
      )}

      {phase === "complete" && (
        <div className="guided-lesson-page guided-complete">
          <span className="guided-lesson-icon complete"><CheckCircle2 size={22} /></span>
          <em>{lesson.labels.complete}</em>
          <h2 id="guided-lesson-title" ref={headingRef} tabIndex={-1}>{lesson.title}</h2>
          <p>{format(lesson.labels.score, { score: String(score), total: String(lesson.questions.length) })}</p>
          <div className="guided-source-list">
            <strong>{lesson.labels.sources}</strong>
            {lesson.sources.map((source) => (
              <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label}</a>
            ))}
            <small>{format(lesson.labels.reviewed, { date: lesson.evidenceReviewedAt })}</small>
            <small>{lesson.reviewNote}</small>
          </div>
          <div className="guided-actions stacked">
            <button type="button" onClick={restart}>{lesson.labels.retry}</button>
            <button className="guided-primary" type="button" onClick={onExit}>{lesson.labels.exit}</button>
          </div>
        </div>
      )}
    </section>
  );
}

export function OrganViewer({ organ, t, autoRotate, onAutoRotate, compare, onCompare, quizActive, onQuizExit, lesson, onLessonExit, resume, onEvent }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<AnatomyViewer | null>(null);
  const organRef = useRef(organ);
  const autoRotateRef = useRef(autoRotate);
  const canvasLabelRef = useRef(t.viewer.canvas);
  const [selected, setSelected] = useState<Hotspot | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [slowLoad, setSlowLoad] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);

  // Opt-in coordinate probe for placing hotspots — not a user-facing feature.
  const authoring = useAuthoringFlag();
  const authoringRef = useRef(authoring);
  const [authorPoint, setAuthorPoint] = useState<{ x: number; y: number; z: number } | null>(null);
  const [copied, setCopied] = useState(false);

  // The viewer captures its callbacks once, so live handlers go through refs.
  const pickRef = useRef<(hotspot: Hotspot) => void>(() => {});
  const authorRef = useRef<(point: { x: number; y: number; z: number }) => void>(() => {});
  const focusLessonHotspot = useCallback((id: string | null) => {
    setActiveTool(null);
    viewerRef.current?.focusHotspot(id);
  }, []);
  useEffect(() => {
    authorRef.current = setAuthorPoint;
  }, []);
  useEffect(() => {
    authoringRef.current = authoring;
  }, [authoring]);

  // A typical organ is ready well inside a second — flashing a loading panel for
  // that reads as jank. It only appears if the fetch is genuinely slow; the flag
  // is cleared by onLoading when the next load starts.
  useEffect(() => {
    if (!loading) return;
    const timer = window.setTimeout(() => setSlowLoad(true), 900);
    return () => window.clearTimeout(timer);
  }, [loading]);

  useEffect(() => {
    organRef.current = organ;
  }, [organ]);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  useEffect(() => {
    canvasLabelRef.current = t.viewer.canvas;
    viewerRef.current?.setCanvasLabel(t.viewer.canvas);
  }, [t.viewer.canvas]);

  useEffect(() => {
    let cancelled = false;
    let viewer: AnatomyViewer | null = null;

    void import("../lib/three/viewer").then(({ AnatomyViewer: Viewer }) => {
      if (cancelled || !mountRef.current) return;
      viewer = new Viewer(mountRef.current, {
        onSelect: setSelected,
        onLoading: (isLoading, value) => {
          setLoading(isLoading);
          setProgress(value);
          if (isLoading) setSlowLoad(false);
        },
        onPick: (hotspot) => pickRef.current(hotspot),
        onAuthorPoint: (point) => authorRef.current(point),
      });
      viewerRef.current = viewer;
      viewer.setCanvasLabel(canvasLabelRef.current);
      viewer.setAutoRotate(autoRotateRef.current);
      viewer.setAuthoring(authoringRef.current);
      const current = organRef.current;
      viewer.setOrgan(current.model, current.hotspots, current.accent).catch(() => {
        setLoading(false);
        setProgress(0);
      });
    });

    return () => {
      cancelled = true;
      viewerRef.current = null;
      viewer?.dispose();
    };
  }, []);

  useEffect(() => {
    viewerRef.current?.setOrgan(organ.model, organ.hotspots, organ.accent).catch(() => {
      setLoading(false);
      setProgress(0);
    });
  }, [organ]);

  // A spinning specimen makes "click the mitral valve" a game of chance, so the
  // quiz holds the model still and restores the user's setting on exit.
  useEffect(() => viewerRef.current?.setAutoRotate(autoRotate && !quizActive && !lesson), [autoRotate, lesson, quizActive]);
  useEffect(() => viewerRef.current?.setQuizMode(quizActive), [quizActive]);
  useEffect(() => viewerRef.current?.setAuthoring(authoring), [authoring]);


  // The viewer drives the callout's position directly, so a spinning model
  // never costs a React render.
  const calloutRef = useCallback((node: HTMLDivElement | null) => {
    viewerRef.current?.attachCallout(node);
  }, []);

  const handleTool = (tool: string) => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    if (tool === "rotate") onAutoRotate(!autoRotate);
    if (tool === "zoom") viewer.zoom(-1);
    if (tool === "isolate") setActiveTool(viewer.toggleIsolate() ? tool : null);
    if (tool === "section") setActiveTool(viewer.toggleCrossSection() ? tool : null);
    if (tool === "layers") setActiveTool(viewer.toggleLayers() ? tool : null);
    if (tool === "compare") onCompare();
    if (tool === "reset") {
      viewer.reset();
      setActiveTool(null);
    }
  };

  const tools = [
    { id: "rotate", label: t.tools.rotate, icon: RotateCcw },
    { id: "zoom", label: t.tools.zoom, icon: Search },
    { id: "isolate", label: t.tools.isolate, icon: CircleDashed },
    { id: "section", label: t.tools.section, icon: ScanLine },
    { id: "layers", label: t.tools.layers, icon: Layers3 },
    { id: "compare", label: t.tools.compare, icon: Box },
    { id: "reset", label: t.tools.reset, icon: RotateCcw },
  ];

  return (
    <section
      className={`viewer-shell ${lesson ? "lesson-active" : ""}`}
      aria-label={format(t.viewer.title, { organ: organ.name })}
      data-lesson-focus={lesson ? selected?.id ?? "" : undefined}
      data-lesson-view={lesson ? "surface" : undefined}
      data-lesson-hotspots={lesson ? "focused" : undefined}
    >
      <div className="viewer-glow" style={{ "--organ-accent": organ.accent } as React.CSSProperties} />
      <div ref={mountRef} className="three-mount" />

      {lesson && (
        <GuidedLessonPanel
          key={lesson.id}
          lesson={lesson}
          organId={organ.id}
          resume={resume}
          onEvent={onEvent ?? noEvent}
          onFocus={focusLessonHotspot}
          onExit={() => {
            viewerRef.current?.clearLessonFocus();
            onLessonExit();
          }}
        />
      )}

      {lesson && selected && (
        <div className="lesson-target" role="status" aria-live="polite">
          <Crosshair size={17} />
          <span><small>{lesson.labels.showing}</small><strong>{selected.label}</strong></span>
          <em>{lesson.labels.anteriorView}</em>
        </div>
      )}

      {!lesson && (
      <div className="viewer-tools" aria-label={t.tools.label}>
        {tools.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className={`tool-button ${(activeTool === id || (id === "compare" && compare)) ? "active" : ""}`}
            onClick={() => handleTool(id)}
            aria-pressed={activeTool === id || (id === "compare" && compare)}
            title={label}
          >
            <Icon size={19} strokeWidth={1.65} />
            <span>{label}</span>
          </button>
        ))}
      </div>
      )}

      {!quizActive && !lesson && (
      <aside className="tip-note" aria-label={t.viewer.tip}>
        <span><Sparkles size={15} /> {t.viewer.tip}</span>
        <p>{t.viewer.tipDrag}<br />{t.viewer.tipScroll}<br />{t.viewer.tipClick}</p>
      </aside>
      )}

      {selected && !quizActive && (
        <div className={`hotspot-callout ${lesson ? "lesson-callout" : ""}`} ref={calloutRef} data-side="right">
          <div className="callout-body" style={{ "--hotspot-color": selected.color } as React.CSSProperties}>
            {!lesson && (
              <button className="callout-close" type="button" onClick={() => viewerRef.current?.clearSelection()} aria-label={t.modal.close}>
                <X size={13} />
              </button>
            )}
            <b>{selected.label}</b>
            <small>{selected.detail}</small>
          </div>
        </div>
      )}

      {/* Screen-reader equivalent of the dots, which live in the canvas. */}
      <ul className="hotspot-index" aria-label={t.viewer.structures}>
        {organ.hotspots.map((hotspot) => (
          <li key={hotspot.id}>{hotspot.label}: {hotspot.detail}</li>
        ))}
      </ul>

      {quizActive && !lesson && (
        <LabelQuiz
          key={organ.id}
          hotspots={organ.hotspots}
          organId={organ.id}
          onEvent={onEvent ?? noEvent}
          t={t}
          pickRef={pickRef}
          flash={(id, correct) => viewerRef.current?.flash(id, correct)}
          screenY={(id) => viewerRef.current?.hotspotScreenY(id) ?? null}
          onExit={onQuizExit}
        />
      )}

      {authoring && !lesson && (
        <div className="authoring-panel">
          <span><Crosshair size={13} /> authoring</span>
          {authorPoint ? (
            <>
              <code>{`{ id: "", ta: "", position: [${authorPoint.x}, ${authorPoint.y}, ${authorPoint.z}], color: "#ee7c6a" },`}</code>
              <button
                type="button"
                onClick={() => {
                  void navigator.clipboard
                    .writeText(`{ id: "", ta: "", position: [${authorPoint.x}, ${authorPoint.y}, ${authorPoint.z}], color: "#ee7c6a" },`)
                    .then(() => { setCopied(true); window.setTimeout(() => setCopied(false), 1200); });
                }}
              >
                {copied ? "copied" : "copy"}
              </button>
            </>
          ) : (
            <code>click the model to sample a point</code>
          )}
        </div>
      )}

      {loading && slowLoad && (
        <div className="model-loader" role="status" aria-live="polite">
          <div className="loader-orbit"><Maximize2 size={20} /></div>
          <strong>{format(t.viewer.loading, { organ: organ.name })}</strong>
          <span>{Math.max(8, Math.round(progress * 100))}%</span>
        </div>
      )}

      {!quizActive && !lesson && (
      <button className="auto-rotate" type="button" onClick={() => onAutoRotate(!autoRotate)} aria-pressed={autoRotate}>
        <RotateCcw size={14} /> {t.viewer.autoRotate}
        <span className={`switch ${autoRotate ? "on" : ""}`}><i /></span>
      </button>
      )}

      {!lesson && (
        <div className="view-caption">
          <span>{t.viewer.caption}</span>
          <strong>{organ.scientificName}</strong>
        </div>
      )}
    </section>
  );
}
