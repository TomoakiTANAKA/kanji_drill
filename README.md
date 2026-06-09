# かんじドリル

子ども向け 漢字書き取り練習アプリ（4年・57字）。単一HTML + CSVデータ。

## 使い方（ローカル）

```sh
python3 -m http.server 8765
# http://localhost:8765/ をブラウザで開く
```

直接 `index.html` をダブルクリックするとCSVが読めません。必ずHTTP越しに。

## デプロイ（GitHub Pages / GitHub Actions）

`.github/workflows/pages.yml` で main への push を自動デプロイ。

初回セットアップ：

1. リポジトリの **Settings → Pages**
2. **Source** = `GitHub Actions` を選択
3. main へ push すると自動でビルド・デプロイ
4. `https://<user>.github.io/<repo>/` で公開

## 一日の流れ

1. 起動 → グループ選択（複数可、デフォルト全選択） → 「はじめる」
2. よみ→こたえを見る→「もう一回」or「OK」
3. 終わったら「おぼえたCSVをDL」 → ファイルを保存
4. 翌日：起動画面の「前日の『おぼえたCSV』を読みこむ」でDLしたCSVを選択
5. 除外リストに追加され、その漢字は出題されなくなる

## データ更新

`data/kanji.csv` / `data/question.csv` を編集してpushするだけ。

- `kanji.csv`: `ID,グループ,漢字,音読み,訓読み`
- `question.csv`: `kanji_id,漢字,問題番号,問題文（読み）,答え`
