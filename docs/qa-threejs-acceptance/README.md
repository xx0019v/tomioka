# Three.js 独立受け入れQA

このディレクトリは、`feature/threejs-apple-class-scroll` を製品コードの実装者とは独立して判定するための仕様です。QAコードは `qa/threejs-acceptance-gate` にのみ置き、`main`、`gh-pages`、本番には直接反映しません。

## 基準と対象

- 依頼文に記載された旧基準: `994f3b869a1960dc1b2c305b6fd5b0e9359514b9`
- QA開始時の最新 `origin/main`: `8a28087478cc858bc1e12908613947c5dad0234e`
- 基準画像・性能値: 後者から取得
- 受け入れ対象: `origin/feature/threejs-apple-class-scroll`
- 正式URL: `https://mayu-no-chizu.cid-ac.com/`

古いハッシュへ巻き戻さず、「最新 `origin/main` を基準にする」という依頼を優先しています。

## テスト層

1. DOM geometry: 先生の6項目、文字矩形、Section位置、ピン先端、余白、横overflow。
2. Runtime contract: renderer、RAF、ScrollTrigger、observer、listener、GPU resource、context loss。
3. Interaction/accessibility: native scroll、CTA、地図入力モード、キーボード、reduce。
4. Performance: build byte、転送量、CLS/LCP、long task、frame duration、`renderer.info`。
5. Visual regression: Chromium/WebKit別の静止基準。Canvas/地図タイルは必要箇所だけmaskし、文字とSectionはmaskしません。

## 現行mainでの実行

```bash
npm ci
npm run lint
npm run typecheck
npm run qa:threejs:build-baseline
npm run qa:threejs:capture-baseline
npm run qa:threejs:all
```

現行mainではThree.js専用テストは「将来対象」として明示的にskipされます。これはThree.jsを合格扱いしたことを意味しません。先生の6項目、スクロール、組版、a11y、性能、視覚基準は実行されます。

2026-08-03の実測値と自動試験結果は [current-main-results.md](./current-main-results.md) に固定しています。

## Claudeブランチ監査手順

製品ブランチを直接編集しないため、専用の一時監査ブランチ/worktreeを作ります。

```bash
git fetch origin main qa/threejs-acceptance-gate feature/threejs-apple-class-scroll
git worktree add -b qa/audit-threejs-local ../tomioka-threejs-audit origin/feature/threejs-apple-class-scroll
cd ../tomioka-threejs-audit
git cherry-pick <qa/threejs-acceptance-gate のQA commit>
npm ci
NEXT_PUBLIC_THREEJS_QA=1 npm run qa:threejs:build-compare
THREEJS_ACCEPTANCE=1 NEXT_PUBLIC_THREEJS_QA=1 npm run qa:threejs:accept
```

`package.json` で競合した場合は、Claude側の依存関係を保持し、QA側からは `qa:*` scriptsだけを加えます。監査用ブランチは `main` やfeatureへmergeせず、判定後にworktreeを除去します。

## QA hook

受け入れモードは `window.__THREEJS_QA__` version 1を要求します。公開本番で常時露出させず、`NEXT_PUBLIC_THREEJS_QA=1` の検証ビルドだけで有効にします。契約詳細は [webgl-test-plan.md](./webgl-test-plan.md) を参照してください。

## 判定

最終判定は [release-gate.md](./release-gate.md) の `PASS / PASS WITH MINOR ISSUES / FAIL / BLOCKED` のいずれかです。自動テストを実行していない、物理iPhoneを確認していない、hookが無い、といった項目を推測でPASSにはしません。
