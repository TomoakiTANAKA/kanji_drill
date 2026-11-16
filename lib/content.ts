// content/ 配下のデータを読む。ビルド時（Server Component）専用。
import "server-only";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { parseCSV } from "./csv";
import type {
  Kanji,
  KanjiQuestion,
  RetestQuestion,
  RetestSet,
  MathStepMeta,
  MathUnit,
} from "./types";

const CONTENT = path.join(process.cwd(), "content");
const read = (...p: string[]) => fs.readFileSync(path.join(CONTENT, ...p), "utf8");

/* ---------- 漢字 ---------- */

export function getKanji(): Kanji[] {
  const kanjiRows = parseCSV(read("kanji", "kanji.csv"));
  const qRows = parseCSV(read("kanji", "question.csv"));

  const qByKanji = new Map<number, KanjiQuestion[]>();
  for (const r of qRows) {
    const kid = Number(r.kanji_id);
    const reading = r["問題文（読み）"];
    const answer = r["答え"];
    if (!reading || !answer) continue;
    if (!qByKanji.has(kid)) qByKanji.set(kid, []);
    qByKanji.get(kid)!.push({ reading, answer, example: r["例文"] || "" });
  }

  return kanjiRows
    .map((r) => ({
      id: Number(r.ID),
      group: Number(r["グループ"]),
      kanji: r["漢字"],
      q: qByKanji.get(Number(r.ID)) ?? [],
    }))
    .filter((k) => k.q.length > 0);
}

export function getRetestSets(): RetestSet[] {
  return JSON.parse(read("kanji", "retest", "sets.json"));
}

export function getRetestQuestions(set: RetestSet): RetestQuestion[] {
  return parseCSV(read("kanji", "retest", set.file))
    .map((r) => {
      const sentence = r["例文"] || "";
      return {
        id: Number(r["番号"]),
        sentence,
        hint: r["ヒント"] || "",
        answer: r["答え"] || "",
        mode: sentence.includes("□") ? ("blank" as const) : ("okuri" as const),
      };
    })
    .filter((q) => q.id && q.sentence && q.answer);
}

/* ---------- 算数 ---------- */

const MATH = path.join(CONTENT, "math");

function readStep(unit: string, step: string) {
  const { data, content } = matter(fs.readFileSync(path.join(MATH, unit, `${step}.md`), "utf8"));
  const meta: MathStepMeta = {
    unit,
    step,
    title: String(data.title ?? `${unit} ${step}`),
    order: Number(data.order ?? step),
    source: data.source ? String(data.source) : undefined,
  };
  return { meta, body: content };
}

/** 単元タイトルは 1 段階目の title から「 ①」などの末尾を取ったもの（_unit.md があればそちら） */
function unitTitle(unit: string, steps: MathStepMeta[]): string {
  const f = path.join(MATH, unit, "_unit.md");
  if (fs.existsSync(f)) {
    const t = matter(fs.readFileSync(f, "utf8")).data.title;
    if (t) return String(t);
  }
  return (steps[0]?.title ?? unit).replace(/\s*[①-⑳0-9０-９]+$/, "");
}

export function getMathUnits(): MathUnit[] {
  if (!fs.existsSync(MATH)) return [];
  return fs
    .readdirSync(MATH, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort()
    .map((unit) => {
      const steps = fs
        .readdirSync(path.join(MATH, unit))
        .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
        .map((f) => readStep(unit, f.replace(/\.md$/, "")).meta)
        .sort((a, b) => a.order - b.order);
      return { unit, title: unitTitle(unit, steps), steps };
    })
    .filter((u) => u.steps.length > 0);
}

export function getMathUnit(unit: string): MathUnit | undefined {
  return getMathUnits().find((u) => u.unit === unit);
}

export function getMathStep(unit: string, step: string) {
  return readStep(unit, step);
}
