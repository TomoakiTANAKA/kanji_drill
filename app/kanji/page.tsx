import type { Metadata } from "next";
import { getKanji } from "@/lib/content";
import KanjiDrill from "@/components/kanji/KanjiDrill";

export const metadata: Metadata = { title: "かんじドリル" };

export default function KanjiPage() {
  return <KanjiDrill kanji={getKanji()} />;
}
