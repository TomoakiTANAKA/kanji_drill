"use client";
import { useSyncExternalStore } from "react";
import { load, save, subscribe } from "./storage";

// 算数の進み具合。{ [単元]: { [段階]: できた日時(ISO) } }
export const MATH_PROGRESS_KEY = "math:progress";
export type MathProgress = Record<string, Record<string, string>>;

let cache: MathProgress | null = null;
let cacheRaw: string | null = null;

function snapshot(): MathProgress {
  const raw = typeof window === "undefined" ? null : window.localStorage.getItem(MATH_PROGRESS_KEY);
  if (cache === null || raw !== cacheRaw) {
    cacheRaw = raw;
    cache = load<MathProgress>(MATH_PROGRESS_KEY, {});
  }
  return cache;
}
const EMPTY: MathProgress = {};

export function useMathProgress(): MathProgress {
  return useSyncExternalStore(
    (cb) => subscribe((key) => key === MATH_PROGRESS_KEY && cb()),
    snapshot,
    () => EMPTY,
  );
}

export function setStepDone(unit: string, step: string, done: boolean) {
  const p = { ...snapshot() };
  const u = { ...(p[unit] ?? {}) };
  if (done) u[step] = new Date().toISOString();
  else delete u[step];
  p[unit] = u;
  save(MATH_PROGRESS_KEY, p);
}
