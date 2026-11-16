"use client";
import { useEffect, useMemo, useState } from "react";
import type { Kanji, KanjiQuestion } from "@/lib/types";
import { dateStamp, downloadText, load, remove, save } from "@/lib/storage";
import { parseCSV } from "@/lib/csv";
import { useHydrated } from "@/lib/useHydrated";
import { useToast } from "@/components/Toast";
import { highlightInExample } from "./highlight";
import "./kanji.css";

// 旧サイト（index.html）と同じキー・同じ形式。変えると記録が引き継げなくなる
const STORE_KEY = "kanji_drill_v2";
const EXCLUDE_KEY = "kanji_drill_excluded_v1";
const DAY = 86400000;

type Entry = { level: number; due: number };
type State = Record<number, Entry>;

function today() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function loadState(kanji: Kanji[]): State {
  const s = load<State>(STORE_KEY, {}) || {};
  kanji.forEach((k) => {
    if (!s[k.id]) s[k.id] = { level: 0, due: today() };
  });
  return s;
}

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

type Session = { queue: number[]; current: number | null; q: KanjiQuestion | null; revealed: boolean };

export default function KanjiDrill({ kanji }: { kanji: Kanji[] }) {
  const hydrated = useHydrated();
  if (!hydrated) {
    return (
      <Shell>
        <div className="card">
          <div className="eyebrow">よみこみちゅう…</div>
        </div>
      </Shell>
    );
  }
  return <Drill kanji={kanji} />;
}

function Shell({
  children,
  remain,
  footer,
}: {
  children: React.ReactNode;
  remain?: number;
  footer?: React.ReactNode;
}) {
  return (
    <div className="app">
      <header className="app-header">
        <h1 className="brand">
          かんじドリル<small>4年</small>
        </h1>
        {remain !== undefined && (
          <div className="progress">
            のこり <b>{remain}</b> もん
          </div>
        )}
      </header>
      <main className="app-main">{children}</main>
      <footer className="app-footer">{footer}</footer>
    </div>
  );
}

function Drill({ kanji }: { kanji: Kanji[] }) {
  const { toast, node: toastNode } = useToast();
  const [state, setState] = useState<State>(() => loadState(kanji));
  const [excluded, setExcluded] = useState<Set<number>>(() => new Set(load<number[]>(EXCLUDE_KEY, [])));
  const groups = useMemo(() => {
    const m = new Map<number, number[]>();
    kanji.forEach((k) => {
      if (!m.has(k.group)) m.set(k.group, []);
      m.get(k.group)!.push(k.id);
    });
    return [...m.entries()].sort((a, b) => a[0] - b[0]).map(([group, ids]) => ({ group, ids }));
  }, [kanji]);
  const [selected, setSelected] = useState<Set<number>>(() => new Set(groups.map((g) => g.group)));
  const [phase, setPhase] = useState<"setup" | "drill">("setup");
  const [session, setSession] = useState<Session>({ queue: [], current: null, q: null, revealed: false });

  const isLearned = (id: number) => (state[id]?.level ?? 0) >= 1;
  const byId = useMemo(() => new Map(kanji.map((k) => [k.id, k])), [kanji]);

  const updateExcluded = (next: Set<number>) => {
    setExcluded(next);
    save(EXCLUDE_KEY, [...next]);
  };

  const advance = (queue: number[]) => {
    if (queue.length === 0) {
      setSession({ queue: [], current: null, q: null, revealed: false });
      return;
    }
    const [current, ...rest] = queue;
    setSession({ queue: rest, current, q: pick(byId.get(current)!.q), revealed: false });
  };

  const startSession = () => {
    const t = today();
    const ids: number[] = [];
    [...selected]
      .sort((a, b) => a - b)
      .forEach((g) => {
        kanji
          .filter((k) => k.group === g && !excluded.has(k.id) && state[k.id].due <= t)
          .sort((a, b) => a.id - b.id)
          .forEach((k) => ids.push(k.id));
      });
    setPhase("drill");
    advance(ids);
  };

  const judge = (ok: boolean) => {
    const id = session.current;
    if (id === null) return;
    const next = { ...state, [id]: ok ? { level: 1, due: today() + 2 * DAY } : { level: 0, due: today() } };
    setState(next);
    save(STORE_KEY, next);
    advance(session.queue);
  };

  const reveal = () => setSession((s) => ({ ...s, revealed: true }));

  // キーボード: Space/Enter で答え、→ で OK、← で つぎへ
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase !== "drill" || session.current === null) return;
      if (!session.revealed && (e.code === "Space" || e.code === "Enter")) {
        e.preventDefault();
        reveal();
      } else if (session.revealed && e.code === "ArrowRight") judge(true);
      else if (session.revealed && e.code === "ArrowLeft") judge(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  const exportLearnedCSV = () => {
    const rows = kanji.filter((k) => isLearned(k.id)).map((k) => `${k.id},${k.kanji}`);
    const csv = "id,漢字\n" + rows.join("\n") + (rows.length ? "\n" : "");
    downloadText(`kanji_learned_${dateStamp()}.csv`, csv, "text/csv");
    toast(`${rows.length}件をダウンロード`);
  };

  const onImport = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const ids = parseCSV(String(reader.result))
          .map((r) => Number(r.id || r.ID))
          .filter((n) => !isNaN(n));
        if (ids.length === 0) {
          toast("IDが見つかりませんでした");
          return;
        }
        const next = new Set(excluded);
        ids.forEach((id) => next.add(id));
        updateExcluded(next);
        toast(`${ids.length}件を除外リストに追加`);
      } catch {
        toast("CSVが読めませんでした");
      }
      ev.target.value = "";
    };
    reader.readAsText(file);
  };

  const resetProgress = () => {
    if (!confirm("学習の進捗をすべて消します。よろしいですか？\n（除外リストは残ります）")) return;
    remove(STORE_KEY);
    setState(loadState(kanji));
    setPhase("setup");
  };

  /* ---------- グループ選択 ---------- */
  if (phase === "setup") {
    const learnedTotal = kanji.filter((k) => isLearned(k.id)).length;
    return (
      <Shell
        footer={
          <>
            <span className="stamp">
              これまで {learnedTotal} / {kanji.length}（除外 {excluded.size}）
            </span>
            <button className="footer-btn" onClick={exportLearnedCSV}>
              おぼえたCSVをDL
            </button>
            <button className="footer-btn" onClick={resetProgress}>
              進捗リセット
            </button>
          </>
        }
      >
        <div className="card setup">
          <h2 className="section-title">グループをえらぶ</h2>
          <p className="lead">きょうやるグループをタップしてえらんでね（ふくすうOK）</p>
          <div className="list" style={{ marginBottom: 20 }}>
            {groups.map((g) => {
              const learned = g.ids.filter(isLearned).length;
              const ex = g.ids.filter((id) => excluded.has(id)).length;
              const sel = selected.has(g.group);
              return (
                <div
                  key={g.group}
                  className={`list-item ${sel ? "selected" : ""}`}
                  onClick={() => {
                    const next = new Set(selected);
                    if (sel) next.delete(g.group);
                    else next.add(g.group);
                    setSelected(next);
                  }}
                >
                  <div>
                    <div className="name">グループ {g.group}</div>
                    <div className="meta">
                      {g.ids.length}問中 のこり{Math.max(0, g.ids.length - ex - learned)} / おぼえた{learned} / 除外{ex}
                    </div>
                  </div>
                  <div className="check">{sel ? "✓" : ""}</div>
                </div>
              );
            })}
          </div>
          <div className="setup-actions">
            <button className="btn-ok" onClick={startSession} disabled={selected.size === 0}>
              はじめる
            </button>
            <div className="file-row">
              <label htmlFor="importFile">前日の「おぼえたCSV」を読みこむ：</label>
              <input type="file" id="importFile" accept=".csv,text/csv" onChange={onImport} />
            </div>
            <button
              className="footer-btn"
              style={{ alignSelf: "flex-start" }}
              onClick={() => {
                if (confirm("除外リストをクリアします。よろしいですか？")) updateExcluded(new Set());
              }}
            >
              除外リストをクリア（{excluded.size}件）
            </button>
          </div>
        </div>
        {toastNode}
      </Shell>
    );
  }

  /* ---------- 出題・おわり ---------- */
  const totalSel = kanji.filter((k) => selected.has(k.group)).length;
  const learnedSel = kanji.filter((k) => selected.has(k.group) && isLearned(k.id)).length;
  const remain = session.queue.length + (session.current !== null ? 1 : 0);
  const footer = (
    <>
      <span className="stamp">
        おぼえた {learnedSel} / {totalSel}
      </span>
      <button className="footer-btn" onClick={exportLearnedCSV}>
        おぼえたCSVをDL
      </button>
      <button className="footer-btn" onClick={() => setPhase("setup")}>
        グループ選択へ
      </button>
      <button className="footer-btn" onClick={resetProgress}>
        進捗リセット
      </button>
    </>
  );

  if (session.current === null || !session.q) {
    return (
      <Shell remain={remain} footer={footer}>
        <div className="card done-screen">
          <div className="big">🎉</div>
          <h2>きょうのぶん おわり！</h2>
          <p>おぼえたCSVをダウンロードして、あすつかおう</p>
          <div className="controls">
            <button className="btn-ok" onClick={exportLearnedCSV}>
              おぼえたCSVをDL
            </button>
            <button className="btn-reveal" onClick={() => setPhase("setup")}>
              グループ選択へ
            </button>
          </div>
        </div>
        {toastNode}
      </Shell>
    );
  }

  const q = session.q;
  const hasExample = !!q.example;
  return (
    <Shell remain={remain} footer={footer}>
      <div className="card">
        <div className="eyebrow">よみを かんじで かこう</div>
        {hasExample ? (
          <div className="reading example">{highlightInExample(q.example, q.reading, "hl")}</div>
        ) : (
          <div className="reading">{q.reading}</div>
        )}
        <div className="answer-wrap">
          <div className={`answer ${hasExample ? "example" : ""} ${session.revealed ? "" : "hidden"}`}>
            {hasExample
              ? highlightInExample(q.example.replace(q.reading, q.answer), q.answer, "hl-ans")
              : q.answer}
          </div>
        </div>
      </div>
      <div className="controls">
        {!session.revealed ? (
          <button className="btn-reveal" onClick={reveal}>
            こたえを みる
          </button>
        ) : (
          <div className="row">
            <button className="btn-again" onClick={() => judge(false)}>
              つぎへ
            </button>
            <button className="btn-ok" onClick={() => judge(true)}>
              OK
            </button>
          </div>
        )}
      </div>
      {toastNode}
    </Shell>
  );
}
