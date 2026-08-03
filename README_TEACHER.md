# 繭が遺した地図｜富岡まち歩き謎解き

## 作品概要

2026年8月8日に富岡製糸場周辺商店街で開催する、まち歩き型リアル謎解きイベントの告知・参加案内サイトです。開催情報、参加方法、受付地点、街歩きスポットと地図を掲載しています。謎の回答、攻略情報、ゲーム本編を配信するサイトではありません。

## 共有URL

- 公開サイト: https://xx0019v.github.io/tomioka/
- 正式案内URL: https://mayu-no-chizu.cid-ac.com/
- GitHub: https://github.com/xx0019v/tomioka

## 提出バージョン

- 採用ブランチ: `main`
- 採用commit: `24ded911bce6f6d14471cadb97cae9126f8ea754`
- 採用commit日時: 2026-08-04 07:56:40 +0900
- 提出資料作成日時: 2026-08-04 08:22:06 +0900
- 検証Node.js: `v26.4.0`（Next.jsの要件は`>=20.9.0`）
- 検証npm: `11.17.0`
- パッケージ管理: npm / `package-lock.json`

提出ブランチ`docs/teacher-source-handoff`では、採用実装を変更せず、クリーンインストールに必要なlockfile・Three.js型定義と先生向け資料だけを追加・整備しています。

## 使用技術

- Next.js 16.2.11（App Router、静的export）
- React 19.2.4 / TypeScript 5
- Three.js 0.185.1
- GSAP 3.15.0 / ScrollTrigger
- Leaflet 1.9.4 / OpenStreetMap
- CSS Modulesと共通CSS
- Playwright（Chromium / WebKit E2E）

Tailwind CSS、Vite、外部データAPI、サーバーDBは使用していません。

## 必要環境

- macOS、Windows、Linuxのいずれか
- Node.js 20.9.0以上
- npm（lockfileに合わせて`npm ci`を使用）
- Chrome、Edge、Firefox、Safariの現行版を推奨

## 起動方法

```bash
npm ci
npm run dev
```

ブラウザで http://localhost:3000/ を開きます。停止はターミナルで`Control + C`です。

## 本番ビルド

GitHub Pages用:

```bash
NEXT_PUBLIC_BASE_PATH=/tomioka \
NEXT_PUBLIC_DEPLOY_ORIGIN=https://xx0019v.github.io \
npm run build
```

静的成果物は`out/`へ生成されます。`out/.nojekyll`、`out/404.html`、`out/_next/`を含みます。

## 主要ディレクトリ

- `src/app/`: ページ、メタデータ、共通CSS
- `src/components/`: UI、地図、キャラクター、Three.js演出
- `src/data/`: 開催情報、施設情報、座標
- `src/lib/`: base path、端末性能判定、分析処理
- `public/`: 公開画像、写真、`.nojekyll`
- `assets/`: 制作用マスター素材
- `e2e/`: Playwrightテスト
- `docs/teacher-handoff/`: 先生向け資料

## 公開について

公開済みサイトは上記URLから閲覧できます。GitHub Pagesへの再公開は`gh-pages`ブランチを書き換えるため、先生側で実行する必要はありません。提出物の確認だけであれば、開発サーバーまたは公開用ビルドをHTTPサーバーで閲覧してください。

## 環境変数・権限・表示上の注意

- `NEXT_PUBLIC_BASE_PATH`: GitHub Pagesでは`/tomioka`、通常のローカル開発では未設定
- `NEXT_PUBLIC_DEPLOY_ORIGIN`: 公開ビルドのOGP画像URL生成に使用
- `NEXT_PUBLIC_SITE_URL`: 未設定時は正式案内URL
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`: 任意。未設定でもサイトは動作
- 位置情報: 「現在地を表示」を押した場合のみブラウザが許可を求めます。拒否しても一覧と地図は利用可能です。
- 地図: OpenStreetMapタイルへ接続します。オフライン時は施設一覧を利用できます。
- WebGL: 利用できない端末、低性能端末、reduced-motionでは静的表現へフォールバックします。
- 物理iPhoneは未確認です。Playwright WebKitによる自動検証は実施済みです。

詳細は`docs/teacher-handoff/`を参照してください。
