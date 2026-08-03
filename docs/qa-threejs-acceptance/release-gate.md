# Release gate

## 判定語

- `PASS`: 全必須自動gateと対象実機gateが成功し、未説明差分0。
- `PASS WITH MINOR ISSUES`: 利用不能・再発・性能予算違反でない軽微事項のみ。owner/期限/再現手順がある。
- `FAIL`: 必須gateが1件でも失敗。公開不可。
- `BLOCKED`: branch/hook/端末/権限などが無く判定不能。未実行をPASSにしない。

## 即FAIL

- 先生の6項目の再発、ピン座標変更、ピン先端移動。
- `main`/`gh-pages`/本番の無断変更。
- 横scroll、CTA不能、地図不能、scroll jack、mobileの長いpin。
- WebGL失敗時にDOM本文/CTAが消える。
- reduceで情報欠落、RAF/Canvas/ScrollTriggerの継続。
- renderer/Canvas/RAF/observer/listener/resourceの増殖/cleanup漏れ。
- console error、page error、WebGL error、shader compile error、同一origin 404。
- 不自然な日本語分断、本文全体nowrapによるoverflow。
- build、lint、typecheck、必須E2Eの失敗。
- 200ms超long task、重大な入力停止、性能予算超過を説明なく許容。

## Release checklist

1. 監査branchが最新feature + QA commitだけである。
2. diffに `src/`、`public/`製品素材、production configのQA由来変更がない。
3. `lint`, `typecheck`, `/tomioka` base path buildが成功。
4. build metrics compareが成功。
5. Chromium/WebKitで `THREEJS_ACCEPTANCE=1` 全spec成功。
6. baseline/current/diffを3枚で確認し、意図しない差分0。
7. 先生の6項目を両engineで再確認。
8. physical iPhone/Androidの必須項目を実施、または明確にBLOCKED。
9. console/network/WebGL/shader error 0。
10. reviewerが最終判定と証跡pathを記録。

## 証跡

- 基準画像: `docs/qa-threejs-baseline/`
- runtime/build数値: `docs/qa-threejs-baseline/metrics/` と `test-results/threejs-acceptance/`
- failure trace/video/screenshot: `test-results/threejs-acceptance/`
- 判定表: `acceptance-matrix.md`

基準画像更新は独立したレビュー対象です。featureに合わせて一括上書きしてFAILを隠すことは禁止します。
