# 教員フィードバック修正 QA

実施日: 2026-08-03

## 比較条件

- 変更前: `9f0e91b`
- 変更後: 本ディレクトリを含むコミット
- ブラウザ: Playwright の Chromium プロジェクト（インストール済み Google Chrome）と WebKit
- ビューポート: 320 / 375 / 390 / 430 / 768 / 1024 / 1280 / 1440 / 1920 px
- 動き: 比較画像の差を安定させるため `prefers-reduced-motion: reduce` とアニメーション停止 CSS を使用

`before/` と `after/` に、Section 3〜6と街歩きマップの同一条件スクリーンショットを保存した。数値結果は `after/report-chromium.json` と `after/report-webkit.json` に保存している。

## 判定

- Section 3: 番号矩形と縦線の交差 0 件
- Section 4: 1024 / 1280 / 1440 / 1920 pxで全6施設名が各1行
- Section 5: 案内ラベルと装飾線の交差 0 件
- Section 6: canonical / OGP / footerリンクが正式URLと一致
- マップ: 6ピンすべてが 56 × 62 px、先端アンカーを基準に配置。対象3施設の座標値も自動照合
- モバイルマップ: 一覧は通常フロー、詳細時だけオーバーレイ。スクロール終端まで到達でき、セクション末尾の余剰領域 1 px 以下
- 全幅: document/body の横方向オーバーフロー 0 px

差分は、指示された重なり・改行・線・URL・ピン・空白の変更として分類した。意図しない視覚差分や判定不能な差分は確認されなかった。

## 実行

```bash
QA_BASE_URL=http://localhost:3000 npm run test:e2e:teacher
```

WebKitはSafari系レンダリングの回帰確認として使用した。実機固有のアドレスバー、低電力モード、GPU、熱挙動まではこの自動試験の対象外である。
