# 富岡「繭が遺した地図」Webサイト

2026年8月8日に富岡製糸場周辺商店街で開催する、まち歩き型リアル謎解きイベントのモバイルWeb体験です。

## 構成

- `/` イベント紹介
- `/map/` チェックポイントと住所
- `/information/` 開催情報・注意事項
- `/game/` 参加者向け進行案内
- `/checkpoints/[slug]/` 各チェックポイント
- `/final/` 最終回答

`next build`で`out/`へ完全な静的ファイルを書き出します。XServerには`out/`の中身をアップロードしてください。Node.jsサーバーは不要です。

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

## 公開前に必ず確認する項目

- 謎本文、正解ハッシュ、ヒント、クリア文
- 銀座まちなか交流館を独立した解答地点として扱う承認
- 岡重での商品購入が参加条件かどうか
- 各店舗の2026年8月8日の営業と利用許可
- 連携企業、ロゴ、お問い合わせ先、正式ハッシュタグ
- GA4測定ID
- 全QRコードの本番URL
- 荒天時の更新担当者

## ビジュアル素材

`public/images/`のWebPは、本プロジェクト専用に画像生成した資料写真です。実在の建物や歴史資料を写したものではないため、場所の証拠写真としては使用しません。
