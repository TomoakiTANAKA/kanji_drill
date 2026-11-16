import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRetestQuestions, getRetestSets } from "@/lib/content";
import Retest from "@/components/kanji/Retest";

export const dynamicParams = false;

export function generateStaticParams() {
  return getRetestSets().map((s) => ({ set: s.id }));
}

type Props = { params: Promise<{ set: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { set } = await params;
  const s = getRetestSets().find((x) => x.id === set);
  return { title: `かんじ再テスト ${s?.label ?? ""}` };
}

export default async function RetestPage({ params }: Props) {
  const { set } = await params;
  const sets = getRetestSets();
  const s = sets.find((x) => x.id === set);
  if (!s) notFound();
  return <Retest set={s} sets={sets} questions={getRetestQuestions(s)} />;
}
