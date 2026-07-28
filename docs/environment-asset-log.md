# 環境素材生成・採用記録

確認日: 2026-07-28（Asia/Tokyo）
対象: 富岡まち歩き謎解き「繭が遺した地図」

## 目的と制約

報告されていた `e479c61` と環境素材10点は、ローカル、remote branch、
GitHub API、到達不能Git objectのいずれにも存在しなかった。そのため分岐Bとして
必要最小限の環境素材を再構築した。

- 実在地点写真は生成しない。2026年7月28日に許諾確認済みの店舗・施設写真5点と、
  公式フリーダウンロードの地点写真1点を追加した。出典と条件は
  [`checkpoint-photo-provenance.md`](checkpoint-photo-provenance.md)で管理する。
- 既存のカイコ幼虫SVGキャラクターは再生成・置換しない。
- 文字、ロゴ、人物、建築物、架空の地図、架空の史実は生成しない。
- 各素材を分離し、`aria-hidden`、`pointer-events:none` の装飾レイヤーとして利用する。
- 生成物は史料写真ではないため、ヒーロー資料には「再構成」と表示する。

## 採用素材

| ファイル | 寸法 | 容量目安 | 透過 | 役割 |
| --- | ---: | ---: | --- | --- |
| `public/images/environment/mulberry-branch.webp` | 1200×800 | 105KB | あり | ヒーローの桑標本。ポインター視差にだけ反応。 |
| `public/images/environment/silk-strata.webp` | 1440×576 | 110KB | あり | 巡回図下端の土、苔、根、赤煉瓦、繭殻の地層。 |
| `public/images/environment/archive-specimen.webp` | 720×720 | 65KB | あり | 台帳内の赤煉瓦、繭殻、真鍮札、朱糸の復元標本。 |
| `public/images/environment/field-archive-ground.webp` | 1536×1024 | 262KB | なし | 巡回章の暗い地面・収蔵資料背景。 |

## 生成方針

共通プロンプトは「museum conservation editorial macro photography /
Meiji-era field archive mood / quiet raking light / deep ink green /
unbleached fiber / aged low-reflectance brass / restrained brick vermilion」を軸にした。
固有表現のコピーを避け、富岡の絹、桑、赤煉瓦、街路調査へ翻訳した。

透過素材は単色マゼンタ背景で個別生成し、Codex `imagegen` skillの
`remove_chroma_key.py` を使ってローカルでalpha化した。初回は桑葉の輪郭へ
マゼンタの縁が残ったため、`--edge-contract 1 --despill` で再処理した。

## 検証

- `sips` で寸法とalpha channelを確認。
- 透明四隅、被写体coverage、マゼンタfringeを原寸で確認。
- WebPへ縮小・圧縮し、4点合計を約542KBに制限。
- `next/image` の `sizes` を設定し、主LCP素材としてpreloadしない。
- 390pxでは桑枝の密度を下げ、復元標本を非表示。
- 360/390/1440pxの本番exportで、CTA、本文、3D操作への重なりがないことを確認。

## 不採用・保留

- 生成による実在店舗・地点写真: 誤認を生むため不採用。
- 旧キャラクターPNG: 現行のカイコ幼虫SVGと同一性が異なるため不採用。
- 絹糸ラスター: Canvas、SVG、Three.jsの意味ある経路表現と重複するため不採用。
- `hero-archive.webp`: 800px版と同一視覚で未使用のため、新規利用しない。
