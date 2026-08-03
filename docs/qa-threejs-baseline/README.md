# Pre-Three.js visual/performance baseline

このディレクトリは `origin/main@8a28087478cc858bc1e12908613947c5dad0234e` の不変基準です。

基準画像は116枚、約38 MBです。1枚最大約1.47 MB、総数200枚以下・総量80 MB以下の運用予算内です。

- `full/<browser>/<route>/`: full-page JPEG evidence
- `visual/<browser>/<state>/`: Playwright focused PNG snapshots
- `metrics/`: build/runtime JSON
- `env-<browser>.json`: capture environment
- `manifest.json`: 各証跡のbyte数とSHA-256

更新は `THREEJS_CAPTURE_BASELINE=1` を明示した基準更新だけで行います。feature監査では `npm run qa:threejs:visual` を使い、基準を上書きしません。ChromiumとWebKitの画像同士は比較せず、同一OS/同一browser project内だけで比較します。

baseline更新時は `npm run qa:threejs:manifest` を実行し、manifest差分も必ずレビューします。
