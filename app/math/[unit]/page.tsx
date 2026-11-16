import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMathUnit, getMathUnits } from "@/lib/content";
import { StepCheck } from "@/components/math/Progress";

export const dynamicParams = false;

export function generateStaticParams() {
  return getMathUnits().map((u) => ({ unit: u.unit }));
}

type Props = { params: Promise<{ unit: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { unit } = await params;
  return { title: getMathUnit(unit)?.title ?? "さんすう" };
}

/** 段階ごとの説明（番号が大きいほど自分で書くところが増える） */
function stepLabel(i: number, total: number) {
  if (i === total - 1) return "しゅくだい";
  if (i === 0) return "れいだい";
  return `るいだい ${i}`;
}

export default async function UnitPage({ params }: Props) {
  const { unit } = await params;
  const u = getMathUnit(unit);
  if (!u) notFound();
  return (
    <div className="app">
      <header className="app-header">
        <h1 className="brand">{u.title}</h1>
        <Link href="/math/" className="progress">
          ← たんげん一覧
        </Link>
      </header>
      <main className="app-main top">
        <p className="lead" style={{ alignSelf: "flex-start", margin: 0 }}>
          上から じゅんばんに やってみよう。だんだん じぶんで かくところが ふえるよ。
        </p>
        <div className="list">
          {u.steps.map((s, i) => (
            <Link key={s.step} className="list-item" href={`/math/${unit}/${s.step}/`}>
              <div>
                <div className="name">
                  {i + 1}. {stepLabel(i, u.steps.length)}
                </div>
                <div className="meta">{s.title}</div>
              </div>
              <StepCheck unit={unit} step={s.step} />
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
