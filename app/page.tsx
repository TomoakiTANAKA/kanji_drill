import Link from "next/link";
import { getRetestSets, getMathUnits } from "@/lib/content";

export default function Home() {
  const units = getMathUnits();
  const retests = getRetestSets();
  return (
    <div className="app wide">
      <main className="app-main top">
        <div className="portal">
          <Link href="/math/">
            <div className="icon">🧮</div>
            <div className="label">さんすう</div>
            <div className="sub">しゅくだいの れんしゅう（{units.length} たんげん）</div>
          </Link>
          <Link href="/kanji/">
            <div className="icon">✏️</div>
            <div className="label">かんじドリル</div>
            <div className="sub">よみを かんじで かこう</div>
          </Link>
        </div>
        <div className="list" style={{ maxWidth: 760 }}>
          {retests.map((s) => (
            <Link key={s.id} className="list-item" href={`/kanji/retest/${s.id}/`}>
              <div className="name">かんじ再テスト {s.label}</div>
              <span className="meta">→</span>
            </Link>
          ))}
          <Link className="list-item" href="/records/">
            <div>
              <div className="name">きろくの かきだし・よみこみ</div>
              <div className="meta">べつの端末・べつのURLへ うつすとき（おうちのひと用）</div>
            </div>
            <span className="meta">→</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
