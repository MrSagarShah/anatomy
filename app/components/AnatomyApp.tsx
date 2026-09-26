"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import {
  ArrowRight,
  Award,
  BookOpen,
  Bookmark,
  BrainCircuit,
  ChevronDown,
  CircleHelp,
  Compass,
  FileText,
  Globe,
  Heart,
  LibraryBig,
  Microscope,
  Play,
  Search,
  GitCompare,
  Sparkles,
  Stethoscope,
  X,
} from "lucide-react";
import { OrganViewer } from "./OrganViewer";
import { OnboardingModal } from "./OnboardingModal";
import { ProgressDashboard } from "./ProgressDashboard";
import { organIds, type OrganId } from "../lib/anatomy-data";
import type { LocaleConfig } from "../i18n/config";
import { locales } from "../i18n/config";
import { buildOrgans, indexOrgans, type Organ } from "../i18n/merge";
import { format, type Dictionary, type UiDictionary } from "../i18n/types";
import { useProgress } from "../lib/progress/client";
import { progressCopy } from "../lib/progress/copy";
import { hydrateLibrary } from "../lib/progress/library";
import { recommendNext } from "../lib/progress/recommend";
import { organMatchesQuery } from "../lib/organ-search";

type NavMode = "explore" | "systems" | "library" | "lessons" | "notes" | "progress";
type Modal = "system" | "tissue" | "clinical" | null;

const SAVED_KEY = "anatomy:saved-organs";
const NOTES_KEY = "anatomy:notes";
const VIEW_KEY = "anatomy:view";
const MOBILE_LIBRARY_MQ = "(max-width: 760px)";

function readViewOrgan(): OrganId | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(VIEW_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { organId?: string };
    if (parsed.organId && (organIds as readonly string[]).includes(parsed.organId)) {
      return parsed.organId as OrganId;
    }
  } catch {
    // Private mode / bad JSON — start on the default heart.
  }
  return null;
}

function writeViewOrgan(id: OrganId) {
  try {
    window.sessionStorage.setItem(VIEW_KEY, JSON.stringify({ organId: id }));
  } catch {
    // Same as notes — memory still holds the current organ.
  }
}

function isMobileLibrary(): boolean {
  return typeof window !== "undefined" && window.matchMedia(MOBILE_LIBRARY_MQ).matches;
}

function readSavedOrgans(): OrganId[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SAVED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is OrganId => typeof id === "string");
  } catch {
    return [];
  }
}

function writeSavedOrgans(ids: OrganId[]) {
  try {
    window.localStorage.setItem(SAVED_KEY, JSON.stringify(ids));
  } catch {
    // Quota / private mode — keep the in-memory list for this session.
  }
}

function readNotes(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(NOTES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const out: Record<string, string> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === "string") out[key] = value;
    }
    return out;
  } catch {
    return {};
  }
}

function writeNotes(notes: Record<string, string>) {
  try {
    window.localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  } catch {
    // Same as saved organs — memory still holds the draft.
  }
}

/** Two-letter monogram for the profile pill, from a name or email. */
function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length >= 2 ? parts[0][0] + parts[1][0] : name.slice(0, 2);
  return letters.toUpperCase();
}

/**
 * Renders an organ illustration, or its accent glyph for organs that ship as a
 * 3D model without the painted asset set. Keeps every image slot filled instead
 * of leaving a broken `<img>` behind.
 */
function OrganArt({
  organ,
  asset,
  alt,
  size,
}: {
  organ: Organ;
  asset: "thumb" | "organ" | "microscopic" | "compare" | "location";
  alt: string;
  size?: number;
}) {
  if (!organ.illustrated) {
    // An empty alt means a surrounding control already names this, so the
    // glyph should be skipped rather than announced with no label.
    const labelling = alt ? { role: "img", "aria-label": alt } : { "aria-hidden": true };
    return (
      <span className="art-fallback" style={{ "--art-accent": organ.accent } as React.CSSProperties} {...labelling}>
        {organ.icon}
      </span>
    );
  }
  return (
    <img
      key={`${organ.id}-${asset}`}
      src={`/anatomy/${organ.id}/${asset}.webp`}
      alt={alt}
      width={size}
      height={size}
      loading={asset === "thumb" ? "eager" : "lazy"}
      decoding="async"
    />
  );
}


/**
 * Measurements like "250–350 g" begin with a digit, which Unicode treats as
 * neutral — inside an RTL paragraph the range gets visually reversed. Digits
 * are not "strong" characters, so `unicode-bidi: plaintext` cannot rescue it;
 * the run has to be isolated as LTR explicitly.
 */
function Measure({ children }: { children: string }) {
  return <bdi dir={/^[\d(]/.test(children.trim()) ? "ltr" : "auto"}>{children}</bdi>;
}

/**
 * Switches language by swapping the leading path segment, so the current
 * document is preserved rather than bouncing through the root redirect.
 *
 * The native <select> is stretched transparently over the whole pill rather
 * than sitting inline. A <label> only *focuses* a select when clicked — it does
 * not open it — so anything outside the select's own box (the globe, the
 * chevron, the padding) would otherwise be a dead zone. Overlaying it means a
 * click anywhere on the control opens the picker, while the visible row
 * underneath stays fully styleable.
 */
function LanguageSwitcher({ locale, t, organId }: { locale: LocaleConfig; t: UiDictionary; organId: OrganId }) {
  return (
    <div className="language-switcher" title={t.language.label}>
      <Globe size={16} aria-hidden />
      <span className="language-current">{locale.nativeName}</span>
      <ChevronDown size={14} aria-hidden />
      <select
        aria-label={t.language.choose}
        value={locale.code}
        onChange={(event) => {
          writeViewOrgan(organId);
          window.location.pathname = `/${event.target.value}`;
        }}
      >
        {locales.map((entry) => (
          <option key={entry.code} value={entry.code} lang={entry.code}>
            {entry.nativeName}
          </option>
        ))}
      </select>
    </div>
  );
}

export function AnatomyApp({
  locale,
  dictionary,
  user,
}: {
  locale: LocaleConfig;
  dictionary: Dictionary;
  user: { displayName: string; email: string } | null;
}) {
  const t = dictionary.ui;
  const organs = useMemo(() => buildOrgans(dictionary.organs), [dictionary.organs]);
  const organById = useMemo(() => indexOrgans(organs), [organs]);

  const [organId, setOrganId] = useState<OrganId>(() => readViewOrgan() ?? "heart");
  const [autoRotate, setAutoRotate] = useState(true);
  const [compare, setCompare] = useState(false);
  const [compareId, setCompareId] = useState<OrganId>("brain");
  const [tourActive, setTourActive] = useState(false);
  const [modal, setModal] = useState<Modal>(null);
  const [query, setQuery] = useState("");
  const [mobileLibrary, setMobileLibrary] = useState(false);
  const [quizActive, setQuizActive] = useState(false);
  const [lessonActive, setLessonActive] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [reonboard, setReonboard] = useState(false);
  const [nav, setNav] = useState<NavMode>("explore");
  const [activeSystem, setActiveSystem] = useState<string | null>(null);
  const [savedOnly, setSavedOnly] = useState(false);
  const [savedIds, setSavedIds] = useState<OrganId[]>(readSavedOrgans);
  const [notes, setNotes] = useState<Record<string, string>>(readNotes);
  const [noteDraft, setNoteDraft] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);
  const libraryRef = useRef<HTMLElement>(null);
  const prefetched = useRef(new Set<OrganId>());
  const noteTimer = useRef<number | null>(null);
  const pendingNote = useRef<{ id: OrganId; value: string } | null>(null);
  const organ = organById[organId];
  const reference = organById[compareId === organId ? organ.compareWith : compareId] ?? organById[organ.compareWith];

  // --- Learner progress ---
  const copy = progressCopy(locale.code);
  const progress = useProgress(locale.code, Boolean(user));
  const { record, saveLibrary } = progress;
  const hydratedLibrary = useRef(false);

  useEffect(() => {
    const library = progress.state.snapshot?.library;
    if (!library || hydratedLibrary.current) return;
    hydratedLibrary.current = true;
    const next = hydrateLibrary(library, {
      savedOrgans: readSavedOrgans(),
      notes: readNotes(),
    });
    const saved = next.savedOrgans.filter((id): id is OrganId => typeof id === "string") as OrganId[];
    setSavedIds(saved);
    setNotes(next.notes);
    writeSavedOrgans(saved);
    writeNotes(next.notes);
    if (next.uploadLocal) saveLibrary({ savedOrgans: next.savedOrgans, notes: next.notes });
  }, [progress.state.snapshot?.library, saveLibrary]);
  const profileInitials = user ? initialsOf(user.displayName || user.email) : initialsOf(copy.profileGuest);
  const focusOptions = useMemo(
    () => [...new Set(organs.map((item) => item.system))],
    [organs],
  );
  const organNameById = useMemo(
    () => Object.fromEntries(organs.map((item) => [item.id, item.name])) as Record<string, string>,
    [organs],
  );
  const focusSystems = useMemo(
    () => progress.state.snapshot?.profile.focusSystems ?? [],
    [progress.state.snapshot?.profile.focusSystems],
  );
  const savedSet = useMemo(() => new Set(savedIds), [savedIds]);

  // Record an exposure event whenever the learner lands on an organ (including
  // the initial heart). Best-effort; the recorder no-ops when tracking is off.
  useEffect(() => {
    record({ kind: "organ_view", organId });
    writeViewOrgan(organId);
  }, [organId, record]);

  const persistNote = (id: OrganId, value: string) => {
    setNotes((current) => {
      const next = { ...current };
      if (value.trim()) next[id] = value;
      else delete next[id];
      writeNotes(next);
      saveLibrary({ savedOrgans: savedIds, notes: next });
      return next;
    });
  };

  const flushNote = () => {
    if (noteTimer.current !== null) {
      window.clearTimeout(noteTimer.current);
      noteTimer.current = null;
    }
    const pending = pendingNote.current;
    if (!pending) return;
    pendingNote.current = null;
    persistNote(pending.id, pending.value);
  };

  const flushNoteRef = useRef(flushNote);
  flushNoteRef.current = flushNote;
  useEffect(() => () => flushNoteRef.current(), []);

  const filteredOrgans = useMemo(() => {
    let list = organs.filter((item) => {
      if (!organMatchesQuery(item, query, locale.code)) return false;
      if (nav === "systems" && activeSystem && item.system !== activeSystem) return false;
      if (nav === "lessons" && !item.lesson) return false;
      if (savedOnly && !savedSet.has(item.id)) return false;
      return true;
    });
    if (nav === "explore" && !query.trim() && focusSystems.length > 0) {
      const rank = (system: string) => (focusSystems.includes(system) ? 0 : 1);
      list = [...list].sort((a, b) => rank(a.system) - rank(b.system));
    }
    return list;
  }, [organs, query, locale.code, nav, activeSystem, savedOnly, savedSet, focusSystems]);

  useEffect(() => {
    if (!contentRef.current) return;
    gsap.fromTo(contentRef.current.querySelectorAll("[data-reveal]"),
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.48, stagger: 0.035, ease: "power2.out", overwrite: true },
    );
  }, [organId]);

  const selectOrgan = (id: OrganId, next?: { lesson?: boolean; quiz?: boolean; keepCompare?: boolean }) => {
    if (organById[id].illustrated) {
      ["organ", "microscopic", "compare", "location"].forEach((asset) => {
        const image = new Image();
        image.src = `/anatomy/${id}/${asset}.webp`;
      });
    }
    if (nav === "notes") flushNote();
    setOrganId(id);
    setMobileLibrary(false);
    setTourActive(false);
    if (next?.keepCompare) {
      setCompareId(organId);
    } else {
      setCompare(false);
      setCompareId(organById[id].compareWith);
    }
    setQuizActive(Boolean(next?.quiz));
    setLessonActive(Boolean(next?.lesson));
    if (nav === "notes") setNoteDraft(readNotes()[id] ?? notes[id] ?? "");
  };

  const startTour = () => {
    setModal(null);
    setQuizActive(false);
    setLessonActive(false);
    setCompare(false);
    setTourActive(true);
  };

  const openCompare = () => {
    setTourActive(false);
    setLessonActive(false);
    setQuizActive(false);
    setModal(null);
    setCompareId((current) => (current === organ.id ? organ.compareWith : current));
    setCompare(true);
  };

  /** View lesson / study cards: guided lesson when this organ has one, else the labelling quiz. */
  const openLesson = () => {
    setQuizActive(false);
    setTourActive(false);
    setCompare(false);
    setModal(null);
    if (organ.lesson) {
      setNav("lessons");
      setLessonActive(true);
    } else {
      setLessonActive(false);
      setQuizActive(true);
    }
  };

  const focusLibrary = () => {
    if (isMobileLibrary()) {
      setMobileLibrary(true);
      return;
    }
    libraryRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    libraryRef.current?.focus();
  };

  const goExplore = () => {
    setNav("explore");
    setActiveSystem(null);
    setSavedOnly(false);
    setDashboardOpen(false);
    setLessonActive(false);
    flushNote();
  };

  const goSystems = () => {
    setNav("systems");
    setActiveSystem(organ.system);
    setSavedOnly(false);
    setDashboardOpen(false);
    setLessonActive(false);
    flushNote();
    if (isMobileLibrary()) setMobileLibrary(true);
  };

  const goLibrary = () => {
    setNav("library");
    setActiveSystem(null);
    setSavedOnly(true);
    setDashboardOpen(false);
    setLessonActive(false);
    flushNote();
    focusLibrary();
  };

  const goLessons = () => {
    setDashboardOpen(false);
    setModal(null);
    setTourActive(false);
    setCompare(false);
    flushNote();
    if (organ.lesson) {
      setNav("lessons");
      setQuizActive(false);
      setLessonActive(true);
      return;
    }
    const first = organs.find((item) => item.lesson);
    if (first) {
      setNav("lessons");
      selectOrgan(first.id, { lesson: true });
      return;
    }
    setNav("lessons");
    setLessonActive(false);
    setQuizActive(true);
  };

  const goNotes = () => {
    setDashboardOpen(false);
    setLessonActive(false);
    setNoteDraft(readNotes()[organId] ?? notes[organId] ?? "");
    setNav("notes");
  };

  const goProgress = () => {
    flushNote();
    setLessonActive(false);
    setNav("progress");
    setDashboardOpen(true);
  };

  const closeDashboard = () => {
    setDashboardOpen(false);
    setNav((current) => (current === "progress" ? "explore" : current));
  };

  const closeNotes = () => {
    flushNote();
    setNav("explore");
  };

  const toggleSaved = (id: OrganId) => {
    setSavedIds((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      writeSavedOrgans(next);
      saveLibrary({ savedOrgans: next, notes });
      return next;
    });
  };

  const updateNote = (value: string) => {
    setNoteDraft(value);
    pendingNote.current = { id: organId, value };
    if (noteTimer.current !== null) window.clearTimeout(noteTimer.current);
    noteTimer.current = window.setTimeout(() => {
      noteTimer.current = null;
      const pending = pendingNote.current;
      if (!pending) return;
      pendingNote.current = null;
      persistNote(pending.id, pending.value);
    }, 300);
  };

  // Warms the model in the HTTP cache while the pointer is still travelling,
  // so the switch usually renders without a visible loading pass.
  const prefetchOrgan = (id: OrganId) => {
    if (id === organId || prefetched.current.has(id)) return;
    prefetched.current.add(id);
    void fetch(organById[id].model, { priority: "low" } as RequestInit).catch(() => {});
  };

  return (
    <main className={`app-shell ${lessonActive ? "lesson-mode" : ""} ${compare ? "compare-mode" : ""}`}>
      <header className="topbar">
        <button
          className="brand"
          type="button"
          onClick={() => {
            goExplore();
            selectOrgan("heart");
          }}
          aria-label={t.brand.home}
        >
          <strong>Anatomy Atelier<sup>✦</sup></strong>
          <em>{t.brand.tagline}</em>
        </button>
        <nav className="main-nav" aria-label="Primary navigation">
          <button type="button" className={nav === "explore" ? "active" : ""} onClick={goExplore}>
            <Compass size={17} /> <span>{t.nav.explore}</span>
          </button>
          <button type="button" className={nav === "systems" ? "active" : ""} onClick={goSystems}>
            <BrainCircuit size={17} /> <span>{t.nav.systems}</span>
          </button>
          <button type="button" className={nav === "lessons" ? "active" : ""} onClick={goLessons}>
            <BookOpen size={17} /> <span>{t.nav.lessons}</span>
          </button>
          <button type="button" className={nav === "library" ? "active" : ""} onClick={goLibrary}>
            <LibraryBig size={17} /> <span>{t.nav.library}</span>
          </button>
          <button type="button" className={nav === "notes" ? "active" : ""} onClick={goNotes}>
            <FileText size={17} /> <span>{t.nav.notes}</span>
          </button>
          <button type="button" className={nav === "progress" || dashboardOpen ? "active" : ""} onClick={goProgress}>
            <Award size={17} /> <span>{copy.nav}</span>
          </button>
        </nav>
        <label className="search-box">
          <Search size={17} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.search.placeholder} />
        </label>
        <LanguageSwitcher locale={locale} t={t} organId={organId} />
        <button className="profile" aria-label={t.profile.open} onClick={goProgress}><span>{profileInitials}</span><ChevronDown size={15} /></button>
        <button className="mobile-library-trigger" onClick={() => { setNav("library"); setSavedOnly(false); setMobileLibrary(true); }} aria-label={t.library.open}><LibraryBig size={20} /></button>
      </header>

      <div className="workspace">
        <aside ref={libraryRef} className={`organ-library ${mobileLibrary ? "open" : ""}`} tabIndex={-1}>
          <div className="panel-heading">
            <span>{savedOnly ? t.library.saved : t.library.title}</span>
            <button aria-label={t.library.close} className="mobile-close" onClick={() => setMobileLibrary(false)}><X size={17} /></button>
            <button
              type="button"
              aria-label={t.library.saved}
              aria-pressed={savedOnly}
              className={savedOnly ? "on" : ""}
              onClick={() => setSavedOnly((on) => !on)}
            >
              <Bookmark size={17} fill={savedOnly ? "currentColor" : "none"} />
            </button>
          </div>
          {nav === "systems" && (
            <div className="library-systems" role="tablist" aria-label={t.nav.systems}>
              {focusOptions.map((system) => (
                <button
                  key={system}
                  type="button"
                  role="tab"
                  aria-selected={activeSystem === system}
                  className={`library-chip ${activeSystem === system ? "on" : ""}`}
                  onClick={() => setActiveSystem(system)}
                >
                  {system}
                </button>
              ))}
            </div>
          )}
          {nav === "explore" && !query && focusSystems.length > 0 && (
            <p className="library-hint">{copy.onboarding.focusLabel}</p>
          )}
          <label className="library-search">
            <Search size={15} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.search.placeholder} />
          </label>
          <div className="organ-list">
            {savedOnly && filteredOrgans.length === 0 && (
              <p className="library-empty">{t.library.emptySaved}</p>
            )}
            {filteredOrgans.map((item) => {
              const isSaved = savedSet.has(item.id);
              return (
                <div
                  key={item.id}
                  className={`organ-item ${organId === item.id ? "active" : ""}`}
                  style={{ "--item-accent": item.accent } as React.CSSProperties}
                >
                  <button
                    type="button"
                    className="organ-pick"
                    onClick={() => selectOrgan(item.id, nav === "lessons" && item.lesson ? { lesson: true } : undefined)}
                    onPointerEnter={() => prefetchOrgan(item.id)}
                    onFocus={() => prefetchOrgan(item.id)}
                  >
                    <span className="organ-glyph">
                      <OrganArt organ={item} asset="thumb" alt="" size={47} />
                    </span>
                    <span><b>{item.name}</b><small>{item.system}</small></span>
                  </button>
                  <span className="organ-item-meta">
                    <button
                      type="button"
                      className={`organ-save ${isSaved ? "on" : ""}`}
                      aria-label={t.library.saved}
                      aria-pressed={isSaved}
                      onClick={() => toggleSaved(item.id)}
                    >
                      <Bookmark size={14} fill={isSaved ? "currentColor" : "none"} />
                    </button>
                    {(notes[item.id] ?? "").trim() !== "" && <FileText className="organ-note-mark" size={13} />}
                    {organId === item.id && <Heart className="favorite" size={14} fill="currentColor" />}
                  </span>
                </div>
              );
            })}
          </div>
          <button
            className="view-all"
            onClick={() => {
              setQuery("");
              setSavedOnly(false);
              if (nav !== "systems") {
                setNav("explore");
                setActiveSystem(null);
              }
            }}
          >
            {t.library.viewAll} <ArrowRight size={14} />
          </button>
          <blockquote>
            <Sparkles size={18} />
            <p>{t.library.quoteLine1}<br />{t.library.quoteLine2}</p>
            <em>{t.library.quoteSign}</em>
          </blockquote>
        </aside>

        <OrganViewer
          organ={organ}
          t={t}
          autoRotate={autoRotate}
          onAutoRotate={setAutoRotate}
          compare={compare}
          onCompare={() => (compare ? setCompare(false) : openCompare())}
          quizActive={quizActive}
          onQuizExit={() => setQuizActive(false)}
          tourActive={tourActive}
          onTourEnd={() => setTourActive(false)}
          lesson={lessonActive ? organ.lesson ?? null : null}
          resume={progress.state.snapshot?.lessons.find((item) => item.organId === organ.id)}
          priorKnowledge={progress.state.snapshot?.profile.priorKnowledge}
          onLessonExit={() => setLessonActive(false)}
          onEvent={record}
        />

        <aside className="info-panel" ref={contentRef}>
          <div className="info-kicker" data-reveal><Heart size={13} fill="currentColor" /> {format(t.info.kicker, { organ: organ.name })}</div>
          <div className="info-title-row" data-reveal>
            <div><h1>{organ.name}</h1><em>{organ.poetic}</em></div>
            <span className="specimen-stamp">
              <OrganArt organ={organ} asset="organ" alt="" size={92} />
            </span>
          </div>
          <p className="description" data-reveal>{organ.description}</p>
          <div className="rule" />
          <h2 data-reveal>{t.info.keyFacts}</h2>
          <dl className="key-facts">
            <div data-reveal><dt><span>◇</span> {t.info.size}</dt><dd><Measure>{organ.size}</Measure></dd></div>
            <div data-reveal><dt><span>♙</span> {t.info.weight}</dt><dd><Measure>{organ.weight}</Measure></dd></div>
            <div data-reveal><dt><span>⌁</span> {t.info.daily}</dt><dd><Measure>{organ.dailyFact}</Measure></dd></div>
            <div data-reveal><dt><span>⌖</span> {t.info.location}</dt><dd><Measure>{organ.location}</Measure></dd></div>
            <div data-reveal><dt><span>❋</span> {t.info.bloodSupply}</dt><dd><Measure>{organ.bloodSupply}</Measure></dd></div>
            <div data-reveal><dt><span>◈</span> {t.info.function}</dt><dd><Measure>{organ.function}</Measure></dd></div>
          </dl>
          <div className="medical-note" data-reveal><Stethoscope size={16} /><p><b>{t.info.medical}</b>{organ.medical}</p></div>
          <div className="fun-note" data-reveal><Sparkles size={15} /><p><b>{t.info.didYouKnow}</b>{organ.funFact}</p></div>
          <button className="lesson-button" data-reveal onClick={openLesson}>{organ.lesson ? t.info.viewLesson : t.quiz.start} <ArrowRight size={16} /></button>
          <div className="action-grid" data-reveal>
            <button onClick={startTour} className={tourActive ? "active" : ""}><Play size={15} /> {t.info.animate}</button>
            <button onClick={() => { setTourActive(false); setLessonActive(false); setCompare(false); setQuizActive(true); setModal(null); }}><CircleHelp size={15} /> {t.info.quiz}</button>
            <button onClick={() => (compare ? setCompare(false) : openCompare())} className={compare ? "active" : ""}><GitCompare size={15} /> {t.info.compare}</button>
          </div>
        </aside>
      </div>

      {compare && !quizActive && !lessonActive && (
        <section className="compare-strip" aria-label={t.compare.title}>
          <div className="compare-organ">
            <OrganArt organ={organ} asset="thumb" alt="" />
            <span>{t.compare.comparing}</span>
            <strong>{organ.name}</strong>
            <small>{organ.system}</small>
          </div>
          <b>{t.compare.vs}</b>
          <div className="compare-organ">
            <OrganArt organ={reference} asset="thumb" alt="" />
            <span>{t.compare.reference}</span>
            <button
              type="button"
              className="compare-jump"
              onClick={() => selectOrgan(reference.id, { keepCompare: true })}
            >
              <strong>{reference.name}</strong>
            </button>
            <small>{reference.system}</small>
            <label className="compare-pick">
              <span className="sr-only">{t.compare.reference}</span>
              <select
                value={reference.id}
                onChange={(event) => setCompareId(event.target.value as OrganId)}
              >
                {organs.filter((item) => item.id !== organ.id).map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </label>
          </div>
          <dl>
            <div>
              <dt>{t.compare.primaryRole}</dt>
              <dd><Measure>{organ.function}</Measure></dd>
              <dd className="compare-other"><Measure>{reference.function}</Measure></dd>
            </div>
            <div>
              <dt>{t.info.size}</dt>
              <dd><Measure>{organ.size}</Measure></dd>
              <dd className="compare-other"><Measure>{reference.size}</Measure></dd>
            </div>
            <div>
              <dt>{t.info.weight}</dt>
              <dd><Measure>{organ.weight}</Measure></dd>
              <dd className="compare-other"><Measure>{reference.weight}</Measure></dd>
            </div>
            <div>
              <dt>{t.compare.scale}</dt>
              <dd><Measure>{organ.comparison}</Measure></dd>
              <dd className="compare-other"><Measure>{reference.comparison}</Measure></dd>
            </div>
          </dl>
          <button type="button" onClick={() => setCompare(false)} aria-label={t.compare.close}><X size={16} /></button>
        </section>
      )}

      <section className="learning-cards" aria-label={format(t.cards.resources, { organ: organ.name })}>
        <article className="curiosity-card">
          <span>✿</span><p>{t.library.quoteLine1}<br />{t.library.quoteLine2}</p><em>{t.library.quoteSign}</em>
        </article>
        <article>
          <header><div><em>{t.cards.microscopic}</em><h3>{organ.tissue}</h3></div><Microscope size={17} /></header>
          <div className="microscope-visual organ-card-image"><OrganArt organ={organ} asset="microscopic" alt="" /></div>
          <button onClick={() => setModal("tissue")}>{t.cards.exploreTissue} <ArrowRight size={14} /></button>
        </article>
        <article>
          <header><div><em>{t.cards.compareOrgans}</em><h3>{organ.comparison}</h3></div><GitCompare size={17} /></header>
          <div className="comparison-visual organ-card-image"><OrganArt organ={organ} asset="compare" alt="" /></div>
          <button onClick={openCompare}>{t.cards.openComparison} <ArrowRight size={14} /></button>
        </article>
        <article>
          <header><div><em>{t.cards.functionAnimation}</em><h3>{organ.function}</h3></div><Play size={17} /></header>
          {/* The artwork itself is the control, so the play badge inside it is
              decorative rather than a nested button. */}
          <button
            type="button"
            className="function-visual organ-card-image"
            onClick={startTour}
            aria-label={format(t.cards.playAria, { organ: organ.name })}
          >
            <OrganArt organ={organ} asset="organ" alt="" />
            <i className="function-pulse" />
            <span className="play-badge"><Play size={18} fill="currentColor" /></span>
          </button>
          <button onClick={startTour}>{t.cards.playAnimation} <ArrowRight size={14} /></button>
        </article>
        <article>
          <header><div><em>{t.cards.clinicalNotes}</em><h3>{t.cards.commonConditions}</h3></div><FileText size={17} /></header>
          <ul>{organ.conditions.map((condition) => <li key={condition}>{condition}</li>)}</ul>
          <button onClick={() => setModal("clinical")}>{t.cards.seeAll} <ArrowRight size={14} /></button>
        </article>
        <article className="system-card">
          <header><div><em>{t.cards.whereItWorks}</em><h3>{organ.system}</h3></div><BrainCircuit size={17} /></header>
          <button
            type="button"
            className="system-visual organ-card-image"
            onClick={() => setModal("system")}
            aria-label={format(t.cards.systemAria, { organ: organ.name })}
          >
            <OrganArt organ={organ} asset="location" alt="" />
          </button>
          <button onClick={() => setModal("system")}>{t.cards.seeSystem} <ArrowRight size={14} /></button>
        </article>
      </section>

      {modal && (
        <LearningModal
          type={modal}
          organ={organ}
          t={t}
          onClose={() => setModal(null)}
          onStudy={organ.lesson ? () => { setModal(null); setCompare(false); setNav("lessons"); setLessonActive(true); } : undefined}
        />
      )}
      {nav === "notes" && (
        <NotesPanel
          organ={organ}
          organs={organs}
          notes={notes}
          t={t}
          value={noteDraft}
          onChange={updateNote}
          onClose={closeNotes}
          onSelect={(id) => selectOrgan(id)}
        />
      )}
      {mobileLibrary && <button className="drawer-backdrop" aria-label={t.library.close} onClick={() => setMobileLibrary(false)} />}

      {progress.state.needsOnboarding && !dashboardOpen && nav !== "notes" && (
        <OnboardingModal
          copy={copy}
          focusOptions={focusOptions}
          onSubmit={progress.submitOnboarding}
          onSkip={progress.dismissOnboarding}
        />
      )}
      {dashboardOpen && (
        <ProgressDashboard
          copy={copy}
          state={progress.state}
          organLabel={(id) => organNameById[id] ?? id}
          catalog={organs.map((item) => ({ id: item.id, system: item.system }))}
          onClose={closeDashboard}
          onEditBackground={() => {
            setDashboardOpen(false);
            setReonboard(true);
          }}
          onSelectOrgan={(id) => {
            const target = organById[id as OrganId];
            if (!target) return;
            setDashboardOpen(false);
            setNav("explore");
            selectOrgan(target.id);
          }}
          onContinueLesson={(id) => {
            const target = organById[id as OrganId];
            if (!target) return;
            setDashboardOpen(false);
            if (target.lesson) {
              setNav("lessons");
              selectOrgan(target.id, { lesson: true });
            } else {
              setNav("explore");
              selectOrgan(target.id);
            }
          }}
          onRetry={() => void progress.refresh()}
          onKeepGoing={() => {
            const snapshot = progress.state.snapshot;
            const pick = recommendNext({
              organs: organs.map((item) => ({ id: item.id, system: item.system })),
              mastery:
                snapshot?.organs.map((row) => ({
                  organId: row.organId,
                  mastery: row.mastery,
                  lessonCompleted: row.lessonCompleted,
                })) ?? [],
              focusSystems,
              priorKnowledge: snapshot?.profile.priorKnowledge,
            });
            const next =
              (pick && organById[pick.organId as OrganId]) ??
              organs.find((item) => item.lesson) ??
              organs[0];
            setDashboardOpen(false);
            if (next.lesson) {
              setNav("lessons");
              selectOrgan(next.id, { lesson: true });
            } else {
              setNav("explore");
              selectOrgan(next.id);
            }
          }}
        />
      )}
      {reonboard && (
        <OnboardingModal
          copy={copy}
          focusOptions={focusOptions}
          initial={progress.state.snapshot?.profile}
          onSubmit={(input) => {
            void progress.submitOnboarding(input).then((ok) => {
              if (ok) setReonboard(false);
            });
          }}
          onSkip={() => setReonboard(false)}
        />
      )}
    </main>
  );
}

function LearningModal({
  type,
  organ,
  t,
  onClose,
  onStudy,
}: {
  type: Exclude<Modal, null>;
  organ: Organ;
  t: UiDictionary;
  onClose: () => void;
  onStudy?: () => void;
}) {
  const vars = { organ: organ.name, location: organ.location };
  const title =
    type === "tissue" ? organ.tissue
      : type === "clinical" ? t.cards.commonConditions
        : format(t.modal.bodyTitle, vars);
  const eyebrow =
    type === "tissue" ? t.cards.microscopic
      : type === "clinical" ? t.cards.clinicalNotes
        : t.modal.guided;

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="learning-modal wide"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label={t.modal.close}><X size={18} /></button>
        <span className="modal-icon">{type === "tissue" ? "✿" : type === "clinical" ? "✚" : "⌖"}</span>
        <em>{eyebrow}</em>
        <h2 id="modal-title">{title}</h2>
        {type === "tissue" && (
          <>
            <p>{organ.description}</p>
            <figure className="modal-figure">
              <OrganArt organ={organ} asset="microscopic" alt="" />
            </figure>
          </>
        )}
        {type === "clinical" && (
          <>
            <p><b>{t.info.medical}</b> {organ.medical}</p>
            <ul className="modal-conditions">{organ.conditions.map((condition) => <li key={condition}>{condition}</li>)}</ul>
          </>
        )}
        {type === "system" && (
          <>
            <p>{format(t.modal.systemIntro, vars)}</p>
            <figure className="modal-figure">
              <OrganArt organ={organ} asset="location" alt="" />
            </figure>
            <dl className="modal-facts">
              <div><dt>{t.modal.system}</dt><dd>{organ.system}</dd></div>
              <div><dt>{t.modal.primaryRole}</dt><dd><Measure>{organ.function}</Measure></dd></div>
              <div><dt>{t.modal.bloodSupply}</dt><dd><Measure>{organ.bloodSupply}</Measure></dd></div>
            </dl>
          </>
        )}
        <button className="lesson-button" onClick={onClose}>{t.modal.continueExploring} <ArrowRight size={16} /></button>
        {onStudy && (
          <button className="modal-secondary" type="button" onClick={onStudy}>{t.info.viewLesson}</button>
        )}
      </section>
    </div>
  );
}

function NotesPanel({
  organ,
  organs,
  notes,
  t,
  value,
  onChange,
  onClose,
  onSelect,
}: {
  organ: Organ;
  organs: Organ[];
  notes: Record<string, string>;
  t: UiDictionary;
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  onSelect: (id: OrganId) => void;
}) {
  const withNotes = organs.filter((item) => (notes[item.id] ?? "").trim());
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="learning-modal notes-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="notes-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label={t.modal.close}><X size={18} /></button>
        <span className="modal-icon"><FileText size={20} /></span>
        <em>{organ.name}</em>
        <h2 id="notes-title">{t.nav.notes}</h2>
        {withNotes.length === 0 && (
          <p className="library-hint">{t.library.notesHint}</p>
        )}
        {withNotes.length > 0 && (
          <div className="notes-switcher" role="tablist" aria-label={t.nav.notes}>
            {withNotes.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={item.id === organ.id}
                className={`library-chip ${item.id === organ.id ? "on" : ""}`}
                onClick={() => onSelect(item.id)}
              >
                {item.name}
              </button>
            ))}
          </div>
        )}
        <textarea
          className="notes-textarea"
          dir="auto"
          aria-label={t.nav.notes}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </section>
    </div>
  );
}
