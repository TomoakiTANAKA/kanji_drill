"use client";
import { useState } from "react";

/** 空欄。タップで答えを表示／もう一度タップで隠す（自己採点用） */
export default function Blank({ answer }: { answer: string }) {
  const [open, setOpen] = useState(false);
  const width = Math.max(2, [...answer].length * 0.9 + 0.8);
  return (
    <button
      type="button"
      className={`blank-box ${open ? "open" : ""}`}
      style={{ minWidth: `${width}em` }}
      onClick={() => setOpen((o) => !o)}
      aria-label={open ? `こたえ ${answer}` : "くうらん（タップでこたえ）"}
    >
      <span className="blank-answer">{answer}</span>
    </button>
  );
}
