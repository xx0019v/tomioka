# 受け入れマトリクス

| 領域 | 自動化 | 対象 | PASS条件 |
| --- | --- | --- | --- |
| Section 3 | `threejs-regression-gates` | 320/375/390/430 | 01〜03と縦線の矩形交差0、中心点のtopmostが番号 |
| Section 4 | 同上 | 1024/1280/1440/1920 | 6施設名が1行、14px以上、カード内、overflow 0 |
| Section 5 | 同上 | 1280/1440/1920 | 強調文字と疑似線の交差0、文字がtopmost |
| 正式URL | 同上 | 全主要route/生成route | canonical、og:url、footer、share、robots、sitemapが正式URL |
| 地図ピン | 同上 | 390/1440 | 3座標不変、anchor `[28,62]`、5時点でtip誤差0.25px以下 |
| 地図下余白 | 同上 | 320/375/390/430 | trailing gap 1px以下、scroll end到達、負marginなし、重なりなし |
| 日本語 | `threejs-typography` | mobile 4幅 | 保護語1行、禁則違反/助詞孤立/ください分割/単位分離0 |
| native scroll | `threejs-scroll-mobile` | PC/mobile 8幅 | wheel/逆行/高速移動/末尾到達、scroll jackなし |
| map gesture | 同上 | mobile 4幅 | view時はpage scroll、明示enable後だけmap pan |
| 初期化 | `threejs-runtime-acceptance` | 390/1440 | renderer/canvas/RAF各1以下、再初期化で増殖0 |
| cleanup | 同上 | 1440 | dispose後renderer/canvas/RAF/ST/observer/listener/resource 0 |
| context loss | 同上 | 1280 | fallback表示、DOM/CTA/map利用可、restore後1 renderer |
| capability | 同上 | HIGH/MEDIUM/LOW/STATIC | 注入条件に対するmode一致、STATICは描画ループ0 |
| a11y | `threejs-accessibility` | 390/1280 | DOM、見出し、labels、keyboard、focus、44px、Canvas装飾化 |
| reduce | a11y/performance | 390 | 情報差分0、running/persistent/RAF/ST/WebGL描画0 |
| runtime性能 | `threejs-performance` | 390/1440 | baseline差分予算、error 0、overflow 0、frame/long task予算 |
| build性能 | `collect-build-metrics` | `/tomioka` export | gzip JS +250KB以内、全体+2MB以内、必須exportあり |
| 視覚回帰 | `threejs-visual-regression` | Chromium/WebKit | focused画像diff 1.5%以内かつgeometry全PASS |

## 半自動/物理端末が必要

- HMRを実際に発生させた後のCanvas/renderer増殖
- Safariのアドレスバー開閉、safe-area実値、低電力30fps、bfcache/別アプリ復帰
- 5〜10分連続動作の発熱・熱スロットリング
- VoiceOver読み上げ順と日本語固有名詞の読み
- 最悪のThree.js frame上での文字コントラスト

これらが未実施なら当該項目は `BLOCKED` または「自動範囲PASS・実機未検証」と記録します。
