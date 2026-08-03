# Three.js導入前ベースライン

## Git状態

| 項目 | 値 |
| --- | --- |
| 基準branch | `origin/main` |
| 基準commit | `8a28087478cc858bc1e12908613947c5dad0234e` |
| 依頼文の参考commit | `994f3b869a1960dc1b2c305b6fd5b0e9359514b9`（最新ではない） |
| QA branch | `qa/threejs-acceptance-gate` |
| 開始時 `origin/gh-pages` | `1e43389d72e9bb25ce64cca3c2ab36d692af5357` |
| 本番変更 | なし |

Claude用worktreeに未コミットの製品変更が存在したため、stashやcheckoutを行わず別worktreeで完全に分離しました。

## 画面基準

ChromiumとWebKitを別基準として保存します。幅は `320 / 375 / 390 / 430 / 768 / 1024 / 1280 / 1440 / 1920`、ページは `/`、`/map/`、`/information/` です。

- 全幅・全ページ・通常motionのfull page JPEG
- 390/1440の全ページ・reduced-motion full page JPEG
- 390/1440の404 JPEG/PNG
- Section 3、4、5、6、地図、CTA、header、footerのfocused PNG
- ブラウザ、OS、commit、DPRを `env-*.json` に記録

保存先: `docs/qa-threejs-baseline/`

`manifest.json` に各証跡のbyte数とSHA-256を記録します。基準画像を更新した場合は `npm run qa:threejs:optimize-baseline && npm run qa:threejs:manifest` を実行し、画像だけでなくmanifest差分もレビューします。

JPEGは証跡用、focused PNGはPlaywrightのperceptual comparison用です。通常のThree.js Canvasと外部タイル成否で変化する地図stageは、描画ノイズを避けるためfocused比較時だけmaskします。地図の見出し、一覧、section高さはmaskしません。ピン座標、先端、余白、DOM geometry、文字矩形、Canvas範囲は別テストで判定するため、maskで衝突を隠しません。

## 現行の意味

- Three.js QA hook: 存在しない（導入前の期待値）
- WebGL renderer: 0
- WebGL canvas: 0
- 先生の6項目: 回帰ゲート対象
- 既存のSilkTrail等: reduce時に情報を欠落させないこと
- ピン座標: `お富ちゃん家 36.2561208,138.8914794`、`キリンヤ 36.25773372,138.88893693`、`カフェドローム 36.255608,138.889552`

数値は `docs/qa-threejs-baseline/metrics/` のJSONを正とします。本文へ手作業で転記した丸め値を判定には使いません。

## 実測サマリ

| profile | transfer | script transfer | Canvas / WebGL | CLS | LCP | frame p95 / worst |
| --- | ---: | ---: | --- | ---: | ---: | ---: |
| Chromium 1440 | 1,361,073 B | 794,531 B | 1 / 0 | 0 | 468 ms | 16.8 / 17.1 ms |
| Chromium 390 | 1,361,073 B | 794,531 B | 1 / 0 | 0 | 408 ms | 17.0 / 18.3 ms |
| WebKit 1440 | 1,297,997 B | 795,245 B | 1 / 0 | 0 | 732 ms | 33 / 37 ms |
| WebKit 390 | 1,297,997 B | 795,245 B | 1 / 0 | 0 | 260 ms | 29 / 33 ms |

Canvas 1枚は導入前からある非WebGL Canvasです。WebGLは0です。Long Tasks APIはChromiumでのみ取得でき、今回のdev-server測定ではdesktop `98/83 ms`、mobile `60 ms` を観測しました。WebKitの空配列は0件を証明せず、API非対応として扱います。

## 既知baseline警告

- 320pxの情報ページ等で「ください」が行をまたぐ箇所を半自動監査が検出しました。固有名詞・`data-ja-unit`・「くだ/さい」の明示的保護対象は1行を維持していますが、Three.js受け入れのstrict modeではこの警告もFAILに昇格します。
- Next dev serverは一部遅延画像についてLCP候補への`loading="eager"`提案をconsole warningとして出します。`console.error`、page error、HTTP errorではありません。製品コード非編集ルールに従い、このQA branchでは修正していません。
- 現行UIにはQRコードまたはクリップボードへURLをコピーする操作はありません。表示URL、canonical、OGP、共有リンク、robots、sitemapと静的出力内の旧GitHub Pages URL不在を自動確認します。
