# 富岡「繭が遺した地図」Webサイト

2026年8月8日に富岡製糸場周辺商店街で開催する、まち歩き型リアル謎解きイベントのモバイルWeb体験です。

## 構成

- `/` イベント紹介
- `/map/` チェックポイントと住所
- `/information/` 開催情報・注意事項
- `/game/` 参加者向け進行案内
- `/checkpoints/[slug]/` 各チェックポイント
- `/final/` 最終回答

`next build`で`out/`へ完全な静的ファイルを書き出します。公開先は
[GitHub Pages](https://xx0019v.github.io/tomioka/) で、`gh-pages` branchの
rootから配信します。Node.jsサーバーは不要です。

GitHub Pages向けの本番exportでは、base pathと公開URLをbuild時に指定します。

```bash
NEXT_PUBLIC_BASE_PATH=/tomioka \
NEXT_PUBLIC_SITE_URL=https://xx0019v.github.io/tomioka \
npm run build
```

`out/`へ`.nojekyll`を追加し、内容だけを`gh-pages` branchへ同期します。
独自サーバーへ移す場合は、base pathと`NEXT_PUBLIC_SITE_URL`をその配信先に
合わせて再buildしてください。

## 開発

```bash
npm install
npm run dev
npm run lint
npm run build
```

## 謎データの反映

謎本文・ヒント・答え・クリア文は`src/data/puzzles.ts`へ設定します。答えを平文で保存してはいけません。

正解候補ごとにハッシュを生成します。

```bash
npm run hash-answer -- ここに正解
```

出力されたSHA-256を、対応する`answerHashes`へ追加します。表記揺れがある場合は候補ごとに生成してください。

静的サイトであるため、ハッシュ判定は「ソースに平文を置かない」ための対策であり、完全な秘匿ではありません。厳密な不正防止が必要な場合は、担当教員の許可を得てPHPまたは外部APIで判定してください。

## GA4

`.env.local`へ次を設定します。

```text
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

入力された答えやキーワードそのものはGA4へ送りません。

## 開催状態・緊急告知

`src/data/site.ts`で次を管理します。

- `eventState`: `scheduled` / `open` / `cancelled` / `ended`
- `emergency.enabled`: 緊急バナー表示
- `emergency.tone`: `notice` / `warning` / `cancelled`
- 連絡先、ハッシュタグ、開催情報

## チェックポイントの地図・詳細機能（`/map`）

- 地図は Leaflet + OpenStreetMap タイル（APIキー不要・無料）。
- マーカーは役割別（始点/終点=朱・通常=墨緑・解答休憩=金）。現在地に最も近い地点は `map-marker--near` で強調。
- マーカー／一覧選択で詳細パネルを表示（スマホ=下部シート、PC=右サイドパネル）。`?checkpoint=<slug>` でURL同期し、ブラウザの戻る・Escで閉じられる。
- 「現在地」ボタンは位置情報を取得できない/拒否された場合もUIが壊れず、一覧から選べる旨を案内する。
- GA4イベント（測定ID未設定時は送信しない）: `map_view` / `checkpoint_select` / `google_maps_click` / `checkpoint_page_click` / `locate_click` / `geo_permission`。

## 要確認事項（公開前に必ず確認）

**データの確度**

- チェックポイントの `sourceStatus` は `confirmed`（お富ちゃん家＝2026年7月の富岡市・公式観光情報で照合）/ `needs_review`（その他すべて）で管理。
- **`needs_review` の住所・緯度経度・営業時間・定休日は、公開情報をもとにした暫定値であり未検証です。** `src/data/checkpoints.ts` を運営の最終確認シートで必ず上書きしてください（推測値を確定として公開しない）。
- 銀座まちなか交流館は謎制作ガイドのフロー図にのみ登場（仕様書のCP一覧には未記載）。独立ページ化の可否は要確認。

**運用・素材**

- 謎本文、正解ハッシュ、ヒント、クリア文
- 岡重での商品購入が参加条件かどうか
- 各店舗の2026年8月8日の営業と利用許可
- 連携企業、ロゴ、お問い合わせ先、正式ハッシュタグ（現在はプレースホルダー）
- 正式ドメイン（`cid-ac.com` と `chuo-joho.ac.jp` が資料間で不一致）
- GA4測定ID
- 全QRコードの本番URL
- 荒天時の更新担当者

## ビジュアル素材

`public/images/`のWebPは、本プロジェクト専用に画像生成した資料写真です。実在の建物や歴史資料を写したものではないため、場所の証拠写真としては使用しません。

チェックポイントの現地写真は`public/checkpoints/photos/`へ分離し、出典・利用根拠・クレジットを
[`docs/checkpoint-photo-provenance.md`](docs/checkpoint-photo-provenance.md)で管理します。
