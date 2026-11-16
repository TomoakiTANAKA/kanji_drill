"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { RetestQuestion, RetestSet } from "@/lib/types";
import { load, remove, save } from "@/lib/storage";
import { useHydrated } from "@/lib/useHydrated";
import "./kanji.css";

type State = Record<number, { done: boolean }>;

function loadState(key: string, questions: RetestQuestion[]): State {
  const s = load<State>(key, {}) || {};
  const valid = new Set(questions.map((q) => q.id));
  Object.keys(s).forEach((k) => {
    if (!valid.has(Number(k))) delete s[Number(k)];
  });
  questions.forEach((q) => {
    if (!s[q.id]) s[q.id] = { done: false };
  });
  return s;
}

const buildQueue = (questions: RetestQuestion[], s: State) =>
  questions.filter((q) => !s[q.id].done).sort((a, b) => a.id - b.id).map((q) => q.id);

/** 読みがなをルビとして上に振る */
const withReading = (node: ReactNode, reading: string, key?: number) =>
  reading ? (
    <ruby key={key}>
      {node}
      <rt>{reading}</rt>
    </ruby>
  ) : (
    <span key={key}>{node}</span>
  );

/** □ を空欄に、（…）を青ハイライトに */
function renderSentence(q: RetestQuestion): ReactNode {
  if (q.mode === "blank") {
    const parts = q.sentence.split("□");
    return parts.flatMap((p, i) =>
      i < parts.length - 1
        ? [
            p,
            withReading(
              <span className="blank" style={{ minWidth: `${[...q.answer].length}em` }}>
                ？
              </span>,
              q.hint,
              i,
            ),
          ]
        : [p],
    );
  }
  return q.sentence.split(/(（[^）]*）)/).map((p, i) =>
    /^（.*）$/.test(p) ? (
      <span key={i} className="blank">
        {p}
      </span>
    ) : (
      p
    ),
  );
}

/** □/（…） を答えに置きかえた完成文 */
function renderAnswer(q: RetestQuestion): ReactNode {
  const ans = <span className="hl-ans">{q.answer}</span>;
  if (q.mode === "blank") {
    const parts = q.sentence.split("□");
    return parts.flatMap((p, i) => (i < parts.length - 1 ? [p, withReading(ans, q.hint, i)] : [p]));
  }
  return q.sentence
    .split(/(（[^）]*）)/)
    .map((p, i) => (/^（.*）$/.test(p) ? <span key={i}>{ans}</span> : p));
}

type Props = { set: RetestSet; sets: RetestSet[]; questions: RetestQuestion[] };

export default function Retest(props: Props) {
  const hydrated = useHydrated();
  return (
    <div className="app wide retest">
      <header className="app-header">
        <h1 className="brand">
          かんじ再テスト<small>{props.set.label}・のこり問題だけ</small>
        </h1>
      </header>
      {hydrated ? (
        <RetestBody key={props.set.id} {...props} />
      ) : (
        <main className="app-main">
          <div className="card">
            <div className="eyebrow">よみこみちゅう…</div>
          </div>
        </main>
      )}
    </div>
  );
}

function RetestBody({ set, sets, questions }: Props) {
  const KEY = set.storageKey;
  const [state, setState] = useState<State>(() => loadState(KEY, questions));
  const [queue, setQueue] = useState<number[]>(() => buildQueue(questions, state));
  const [revealed, setRevealed] = useState(false);

  const current = queue[0] ?? null;
  const q = questions.find((x) => x.id === current);

  const mark = useCallback(
    (ok: boolean) => {
      if (current === null) return;
      const next = { ...state, [current]: { done: ok } };
      setState(next);
      save(KEY, next);
      // まちがえた問題は最後にもう一度
      setQueue((qu) => (ok ? qu.slice(1) : [...qu.slice(1), current]));
      setRevealed(false);
    },
    [KEY, current, state],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (current === null) return;
      if (!revealed && (e.code === "Space" || e.code === "Enter")) {
        e.preventDefault();
        setRevealed(true);
      } else if (revealed && e.code === "ArrowRight") mark(true);
      else if (revealed && e.code === "ArrowLeft") mark(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [current, revealed, mark]);

  const restart = (s: State) => {
    setState(s);
    setQueue(buildQueue(questions, s));
    setRevealed(false);
  };

  const doneCount = questions.filter((x) => state[x.id].done).length;

  return (
    <>
      <main className="app-main">
        <div className="progress" style={{ alignSelf: "flex-end" }}>
          のこり <b>{queue.length}</b> もん
        </div>
        {q ? (
          <>
            <div
              className={`card ${revealed ? "" : "tappable"}`}
              onClick={() => !revealed && setRevealed(true)}
            >
              <div className="eyebrow">{q.mode === "blank" ? "よみがなを かんじに しよう" : "かんじに なおそう"}</div>
              <div className="qno">第 {q.id} 問</div>
              <div className="sentence">{renderSentence(q)}</div>
              {q.mode === "okuri" && <div className="hint">かっこ内を かんじ＋送りがなで かこう</div>}
              <div className="answer-wrap">
                <div className={`answer ${revealed ? "" : "hidden"}`}>{renderAnswer(q)}</div>
                {!revealed && (
                  <div className="reveal-prompt">
                    <span>せいかいを みる</span>
                  </div>
                )}
              </div>
            </div>
            <div className="controls">
              {/* 答えを出すまで判定ボタンは見せないが、場所は空けておく（画面がずれないように） */}
              <div className={`row ${revealed ? "" : "invisible"}`}>
                <button className="btn-again" onClick={() => mark(false)}>
                  まちがい
                </button>
                <button className="btn-ok" onClick={() => mark(true)}>
                  せいかい
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="card done-screen">
            <div className="big">🎉</div>
            <h2>ぜんもん せいかい！</h2>
            <p>おつかれさま</p>
            <div className="controls">
              <button
                className="btn-ok"
                onClick={() => {
                  const s: State = {};
                  questions.forEach((x) => (s[x.id] = { done: false }));
                  save(KEY, s);
                  restart(s);
                }}
              >
                もういちど
              </button>
              <Link className="btn btn-reveal" href="/kanji/">
                通常モードへ
              </Link>
            </div>
          </div>
        )}
      </main>
      <footer className="app-footer">
        <span className="stamp">
          せいかい {doneCount} / {questions.length}
        </span>
        <span>
          {sets
            .filter((s) => s.id !== set.id)
            .map((s) => (
              <Link key={s.id} className="footer-btn" href={`/kanji/retest/${s.id}/`} style={{ textDecoration: "none" }}>
                {s.label}へ
              </Link>
            ))}
        </span>
        <Link className="footer-btn" href="/kanji/" style={{ textDecoration: "none" }}>
          通常モードへ
        </Link>
        <button
          className="footer-btn"
          onClick={() => {
            if (!confirm(`${set.label}の進捗をリセットします。よろしいですか？`)) return;
            remove(KEY);
            restart(loadState(KEY, questions));
          }}
        >
          再テストをリセット
        </button>
      </footer>
    </>
  );
}
