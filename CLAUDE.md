# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

親子だけで使う家庭学習サイト。**Next.js（App Router）の静的出力**で、算数の宿題サポートと漢字ドリル（小4・57字）を1つにまとめている。計画は `docs/PLAN.md`。

- フレームワーク: Next.js 16 / React 19 / TypeScript。`output: "export"` でビルド時にすべてのページを HTML 化する（サーバ処理なし）
- データ: `content/` 配下の Markdown（算数）と CSV（漢字）。ビルド時に Server Component が読む
- 永続化: ブラウザの `localStorage` のみ（`lib/storage.ts` 経由）
- デプロイ: `main` への push で `.github/workflows/pages.yml` が `npm run build` → `out/` を GitHub Pages に配置

Next.js はこのバージョンで API が変わっている点がある。コードを書く前に `node_modules/next/dist/docs/` を確認すること（`AGENTS.md` 参照）。

## 開発コマンド

```sh
npm run dev     # http://localhost:3000
npm run lint
npm run build   # out/ に静的ファイルを出力
# サブパス配信（GitHub Pages）と同じ形で確認したいとき
NEXT_PUBLIC_BASE_PATH=/kanji_drill npm run build
```

テストの仕組みはまだない。

## 構成

```
app/
  page.tsx                       トップ（算数／漢字の入口）
  math/page.tsx                 単元一覧
  math/[unit]/page.tsx          段階一覧
  math/[unit]/[step]/page.tsx   1段階の表示
  kanji/page.tsx                 漢字ドリル（旧 index.html）
  kanji/retest/[set]/page.tsx    再テスト（旧 test.html?set=N）
  records/page.tsx               全記録の JSON 書き出し・読み込み
components/kanji/                漢字の画面（Client Component）
components/math/                空欄 Blank・本文 StepBody・進み具合
lib/content.ts                   content/ の読み込み（server-only）
lib/storage.ts                   localStorage の読み書き（算数・漢字共通）
lib/remarkBlanks.ts              Markdown の [[答え]] を空欄に変える remark プラグイン
content/kanji/                   kanji.csv / question.csv / retest/{sets.json, N.csv}
content/math/<単元>/NN.md       算数の段階（frontmatter: title, unit, order, source）
public/test.html                 旧 URL からのリダイレクト
```

動的ルートはすべて `generateStaticParams` + `dynamicParams = false`。content を足せばビルドでページが増える。

## 算数コンテンツ

- 1単元＝1フォルダ、1段階＝1ファイル。`order` 順に並ぶ。最後の段階が「しゅくだい」扱い
- 空欄は `[[答え]]`。タップで答えを表示する
- 本文は react-markdown で描画し、生の HTML は表示しない（HTML コメントも文字として出るので、メモは frontmatter に YAML コメントで書く）

## 漢字データ

- `kanji.csv`: `ID,グループ,漢字,音読み,訓読み`
- `question.csv`: `kanji_id,漢字,問題番号,問題文（読み）,答え,例文`（例文は任意。例文中に読みがあればハイライト）
- 再テスト: `retest/N.csv`（`番号,例文,ヒント,答え`、□ または（…）が空欄）。セットを足すときは `retest/sets.json` にも追記する
- `lib/csv.ts` は単純な `split(",")`。**フィールド内のカンマには対応していない**

## 永続化キー（変えると既存の記録が消える）

| キー | 内容 |
|---|---|
| `kanji_drill_v2` | 漢字ドリル `{id: {level, due}}`。OK→`level=1, due=今日+2日`、つぎへ→`level=0, due=今日` |
| `kanji_drill_excluded_v1` | 除外漢字 ID の配列（おぼえたCSVの読み込みで追加） |
| `kanji_retest_v1` / `kanji_retest2_v1` | 再テスト `{id: {done}}`（キー名は `retest/sets.json`） |
| `math:progress` | 算数 `{単元: {段階: できた日時ISO}}` |

- 漢字のキーは旧版（静的HTML版）と同じ。GitHub Pages の同じ URL で配信しているので記録はそのまま引き継がれる
- 状態の形を変えるときはキーのサフィックス（`_v2` など）を上げる
- 新しいキーは `領域:名前` の形にし、`lib/storage.ts` の `MANAGED_KEY_PATTERNS` に入るようにする（書き出し対象になる）
- 将来 API 保存を足すときは `lib/storage.ts` の `subscribe()` で変更を受け取ってサーバに送る。画面側は `load`/`save` しか使わない

## 改修時の注意

- `localStorage` はビルド時には無い。Client Component では `useHydrated()` が true になってから読む（`KanjiDrill` / `Retest` の形を参照）
- キーボード操作: Space/Enter で答え、`→` で OK（せいかい）、`←` でつぎへ（まちがい）。UI を変えたらここも直す
- 内部リンクは `next/link` を使う（basePath が自動で付く）。`<a href="/...">` を直書きするとサブパス配信で壊れる
- 親ディレクトリ `/Users/ttanaka/Projects/TomoakiTANAKA/CLAUDE.md` にリポジトリ全体の俯瞰がある。本プロジェクト固有の話はこちらに書く
