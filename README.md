# おうちがくしゅう

親子で使う家庭学習サイト。算数の宿題サポート（段階的な穴埋め）と漢字ドリルをまとめたもの。
Next.js（App Router）の静的出力で、記録はブラウザの localStorage に保存する。

## ページ

| URL | 内容 |
|---|---|
| `/` | トップ（算数／漢字の入口） |
| `/math/` | 算数の単元一覧 → 段階一覧 → 各段階 |
| `/kanji/` | 漢字ドリル |
| `/kanji/retest/<N>/` | 漢字の再テスト（正解するまで残る） |
| `/records/` | 全記録の書き出し・読み込み（JSON） |

## ローカル

```sh
npm install
npm run dev     # http://localhost:3000
npm run lint
npm run build   # out/ に静的ファイルを出力
```

## 算数：コンテンツの作り方

1. 宿題のページを撮影し、Claude との会話で「例題 → 空欄が増えていく類題 → 宿題本体」の md を作る
2. md を読んで論理・計算をチェックする（md には答えまで書いてある）
3. `content/math/<単元>/01.md, 02.md …` に置いて push

```md
---
title: 割合(4) 利益を上乗せ ①
order: 1
source: 基本トレーニング 文章題・図形5級 p.30 大問1(1)
---

200円で仕入れた品物に、20%の利益をみこんで定価をつけました。定価はいくら？

1. 120%は何倍？ → 1.2倍
2. 式と答え → 200 × 1.2 ＝ [[240]]円
```

- `[[答え]]` が空欄になり、タップで答えが出る
- 番号の大きい段階ほど空欄を増やす。最後の段階が「しゅくだい」
- 生の HTML は表示されない。メモは frontmatter に `# ...` の YAML コメントで書く

## 漢字：一日の流れ

1. `/kanji/` → グループ選択（複数可、デフォルト全選択） → 「はじめる」
2. よみ → 紙に書く → 「こたえを みる」 → 「つぎへ」 or 「OK」（キーボードは Space / ← / →）
3. 終わったら「おぼえたCSVをDL」
4. 翌日（別の端末など）：「前日の『おぼえたCSV』を読みこむ」で選ぶと、その漢字は出題されなくなる

データは `content/kanji/` の CSV を編集して push。

- `kanji.csv`: `ID,グループ,漢字,音読み,訓読み`
- `question.csv`: `kanji_id,漢字,問題番号,問題文（読み）,答え,例文`
- 再テスト: `retest/<N>.csv`（`番号,例文,ヒント,答え`）を置き、`retest/sets.json` に追記
- CSV のフィールドにカンマは入れない

## デプロイ

`main` への push で GitHub Actions（`.github/workflows/pages.yml`）がビルドし、GitHub Pages に配置する。
初回のみ Settings → Pages → Source = `GitHub Actions`。

記録は端末・URL ごとに別。URL を変える（Cloudflare Pages へ移すなど）ときは、`/records/` で書き出して新しい URL で読み込む。

詳しくは `CLAUDE.md` と `docs/PLAN.md`。
