import { useCallback, useEffect, useState } from "react";

/**
 * Reduce Motion preference (accessibility + performance).
 *
 * - Defaults to the OS setting (prefers-reduced-motion) when not explicitly set.
 * - Persists to localStorage so classrooms stay consistent.
 * - Also writes a data attribute for CSS to disable animations globally.
 */
export const REDUCE_MOTION_KEY = "flowquest:reduceMotion";

function readReduceMotionDefault() {
  try {
    return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  } catch {
    return false;
  }
}

function readStoredReduceMotion() {
  try {
    const raw = localStorage.getItem(REDUCE_MOTION_KEY);
    if (raw === null) return null;
    return raw === "1" || raw === "true";
  } catch {
    return null;
  }
}

function writeStoredReduceMotion(v) {
  try {
    localStorage.setItem(REDUCE_MOTION_KEY, v ? "1" : "0");
  } catch {
    // ignore
  }
}

export function useReduceMotion() {
  const [reduceMotion, setReduceMotion] = useState(() => {
    const stored = readStoredReduceMotion();
    return stored ?? readReduceMotionDefault();
  });

  useEffect(() => {
    document.documentElement.dataset.reduceMotion = reduceMotion ? "1" : "0";
    writeStoredReduceMotion(reduceMotion);
  }, [reduceMotion]);

  const toggleReduceMotion = useCallback(() => setReduceMotion((v) => !v), []);

  return { reduceMotion, setReduceMotion, toggleReduceMotion };
}

