"use client";
import { useSyncExternalStore } from "react";

const noop = () => () => {};

/** ブラウザで描画されているときだけ true（ビルド時の HTML 生成中は false） */
export function useHydrated() {
  return useSyncExternalStore(noop, () => true, () => false);
}
