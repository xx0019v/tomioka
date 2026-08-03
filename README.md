# 繭が遺した地図

2026年8月8日（土）に富岡製糸場周辺商店街で開催する、まち歩き型リアル謎解きイベントの告知・世界観紹介サイトです。

このリポジトリが担当するのは、イベント告知、ストーリー、開催情報、参加方法、受付アクセス、街歩きマップです。謎の回答入力、正誤判定、攻略進捗は扱いません。

## 公開ページ

- `/` — イベント告知・世界観・参加方法・受付アクセス
- `/map/` — イベントエリア、街歩きスポット、現在地
- `/information/` — 開催概要、参加案内、雨天・安全・プライバシー情報

## 開発

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm run build
```

GitHub Pages用の静的出力を検証する場合:

```bash
NEXT_PUBLIC_BASE_PATH=/tomioka \
NEXT_PUBLIC_SITE_URL=https://mayu-no-chizu.cid-ac.com/ \
npm run build
```

生成物は `out/` に出力されます。

## データ

- イベント基本情報: `src/data/site.ts`
- 街歩きスポット: `src/data/spots.ts`
- スポット写真: `public/spots/photos/`
- 写真出典・利用根拠: `docs/checkpoint-photo-provenance.md`

スポットの所在地、営業時間、休業情報は公開元とイベント当日の案内を照合して更新してください。未確定の問い合わせ先、企業名、ロゴ、ハッシュタグは、値が確定するまで公開画面へ表示しません。

イベントのスタート地点「お富ちゃん家 / 富岡市観光案内所」は、富岡市観光公式情報の `群馬県富岡市富岡1151-1`、上信電鉄 上州富岡駅から徒歩約5分を掲載しています。イベント受付時間は `9:00〜15:00` です。

## マップと現在地

- LeafletとOpenStreetMapを使用
- 地図の記号または一覧からスポット案内を開く
- 選択状態は `?spot=<slug>` と同期
- 戻る操作、Esc、閉じる操作で一覧へ復帰
- 現在地は「現在地を表示」を押した後だけ1回取得
- 緯度経度をGA4、サーバー、ブラウザ保存領域へ送信・保存しない
- 位置情報拒否、タイル読込失敗時も一覧とGoogleマップリンクを利用可能

## デザインとアクセシビリティ

- `premium-product-design` のUX、モーション、空間表現、QA基準を適用
- 深緑、生成り、墨、朱、金を基調に、絹糸、桑、繭、赤煉瓦、製糸機械、記録紙をレイヤー化
- 装飾オブジェクトは操作を妨げない `pointer-events: none`
- 主要操作は44px以上（本実装の基準値は56px）
- キーボード、フォーカス表示、Esc、ブラウザの戻る操作に対応
- `prefers-reduced-motion` ではアニメーションとトランジションを抑制
- 地図タイルが読めない場合も、2Dの世界観レイヤーとスポット一覧を表示

## 計測

`NEXT_PUBLIC_GA_MEASUREMENT_ID` が設定された場合だけGA4を読み込みます。

計測するイベント:

- `map_view`
- `spot_select`
- `locate_click`
- `geo_permission`
- `google_maps_click`
- `share_click`

位置情報の緯度経度はイベントパラメータへ含めません。

## 公開

本番URL:

<https://mayu-no-chizu.cid-ac.com/>

静的出力を `gh-pages` ブランチへ同期し、GitHub Pagesから公開します。旧ファイルが残らないよう、公開時は `out/` と公開ブランチを完全同期してください。
