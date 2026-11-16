// 旧版と同じ単純な CSV パーサ。
// フィールド内のカンマ・ダブルクォートには対応していない（CSV 側にカンマを入れないこと）。
export function parseCSV(text: string): Record<string, string>[] {
  const lines = text
    .replace(/^﻿/, "")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .filter((l) => l.length > 0);
  const header = (lines.shift() ?? "").split(",").map((h) => h.trim());
  return lines.map((line) => {
    const cols = line.split(",");
    const row: Record<string, string> = {};
    header.forEach((h, i) => (row[h] = (cols[i] ?? "").trim()));
    return row;
  });
}
