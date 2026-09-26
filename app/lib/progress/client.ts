"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  LearnerResponse,
  LibraryInput,
  OnboardingInput,
  ProgressEventInput,
  ProgressResponse,
  ProgressSnapshot,
} from "./types";

/** Fire-and-forget event recorder. Uses `keepalive` so an event fired as the
 *  learner navigates away still reaches the server. Never throws. */
export function recordProgress(event: ProgressEventInput, locale: string): void {
  try {
    void fetch("/api/progress", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...event, locale }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Recording is best-effort — a failed beacon must never break the lesson.
  }
}

export type ProgressState = {
  /** null while loading; false once we know the backend/binding is absent. */
  available: boolean | null;
  authenticated: boolean;
  /** True when the learner is signed in but hasn't answered onboarding. */
  needsOnboarding: boolean;
  snapshot: ProgressSnapshot | null;
  /** True when the last identify/refresh failed and can be retried. */
  loadError: boolean;
};

const INITIAL: ProgressState = {
  available: null,
  authenticated: false,
  needsOnboarding: false,
  snapshot: null,
  loadError: false,
};

/**
 * Owns the learner's progress state for the app shell: identifies the learner,
 * loads the snapshot, exposes a `record` that also refreshes the snapshot after
 * scoring events, and a `submitOnboarding`.
 */
export function useProgress(locale: string, signedIn: boolean) {
  const [state, setState] = useState<ProgressState>(INITIAL);
  const loading = useRef(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`/api/progress?locale=${locale}`, { cache: "no-store" });
      const data = (await res.json()) as ProgressResponse;
      if (!data.available) {
        setState({ available: false, authenticated: false, needsOnboarding: false, snapshot: null, loadError: false });
        return;
      }
      if (!data.authenticated) {
        setState({ available: true, authenticated: false, needsOnboarding: false, snapshot: null, loadError: false });
        return;
      }
      setState({
        available: true,
        authenticated: true,
        needsOnboarding: !data.snapshot.profile.onboarded,
        snapshot: data.snapshot,
        loadError: false,
      });
    } catch {
      setState((s) => ({ ...s, loadError: true }));
    }
  }, [locale]);

  // Initial identify + load. When signed out we still ping /api/learner so the
  // "available: false" (no binding) and "anon" cases are distinguished.
  useEffect(() => {
    if (loading.current) return;
    loading.current = true;
    (async () => {
      if (!signedIn) {
        try {
          const res = await fetch(`/api/learner?locale=${locale}`, { cache: "no-store" });
          const data = (await res.json()) as LearnerResponse;
          setState({
            available: Boolean(data.available),
            authenticated: false,
            needsOnboarding: false,
            snapshot: null,
            loadError: false,
          });
        } catch {
          setState((s) => ({ ...s, loadError: true }));
        }
        return;
      }
      await refresh();
    })();
  }, [locale, refresh, signedIn]);

  /** Record an event; refresh the snapshot after events that change scores so
   *  the dashboard and profile badge stay in sync without a manual reload. */
  const record = useCallback(
    (event: ProgressEventInput) => {
      recordProgress(event, locale);
      const scoring =
        event.kind === "lesson_complete" ||
        event.kind === "lesson_step" ||
        event.kind === "label_quiz_complete" ||
        event.kind === "quiz_complete" ||
        event.kind === "quiz_answer" ||
        event.kind === "organ_view";
      if (scoring && signedIn) {
        // Small delay lets the write land before we read it back.
        window.setTimeout(() => void refresh(), 400);
      }
    },
    [locale, refresh, signedIn],
  );

  const submitOnboarding = useCallback(
    async (input: OnboardingInput) => {
      try {
        const res = await fetch(`/api/learner?locale=${locale}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(input),
        });
        const data = (await res.json()) as ProgressResponse;
        if (data.available && data.authenticated) {
          setState({
            available: true,
            authenticated: true,
            needsOnboarding: false,
            snapshot: data.snapshot,
            loadError: false,
          });
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    [locale],
  );

  const dismissOnboarding = useCallback(() => {
    // Close immediately so skip feels instant; persist in the background so
    // the modal does not return on the next visit. Empty body stamps
    // onboardedAt without clearing answers already on the row.
    setState((s) => ({ ...s, needsOnboarding: false }));
    try {
      void fetch(`/api/learner?locale=${locale}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
        keepalive: true,
      })
        .then(async (res) => {
          const data = (await res.json()) as ProgressResponse;
          if (data.available && data.authenticated) {
            setState({
              available: true,
              authenticated: true,
              needsOnboarding: false,
              snapshot: data.snapshot,
              loadError: false,
            });
          }
        })
        .catch(() => {});
    } catch {
      // Persist is best-effort; the local dismiss already hid the modal.
    }
  }, [locale]);

  const saveLibrary = useCallback(
    (input: LibraryInput) => {
      if (!signedIn) return;
      try {
        void fetch(`/api/learner?locale=${locale}`, {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(input),
          keepalive: true,
        }).catch(() => {});
      } catch {
        // Library persist is best-effort; localStorage already holds the write.
      }
    },
    [locale, signedIn],
  );

  return { state, record, refresh, submitOnboarding, dismissOnboarding, saveLibrary };
}
