# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

子ども向け（小学4年・57字想定）の漢字書き取り練習Webアプリ。**単一の `index.html` + CSVデータ**のみで動作し、ビルドステップやサーバ側ロジックは持たない。GitHub Pages で静的配信される。

- ホストアプリ: 静的HTML（バニラJS、外部ライブラリなし）
- データ: `data/kanji.csv`（漢字マスタ）と `data/question.csv`（問題）
- 永続化: ブラウザの `localStorage` のみ
- デプロイ: `main` への push を `.github/workflows/pages.yml` が GitHub Pages に自動デプロイ

## 開発コマンド

ビルド・テスト・lint の仕組みは存在しない。動作確認はローカルHTTPサーバ経由でブラウザを開く。

```sh
# プロジェクトルートで
python3 -m http.server 8765
# ブラウザで http://localhost:8765/ を開く
```

**重要**: `index.html` をファイル直開き（`file://`）すると `fetch` でCSVを読めずに失敗する。必ずHTTP越しに開くこと。

## アーキテクチャ

### ファイル構成

```
index.html              # アプリ全体（HTML/CSS/JSすべて埋め込み）
data/kanji.csv          # ID,グループ,漢字,音読み,訓読み
data/question.csv       # kanji_id,漢字,問題番号,問題文（読み）,答え,例文
.github/workflows/pages.yml  # GitHub Pages 自動デプロイ
```

### データモデル

`loadData()` が起動時に両CSVを読み、`kanji_id` で結合した `KANJI` 配列を作る。各要素は `{id, group, kanji, q: [{reading, answer, example}, ...]}`。例文がある問題は出題時に該当箇所がハイライト表示される（`highlightInExample`）。

問題なし（`q.length === 0`）の漢字は除外される。

### 出題ロジック

1. ユーザがグループを複数選択（デフォルト全選択）。
2. `buildQueueFromGroups()` が、選択グループ × 除外対象でない × `due <= today` の漢字IDを `id` 昇順で並べる。
3. 1問ごとに `pick(k.q)` で問題をランダム選択。
4. 「OK」→ `level=1`, `due = 今日 + 2日`（軽い間隔反復）。「つぎへ」→ `level=0`, `due=今日`（その日のうちに再出題される可能性あり）。

### 永続化キー

- `kanji_drill_v2`: 学習状態 `{id: {level, due}}`（`STORE_KEY`）
- `kanji_drill_excluded_v1`: 除外漢字IDのSet（`EXCLUDE_KEY`）

CSVの「おぼえたCSVをDL」→翌日「読みこむ」のフローは、`localStorage` がデバイス間で共有されない前提のバックアップ手段。読み込んだIDは**除外リストに追加**され、以降そのグループに含まれていても出題されない。

### CSVパーサの制約

`parseCSV()` は単純な `split(",")` 実装。**フィールド内のカンマやダブルクォートには対応していない**。CSVを編集する際は、問題文や例文にカンマを含めないこと（含める場合はパーサ側の改修が必要）。

## データ更新

`data/*.csv` を直接編集して push するだけで反映される。スキーマ:

- `kanji.csv`: `ID,グループ,漢字,音読み,訓読み`
- `question.csv`: `kanji_id,漢字,問題番号,問題文（読み）,答え,例文`
  - `例文` は任意。空でも動く。
  - 例文中に「問題文（読み）」の文字列がそのまま含まれていれば、その箇所がハイライトされる。

## デプロイ

`main` への push で GitHub Actions（`pages.yml`）がリポジトリ全体をそのまま Pages にアップロードする。ビルドステップなし。初回のみ Settings → Pages → Source = `GitHub Actions` の設定が必要。

## 改修時の注意

- 状態スキーマを変えるときは `STORE_KEY` のサフィックス（現在 `_v2`）を上げる。既存ユーザの壊れた state を引き継がせないため。
- キーボード操作: Space/Enter で答えを表示、`→` でOK、`←` で「つぎへ」（`document.addEventListener("keydown", ...)`）。UI変更時はこの分岐も忘れずに更新する。
- 親ディレクトリ `/Users/ttanaka/Projects/TomoakiTANAKA/CLAUDE.md` にリポジトリ全体（複数プロジェクト）の俯瞰がある。本プロジェクト固有の話はこちらに書くこと。
