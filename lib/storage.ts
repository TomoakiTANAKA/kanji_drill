"use client";
// 学習記録の読み書き（算数・漢字共通）。
//
// いまは localStorage だけに保存する。将来 API（Cloudflare Pages Functions + D1 など）で
// 保存したくなったら、subscribe() で変更を受け取ってサーバに送る同期モジュールを足せばよい。
// 画面側のコードは load/save だけを使い、保存先を意識しない。
//
// キーの決まり:
//   - 漢字の既存キー（kanji_drill_v2 など）は旧サイトとの互換のため名前を変えない
//   - 新しく作るキーは「領域:名前」の形にする（例: math:progress）

/** このサイトが管理するキー。書き出し・読み込みの対象 */
export const MANAGED_KEY_PATTERNS: RegExp[] = [/^kanji_/, /^math:/];

type Listener = (key: string, value: unknown) => void;
const listeners = new Set<Listener>();

function ls(): globalThis.Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = ls()?.getItem(key);
    return raw == null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function save<T>(key: string, value: T): void {
  try {
    ls()?.setItem(key, JSON.stringify(value));
  } catch {
    // 容量オーバーやプライベートモードでは保存できないことがある
  }
  listeners.forEach((fn) => fn(key, value));
}

export function remove(key: string): void {
  ls()?.removeItem(key);
  listeners.forEach((fn) => fn(key, undefined));
}

/** 保存のたびに呼ばれる。API 同期を足すときの差し込み口 */
export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/* ---------- 全記録の書き出し・読み込み（端末・ドメインの引っ越し用） ---------- */

export type Backup = { version: 1; exportedAt: string; data: Record<string, unknown> };

function isManaged(key: string) {
  return MANAGED_KEY_PATTERNS.some((re) => re.test(key));
}

export function exportAll(): Backup {
  const store = ls();
  const data: Record<string, unknown> = {};
  if (store) {
    for (let i = 0; i < store.length; i++) {
      const key = store.key(i);
      if (key && isManaged(key)) data[key] = load(key, null);
    }
  }
  return { version: 1, exportedAt: new Date().toISOString(), data };
}

/** 書き出したファイルを読み込む。管理対象のキーだけを上書きし、件数を返す */
export function importAll(backup: Backup): number {
  if (!backup || backup.version !== 1 || typeof backup.data !== "object") {
    throw new Error("形式がちがいます");
  }
  const keys = Object.keys(backup.data).filter(isManaged);
  keys.forEach((k) => save(k, backup.data[k]));
  return keys.length;
}

/* ---------- 小物 ---------- */

export function downloadText(filename: string, text: string, type = "text/plain") {
  const blob = new Blob([text], { type: `${type};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function dateStamp(d = new Date()) {
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}
