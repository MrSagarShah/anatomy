import assert from "node:assert/strict";
import test from "node:test";
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
