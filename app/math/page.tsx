import type { Metadata } from "next";
import Link from "next/link";
import { getMathUnits } from "@/lib/content";
import { UnitCount } from "@/components/math/Progress";

export const metadata: Metadata = { title: "さんすう" };

export default function MathIndex() {
  const units = getMathUnits();
  return (
    <div className="app">
      <header className="app-header">
        <h1 className="brand">さんすう</h1>
      </header>
      <main className="app-main top">
        <div className="list">
          {units.map((u) => (
            <Link key={u.unit} className="list-item" href={`/math/${u.unit}/`}>
              <div>
                <div className="name">{u.title}</div>
                <UnitCount unit={u.unit} steps={u.steps.map((s) => s.step)} />
              </div>
              <span className="meta">→</span>
            </Link>
          ))}
          {units.length === 0 && <p className="lead">まだ たんげんが ありません</p>}
        </div>
      </main>
    </div>
  );
}
