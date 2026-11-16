import type { ReactNode } from "react";

/** 例文中の target をハイライトする。見つからなければ末尾に付け足す（旧版と同じ） */
export function highlightInExample(example: string, target: string, cls: string): ReactNode {
  const idx = example.indexOf(target);
  if (idx === -1) {
    return (
      <>
        {example} <span className={cls}>{target}</span>
      </>
    );
  }
  return (
    <>
      {example.slice(0, idx)}
      <span className={cls}>{target}</span>
      {example.slice(idx + target.length)}
    </>
  );
}
