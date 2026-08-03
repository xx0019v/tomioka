# Current main baseline execution

実行日: 2026-08-03 JST

対象: `origin/main@8a28087478cc858bc1e12908613947c5dad0234e`

実行環境: macOS arm64、Chromium（installed Google Chrome）、Playwright WebKit、DPR 1

配信形態: Next.js production static export、`NEXT_PUBLIC_BASE_PATH=/tomioka`

## 結果

| gate | result |
| --- | --- |
| `npm ci` | PASS、追加依存0、audit 0 vulnerabilities |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run qa:threejs:build-compare` | PASS |
| `npm run qa:threejs:all` | PASS: 48 passed / 20 intentionally skipped / 0 failed、4.4分 |
| 既存 `test:e2e:teacher` | PASS: 8 passed / 0 failed、33.7秒 |
| focused visual regression | PASS: Chromium / WebKit、46画像 |

20 skipはThree.js未導入のmainでは成立しないhook、Canvas、cleanup、context loss、capability切替のfeature専用項目です。現在mainをThree.js受け入れ済みと扱うskipではありません。`THREEJS_ACCEPTANCE=1` のfeature監査では実行対象になります。

## 先生の6項目

1. Section 3: 320/375/390/430pxで01〜03と1px縦線の矩形交差0、Canvas/SVGによる遮蔽0。
2. Section 4: 1024/1280/1440/1920pxで6施設名が1行、14px以上、カード内、overflow 0。
3. Section 5: 1280/1440/1920pxで文字と案内線の交差0、Canvas/SVGによる遮蔽0。
4. Section 6: 表示、href、canonical、OGP、共有、robots、sitemap、生成HTMLが正式URL。静的出力内の旧GitHub Pages URLは0件。
5. 地図ピン: 3施設の緯度経度不変、`iconAnchor [28,62]`。390/1440px・通常motionの5時点で先端変動0.1px以下gateを通過。
6. map末尾: mobile 4幅でtrailing gap 1px以下、一覧末尾到達、負margin・次要素との重なり・横overflowなし。

## Build baseline

- static export: 83 files / 3,816,148 B
- JavaScript: 19 files / 900,968 B / gzip 271,374 B
- CSS: 114,743 B / gzip 21,425 B
- HTML: 6 files / 208,955 B
- images: 23 files / 2,300,253 B
- source maps: 0
- `/`, `/map/`, `/information/`, 404, robots, sitemap, `.nojekyll`: 全て存在
- canonical / Open Graph / robots sitemap / sitemap home: 正式URL
- `https://xx0019v.github.io/tomioka`: 生成物内0件

正規データは `docs/qa-threejs-baseline/metrics/build.json`、画像・JSONのSHA-256は `docs/qa-threejs-baseline/manifest.json` にあります。

## 制約

- 物理iPhone、物理Android、Safari UIのアドレスバー変動、safe-area実値、低電力モード、熱スロットリング、VoiceOverは未検証です。
- Playwright WebKit mobileはmouse wheel APIを提供しないため、view modeのpage scrollと入力レイヤーをWebKitで、実wheel/dragをChromiumで相互補完しています。物理端末のswipeは別gateです。
- WebKitではLong Tasks APIが利用できず、空配列を0件の証明としていません。
- HMRの実発火、Three.js cleanup、WebGL context lost/restore、HIGH/MEDIUM/LOW/STATIC切替はfeatureとQA hookが揃うまでBLOCKEDです。
- 320pxの情報ページ等で半自動監査が「ください」の行跨ぎ候補を検出しています。既存の明示保護対象は1行ですが、feature受け入れのstrict modeでは候補もFAILに昇格します。
- Next dev serverのLCP画像`loading="eager"`提案はwarningです。production static exportのconsole error、page error、同一origin 4xx/5xxは0でした。

現在mainのThree.js導入前baseline判定は `PASS`、Three.js feature自体の最終判定は未監査のため `BLOCKED` です。
