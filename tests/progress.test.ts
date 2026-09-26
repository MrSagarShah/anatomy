import assert from "node:assert/strict";
import test from "node:test";
import { hydrateLibrary, parseNotes, parseSavedOrgans, sanitizeLibrary } from "../app/lib/progress/library";
import { lessonEntryPhase, resumePhase } from "../app/lib/progress/lesson-entry";
import { currentStreak, recommendNext } from "../app/lib/progress/recommend";
import { computeMastery } from "../app/lib/progress/types";

const blank = {
  views: 0,
  lessonCompleted: 0,
  lessonScore: 0,
  lessonTotal: 0,
  quizBest: 0,
  quizTotal: 0,
};

test("computeMastery: empty row is 0", () => {
  assert.equal(computeMastery(blank), 0);
});

test("computeMastery: exposure caps at 3 views (20 points)", () => {
  assert.equal(computeMastery({ ...blank, views: 3 }), 20);
  assert.equal(computeMastery({ ...blank, views: 9 }), 20);
  assert.equal(computeMastery({ ...blank, views: 1 }), Math.round(20 / 3));
});

test("computeMastery: lesson finish is 10 plus 30 scaled by score", () => {
  assert.equal(
    computeMastery({ ...blank, views: 3, lessonCompleted: 1 }),
    30,
  );
  assert.equal(
    computeMastery({
      ...blank,
      views: 3,
      lessonCompleted: 1,
      lessonScore: 3,
      lessonTotal: 3,
    }),
    60,
  );
  assert.equal(
    computeMastery({
      ...blank,
      views: 0,
      lessonCompleted: 0,
      lessonScore: 3,
      lessonTotal: 3,
    }),
    30,
  );
});

test("computeMastery: quiz is 40 scaled by best accuracy, total capped at 100", () => {
  assert.equal(
    computeMastery({
      ...blank,
      views: 3,
      lessonCompleted: 1,
      lessonScore: 3,
      lessonTotal: 3,
      quizBest: 8,
      quizTotal: 8,
    }),
    100,
  );
  assert.equal(
    computeMastery({
      ...blank,
      views: 3,
      lessonCompleted: 1,
      lessonScore: 3,
      lessonTotal: 3,
      quizBest: 20,
      quizTotal: 8,
    }),
    100,
  );
  assert.equal(
    computeMastery({ ...blank, quizBest: 1, quizTotal: 4 }),
    10,
  );
});

const organs = [
  { id: "heart", system: "Cardiovascular" },
  { id: "brain", system: "Nervous System" },
  { id: "lungs", system: "Respiratory System" },
];

test("recommendNext: empty catalog is null", () => {
  assert.equal(recommendNext({ organs: [], mastery: [] }), null);
});

test("recommendNext: viewed organ under 80 is continue", () => {
  assert.deepEqual(
    recommendNext({
      organs,
      mastery: [{ organId: "heart", mastery: 40, lessonCompleted: false }],
    }),
    { organId: "heart", reason: "continue" },
  );
});

test("recommendNext: continue beats an untouched focus organ", () => {
  assert.deepEqual(
    recommendNext({
      organs,
      mastery: [{ organId: "heart", mastery: 40, lessonCompleted: false }],
      focusSystems: ["Respiratory System"],
    }),
    { organId: "heart", reason: "continue" },
  );
});

test("recommendNext: untouched organ in focusSystems is focus", () => {
  assert.deepEqual(
    recommendNext({
      organs,
      mastery: [{ organId: "heart", mastery: 90, lessonCompleted: true }],
      focusSystems: ["Respiratory System"],
    }),
    { organId: "lungs", reason: "focus" },
  );
});

test("recommendNext: lowest-mastery incomplete touched organ is gap", () => {
  assert.deepEqual(
    recommendNext({
      organs,
      mastery: [
        { organId: "heart", mastery: 90, lessonCompleted: false },
        { organId: "brain", mastery: 85, lessonCompleted: false },
      ],
    }),
    { organId: "brain", reason: "gap" },
  );
});

test("recommendNext: first organ with no mastery row is start", () => {
  assert.deepEqual(
    recommendNext({ organs, mastery: [] }),
    { organId: "heart", reason: "start" },
  );
  assert.deepEqual(
    recommendNext({
      organs,
      mastery: [{ organId: "heart", mastery: 100, lessonCompleted: true }],
    }),
    { organId: "brain", reason: "start" },
  );
});

test("recommendNext: all complete and mastered is null", () => {
  assert.equal(
    recommendNext({
      organs,
      mastery: organs.map((organ) => ({
        organId: organ.id,
        mastery: 90,
        lessonCompleted: true,
      })),
    }),
    null,
  );
});

test("recommendNext: beginners prefer a continue organ without a finished lesson", () => {
  assert.deepEqual(
    recommendNext({
      organs,
      mastery: [
        { organId: "heart", mastery: 50, lessonCompleted: true },
        { organId: "brain", mastery: 40, lessonCompleted: false },
      ],
      priorKnowledge: "beginner",
    }),
    { organId: "brain", reason: "continue" },
  );
});

test("recommendNext: beginners still continue when every viewed organ has a lesson", () => {
  assert.deepEqual(
    recommendNext({
      organs,
      mastery: [{ organId: "heart", mastery: 50, lessonCompleted: true }],
      priorKnowledge: "beginner",
    }),
    { organId: "heart", reason: "continue" },
  );
});

function utcDay(offset: number): string {
  const day = new Date();
  day.setUTCHours(0, 0, 0, 0);
  day.setUTCDate(day.getUTCDate() + offset);
  return day.toISOString().slice(0, 10);
}

test("currentStreak: empty is 0, today is 1, yesterday still counts", () => {
  assert.equal(currentStreak([]), 0);
  assert.equal(currentStreak([utcDay(0)]), 1);
  assert.equal(currentStreak([utcDay(-1)]), 1);
  assert.equal(currentStreak([utcDay(-2)]), 0);
});

test("currentStreak: counts consecutive days ending today and stops at a gap", () => {
  assert.equal(currentStreak([utcDay(0), utcDay(-1), utcDay(-2)]), 3);
  assert.equal(currentStreak([utcDay(0), utcDay(-1), utcDay(-3)]), 2);
});

test("parseSavedOrgans / parseNotes: ignore junk and cap size", () => {
  assert.deepEqual(parseSavedOrgans('["heart","nope!","liver"]'), ["heart", "liver"]);
  assert.deepEqual(parseNotes('{"heart":"  keep  ","bad":1}'), { heart: "  keep  " });
  assert.deepEqual(parseNotes("{"), {});
});

test("sanitizeLibrary: only accepts organ-shaped keys", () => {
  assert.deepEqual(
    sanitizeLibrary({ savedOrgans: ["heart", "DROP TABLE", "skin"], notes: { heart: "note", x: "no" } }),
    { savedOrgans: ["heart", "skin"], notes: { heart: "note" } },
  );
});

test("hydrateLibrary: empty server takes local guest data and asks to upload", () => {
  const next = hydrateLibrary(
    { savedOrgans: [], notes: {} },
    { savedOrgans: ["heart"], notes: { heart: "guest" } },
  );
  assert.equal(next.uploadLocal, true);
  assert.deepEqual(next.savedOrgans, ["heart"]);
  assert.equal(next.notes.heart, "guest");
});

test("hydrateLibrary: server snapshot wins once it has anything", () => {
  const next = hydrateLibrary(
    { savedOrgans: ["brain"], notes: {} },
    { savedOrgans: ["heart"], notes: { heart: "guest" } },
  );
  assert.equal(next.uploadLocal, false);
  assert.deepEqual(next.savedOrgans, ["brain"]);
  assert.deepEqual(next.notes, {});
});

test("resumePhase: completed or missing opens the overview", () => {
  assert.equal(resumePhase(undefined), "overview");
  assert.equal(resumePhase({ stepsCompleted: 2, questionsAnswered: 0, completed: true, totalSteps: 5, totalQuestions: 3 }), "overview");
  assert.equal(resumePhase({ stepsCompleted: 2, questionsAnswered: 0, completed: false, totalSteps: 5, totalQuestions: 3 }), "steps");
  assert.equal(resumePhase({ stepsCompleted: 2, questionsAnswered: 1, completed: false, totalSteps: 5, totalQuestions: 3 }), "questions");
});

test("organMatchesQuery hits scientific name, function, and hotspot labels", async () => {
  const { organMatchesQuery } = await import("../app/lib/organ-search");
  const sample = {
    name: "Heart",
    system: "Cardiovascular",
    scientificName: "Cor",
    description: "A muscular pump",
    function: "Circulates blood",
    conditions: ["Arrhythmia"],
    hotspots: [{ label: "Mitral valve", detail: "Guards the left atrioventricular orifice" }],
  };
  assert.equal(organMatchesQuery(sample, "", "en"), true);
  assert.equal(organMatchesQuery(sample, "cor", "en"), true);
  assert.equal(organMatchesQuery(sample, "circulates", "en"), true);
  assert.equal(organMatchesQuery(sample, "mitral", "en"), true);
  assert.equal(organMatchesQuery(sample, "arrhythmia", "en"), true);
  assert.equal(organMatchesQuery(sample, "pancreas", "en"), false);
});

test("every organ compares against a different catalog organ", async () => {
  const { organIds, organStructures } = await import("../app/lib/anatomy-data");
  for (const organ of organStructures) {
    assert.notEqual(organ.compareWith, organ.id, organ.id);
    assert.ok(organIds.includes(organ.compareWith), organ.compareWith);
  }
});

test("lessonEntryPhase: advanced skips overview on a fresh start only", () => {
  assert.equal(lessonEntryPhase(undefined, "beginner"), "overview");
  assert.equal(lessonEntryPhase(undefined, "advanced"), "steps");
  assert.equal(
    lessonEntryPhase(
      { stepsCompleted: 2, questionsAnswered: 0, completed: false, totalSteps: 5, totalQuestions: 3 },
      "advanced",
    ),
    "steps",
  );
  assert.equal(
    lessonEntryPhase(
      { stepsCompleted: 0, questionsAnswered: 0, completed: true, totalSteps: 5, totalQuestions: 3 },
      "advanced",
    ),
    "overview",
  );
});
