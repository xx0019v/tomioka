# 性能予算

## 比較原則

同一macOS、同一Chromium/WebKit、DPR 1、同一ネットワーク条件で `8a28087…` とfeatureを比較します。取得できないfpsを推測せず、rAF frame duration、long task、LCP、CLS、転送量を使います。Safari/WebKitではLong Tasks APIが無い場合、値を0と解釈せず「非対応」と扱います。

## Build budget

| 指標 | feature上限 |
| --- | --- |
| gzip JavaScript | baseline + 250 KB |
| static export総量 | baseline + 2 MB |
| HTML総量 | baseline + 50 KB |
| source map | 0 |
| `/`, `/map/`, `/information/`, 404, robots, sitemap, `.nojekyll` | 全て存在 |

## Runtime budget

| 指標 | PC 1440 | mobile 390 | reduce |
| --- | --- | --- | --- |
| WebGL Canvas | 1以下 | 1以下 | 描画0（原則WebGL 0） |
| renderer | 1 | 1またはLOW/STATIC設計値 | 0 |
| continuous RAF | 1以下 | 1以下 | 0 |
| DPR/backing ratio | 1.5以下 | 1.0以下推奨、最大1.5 | — |
| offscreen draw | 0 | 0 | 0 |
| ScrollTrigger | 20以下 | 12以下、pin原則0 | 0 |
| 同時pin | 1以下 | 0推奨 | 0 |
| 静止5秒long task | 0 | 0 | 0 |
| scroll long task | 2以下、worst 120ms以下 | 2以下、worst 150ms以下 | 0 |
| 200ms超task | 0 | 0 | 0 |
| frame p95 | 16.7ms目標、50ms以下gate | 33.3ms目標、50ms以下gate | — |
| CLS | 0.1以下かつbaseline +0.02以内 | 同左 | 同左 |
| LCP | baseline ×1.25 +250ms以内 | 同左 | 同左 |
| console/WebGL/shader error | 0 | 0 | 0 |

## renderer.info

QA hookは少なくとも `calls`、`triangles`、`geometries`、`textures` を返します。初期上限はdraw calls 120、texture 16。triangle数は作品実装前に一律の正解を捏造しないため、初回feature監査でscene構成と実測を記録し、以後の増加gateを固定します。

品質を落とす順は、描画解像度/DPR → effect/pass → particles/geometry → 更新頻度です。本文やCTAを消して性能を合わせることは禁止です。
