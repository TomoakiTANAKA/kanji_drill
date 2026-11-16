"use client";
import { setStepDone, useMathProgress } from "@/lib/mathProgress";

/** 一覧のチェック印 */
export function StepCheck({ unit, step }: { unit: string; step: string }) {
  const done = !!useMathProgress()[unit]?.[step];
  return <div className={`check ${done ? "ok" : ""}`}>{done ? "✓" : ""}</div>;
}

/** 単元の「できた数 / 全体」 */
export function UnitCount({ unit, steps }: { unit: string; steps: string[] }) {
  const p = useMathProgress()[unit] ?? {};
  const n = steps.filter((s) => p[s]).length;
  return (
    <span className="meta">
      {n} / {steps.length} できた
    </span>
  );
}

/** 段階ページの「できた！」ボタン */
export function DoneButton({ unit, step }: { unit: string; step: string }) {
  const doneAt = useMathProgress()[unit]?.[step];
  if (doneAt) {
    return (
      <button className="btn-reveal" onClick={() => setStepDone(unit, step, false)}>
        ✓ できた（{new Date(doneAt).toLocaleDateString("ja-JP")}）— とりけす
      </button>
    );
  }
  return (
    <button className="btn-ok" onClick={() => setStepDone(unit, step, true)}>
      できた！
    </button>
  );
}
