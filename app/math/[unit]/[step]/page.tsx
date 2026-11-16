import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMathStep, getMathUnit, getMathUnits } from "@/lib/content";
import StepBody from "@/components/math/StepBody";
import { DoneButton } from "@/components/math/Progress";
import "@/components/math/math.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return getMathUnits().flatMap((u) => u.steps.map((s) => ({ unit: u.unit, step: s.step })));
}

type Props = { params: Promise<{ unit: string; step: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { unit, step } = await params;
  return { title: getMathStep(unit, step).meta.title };
}

export default async function StepPage({ params }: Props) {
  const { unit, step } = await params;
  const u = getMathUnit(unit);
  const idx = u?.steps.findIndex((s) => s.step === step) ?? -1;
  if (!u || idx < 0) notFound();
  const { meta, body } = getMathStep(unit, step);
  const prev = u.steps[idx - 1];
  const next = u.steps[idx + 1];

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="brand">
          {meta.title}
          <small>
            {idx + 1} / {u.steps.length}
          </small>
        </h1>
        <Link href={`/math/${unit}/`} className="progress">
          ← もどる
        </Link>
      </header>
      <main className="app-main top">
        <article className="card math-card">
          <StepBody markdown={body} />
          {meta.source && <p className="math-source">出典：{meta.source}</p>}
        </article>
        <div className="controls">
          <DoneButton unit={unit} step={step} />
          <div className="row">
            {prev ? (
              <Link className="btn btn-ghost" href={`/math/${unit}/${prev.step}/`}>
                ← まえ
              </Link>
            ) : (
              <span style={{ flex: 1 }} />
            )}
            {next ? (
              <Link className="btn btn-reveal" href={`/math/${unit}/${next.step}/`}>
                つぎへ →
              </Link>
            ) : (
              <span style={{ flex: 1 }} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
