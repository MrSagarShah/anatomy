import type { OrganId } from "../lib/anatomy-data";

export type GuidedLessonStep = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  insight: string;
  /** Compact path shown beside the model to reinforce direction of flow. */
  route?: string;
  /** Optional structure to emphasize on the 3D model while this step is open. */
  hotspotId?: string;
};

export type GuidedLessonQuestion = {
  id: string;
  prompt: string;
  options: { id: string; label: string }[];
  answerId: string;
  explanation: string;
  /** Structure revealed after the learner answers. */
  hotspotId?: string;
};

export type GuidedLesson = {
  id: string;
  eyebrow: string;
  title: string;
  summary: string;
  duration: string;
  objectives: string[];
  steps: GuidedLessonStep[];
  questions: GuidedLessonQuestion[];
  sources: { label: string; url: string }[];
  evidenceReviewedAt: string;
  reviewNote: string;
  labels: {
    objectives: string;
    begin: string;
    previous: string;
    next: string;
    stepProgress: string;
    showing: string;
    anteriorView: string;
    flow: string;
    checkpoint: string;
    questionProgress: string;
    correct: string;
    incorrect: string;
    continue: string;
    complete: string;
    score: string;
    retry: string;
    exit: string;
    sources: string;
    reviewed: string;
  };
};

/** Prose for one organ. Structure (positions, colours, model) lives in
 *  `anatomy-data.ts`; only translatable text belongs here. */
export type OrganContent = {
  name: string;
  system: string;
  description: string;
  poetic: string;
  size: string;
  weight: string;
  location: string;
  function: string;
  dailyFact: string;
  medical: string;
  bloodSupply: string;
  funFact: string;
  tissue: string;
  comparison: string;
  conditions: string[];
  /** Optional premium guided module. Added organ-by-organ after source review. */
  lesson?: GuidedLesson;
  /** Keyed by hotspot id — the Terminologia Anatomica term is the anchor. */
  hotspots: Record<string, { label: string; detail: string }>;
};

export type OrganContentDictionary = Record<OrganId, OrganContent>;

export type UiDictionary = {
  meta: { title: string; description: string; ogTitle: string; ogDescription: string; imageAlt: string };
  brand: { tagline: string; home: string };
  nav: { explore: string; systems: string; lessons: string; library: string; notes: string };
  search: { placeholder: string };
  profile: { open: string };
  language: { label: string; choose: string };
  library: {
    title: string; open: string; close: string; saved: string; emptySaved: string; viewAll: string;
    quoteLine1: string; quoteLine2: string; quoteSign: string;
  };
  tools: { label: string; rotate: string; zoom: string; isolate: string; section: string; layers: string; compare: string; reset: string };
  viewer: {
    title: string; canvas: string; tip: string; tipDrag: string; tipScroll: string; tipClick: string;
    loading: string; loadError: string; autoRotate: string; caption: string; structures: string;
  };
  info: {
    kicker: string; keyFacts: string; size: string; weight: string; daily: string;
    location: string; bloodSupply: string; function: string; medical: string;
    didYouKnow: string; viewLesson: string; animate: string; quiz: string; compare: string;
  };
  compare: { title: string; comparing: string; reference: string; primaryRole: string; scale: string; vs: string; close: string };
  cards: {
    resources: string; microscopic: string; compareOrgans: string; functionAnimation: string;
    clinicalNotes: string; whereItWorks: string; commonConditions: string;
    exploreTissue: string; openComparison: string; playAnimation: string; seeAll: string; seeSystem: string;
    playAria: string; systemAria: string;
  };
  quiz: {
    start: string; find: string; progress: string; correct: string; wrong: string;
    reveal: string; answer: string; done: string; score: string; retry: string; exit: string; hint: string;
  };
  modal: {
    guided: string; close: string; continueExploring: string;
    quizTitle: string; motionTitle: string; bodyTitle: string; insideTitle: string;
    quizPrompt: string; quizA: string; quizB: string; quizC: string;
    lessonBody: string; systemIntro: string; system: string; primaryRole: string; bloodSupply: string;
  };
};

export type Dictionary = { ui: UiDictionary; organs: OrganContentDictionary };

/** Minimal `{name}` interpolation — the copy has no plurals or dates. */
export function format(template: string, values: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (match, key) => values[key] ?? match);
}
