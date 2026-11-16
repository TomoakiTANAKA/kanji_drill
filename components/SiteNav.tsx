"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/math/", label: "さんすう" },
  { href: "/kanji/", label: "かんじ" },
];

export default function SiteNav() {
  const path = usePathname();
  return (
    <nav className="site-nav">
      <Link href="/" className="home">
        🏠 おうちがくしゅう
      </Link>
      {TABS.map((t) => (
        <Link key={t.href} href={t.href} className={`tab ${path.startsWith(t.href) ? "active" : ""}`}>
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
