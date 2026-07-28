# チェックポイント写真の出典・利用記録

確認日：2026年7月28日

## 利用方針

- 実在店舗・施設の写真を生成画像で代用しない。
- 店舗名、住所、外観を公式掲載ページと目視照合する。
- 元画像のEXIFを引き継がないWebPへ再符号化し、公開に必要な解像度へ限定する。
- 画像の出典とクレジットは、地図詳細と各チェックポイントページから確認できるようにする。
- 店舗掲載写真5点は、プロジェクト利用の許諾済み素材であることをユーザーが2026年7月28日に確認したものとして扱う。
- キリンヤは許諾条件を確認できる店舗外観写真を発見できなかったため、店舗写真と偽らず、公式フリーダウンロードの「表門」を地点写真として使用する。

## 公開写真

| 地点 | 公開ファイル | 掲載元 | 利用根拠・表示クレジット |
| --- | --- | --- | --- |
| お富ちゃん家 | `public/checkpoints/photos/otomi-chan-ie.webp` | [公式観光掲載ページ](https://www.tomioka-silk.jp/_shop/souvenir/detail/Otomi-chan-chi.html) | ユーザー確認済み許諾。`写真：しるくるとみおか掲載素材（利用許諾確認済み）` |
| アトリエ | `public/checkpoints/photos/atelier.webp` | [公式観光掲載ページ](https://www.tomioka-silk.jp/_shop/restaurant/detail/id%3D6488) | ユーザー確認済み許諾。`写真：しるくるとみおか掲載素材（利用許諾確認済み）` |
| 岡重肉店 | `public/checkpoints/photos/okashige.webp` | [公式観光掲載ページ](https://www.tomioka-silk.jp/_shop/restaurant/detail/Okaju-meat.html) | ユーザー確認済み許諾。`写真：しるくるとみおか掲載素材（利用許諾確認済み）` |
| 銀座まちなか交流館 | `public/checkpoints/photos/ginza-koryukan.webp` | [公式観光掲載ページ](https://www.tomioka-silk.jp/_spot/sightseeing/detail/ginza.html) | ユーザー確認済み許諾。`写真：しるくるとみおか掲載素材（利用許諾確認済み）` |
| キリンヤ周辺 | `public/checkpoints/photos/kirinya-gate-context.webp` | [富岡市公式フリーダウンロード「表門」](https://www.tomioka-silk.jp/_spot/freedownload/) | 申請不要・クレジット必須。`画像提供：富岡市・富岡製糸場（表門／地点写真）` |
| カフェドローム | `public/checkpoints/photos/cafe-drome.webp` | [公式観光掲載ページ](https://www.tomioka-silk.jp/_shop/restaurant/detail/cafedrome.html) | ユーザー確認済み許諾。`写真：しるくるとみおか掲載素材（利用許諾確認済み）` |

## 権利条件の確認

公式観光サイトの[著作権・リンクについて](https://www.tomioka-silk.jp/_copyright/)では、
フリーダウンロード以外の画像は無断転用不可とされている。今回はユーザーが本企画での写真利用許諾を
明示したため、対象店舗・施設の公式掲載画像5点だけを使用した。

「表門」は[フリーダウンロード画像](https://www.tomioka-silk.jp/_spot/freedownload/)に掲載され、
申請不要で利用できる一方、`画像提供　富岡市・富岡製糸場`の表記が指定されている。
サイト内の表示クレジットへこの指定を反映した。

## 情報整合

制作仕様書に記載されたお富ちゃん家の住所`富岡1430-1`は、2026年7月時点の
[公式観光掲載ページ](https://www.tomioka-silk.jp/_shop/souvenir/detail/Otomi-chan-chi.html)および
[富岡市の施設情報](https://www.city.tomioka.lg.jp/www/contents/1000000000468/index.html)にある
`富岡1151-1`と一致しなかった。誤案内を避けるため、写真追加と同時に住所、地図座標、徒歩目安、
休業情報を現在の公式情報へ合わせた。
