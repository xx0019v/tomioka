# ヒーロー重なり修正とタイポグラフィモーション

実施日: 2026-07-30  
対象: `https://mayu-no-chizu.cid-ac.com/`
ブランチ: `fix/hero-overlap-and-typography-motion`

## 結論

ヒーローを「文字」「資料図版」「日付・きぬの案内レール」の三領域へ再構成した。きぬ、吹き出し、日付、CTA、資料図版は互いの領域を通常フローで確保するため、文字量・吹き出し状態・画面高が変わっても推測した余白に依存しない。

視覚コンセプトは「富岡の暗い記録庫で、一本の絹糸が言葉と地図をほどく」。主役は行単位で下からほどける見出し一つに絞り、補助文、日付、CTAは短い不透明度・小変位・字間変化で静かに追従する。

## 原因

変更前は次の要素が同じヒーロー下端の絶対配置レイヤーに置かれていた。

- 日付パネル: `position: absolute; bottom: 14px`
- きぬ: `position: absolute; bottom: 3px`
- 資料図版: モバイルで `position: absolute`
- 本文: 衝突を避けるための固定 `padding-bottom: 105px`

吹き出しの開閉、CTAの折り返し、画面高、フォントメトリクスを固定値の余白で吸収していたことが根本原因である。390pxでは見かけ上CTAとの交差がなくても、きぬ・日付・糸巻きが同じ下端帯に集中し、短辺端末や内容変化で崩れる構造だった。

## 構造の変更

### 変更前

```text
hero
└─ stage (relative)
   ├─ copy
   ├─ evidence
   ├─ datePanel (absolute)
   └─ kinu (absolute)
      └─ bubble + character
```

### 変更後

```text
hero
└─ stage (grid / normal flow)
   ├─ folio
   ├─ copy
   ├─ evidence
   └─ supportRail
      ├─ datePanel
      └─ kinu
         └─ bubble + character
```

- デスクトップ: `copy | evidence`、その下に `datePanel | kinu`
- モバイル: `folio → evidence → copy/CTA → datePanel → kinu`
- 320×568: 装飾資料を省略し、両CTAを56px高の横並びにして固定ナビから35.7px離す
- DOM順、視覚順、読み上げ順は一致させた
- スクロール量による文字・資料の移動を廃止し、ネイティブスクロールを維持した

## タイポグラフィモーション

宣言したヒーローモーションは一つだけである。

1. キッカー: 字間が静かに締まる `640ms`
2. 見出し: 行ごとのクリップ内を下からほどく `880ms`
3. 副題・説明: `8px`以内の移動と不透明度だけ
4. CTA: `12px`以内で着地し、hover/focus時は矢印が2pxだけ進む
5. 日付: 数字のみを短く縦方向に出す

全要素を同じfade-upにせず、空間移動の主役は見出しだけにした。GSAPとScrollTriggerは、単発の入場・hoverにはCSSで十分で、導入すると初期化・解除・reduced-motion経路が増えるため不採用とした。

## きぬの配置と動作

- きぬは専用の`supportRail`内に置き、CTA・日付・基本情報バーと交差しない
- デスクトップは日付の右側、モバイルは日付の後ろに積む
- 吹き出しを開いた初期状態でも領域自体が高さを確保する
- 連打反応、フォーカス復帰、表示中・前景時だけの動作は既存契約を維持した
- ヒーローの表情は`guiding`で、呼吸の常時ループは追加していない

## Reduced motion

`prefers-reduced-motion: reduce`では、見出し・キッカー・副題・説明・CTA・日付・資料の全アニメーションとtransitionを停止し、初期状態から最終位置・不透明度1で表示する。ヒーロー内の連続実行アニメーションはChromium/WebKitとも0件だった。

## 使用したSkill OS

- `premium-product-design`: 目的・実装・QA・公開ゲート
- `premium-art-direction`: 絹糸／記録庫という一つの主題
- `editorial-layout`: 主従、非対称、通常フローによる版面
- `anti-template-design`: 均一fade-upと装飾過多の回避
- `japanese-typography`: 日本語行長、改行、可読サイズ
- `mobile-first-luxury`: 320px、44px以上、CTA非改行
- `ios-web-experience`: `svh`、safe area、短辺、横向き
- `interaction-design`: CTA・きぬ・フォーカスの操作契約
- `motion-direction`: 1画面1主役、短い語彙
- `gsap-core` / `gsap-scrolltrigger`: 採用条件を評価し、今回は不採用
- `character-motion`: きぬを通常フローの専用領域へ隔離
- `reduced-motion`: 静止完成版と連続ループ0
- `animation-qa`: 実行アニメーション数を数値検証
- `visual-regression`: 固定幅・固定高、before/after、Chromium/WebKit

Skill OS本家には、キャラクター＋吹き出しを絶対配置と推測余白で逃がさない規則、320×568で固定ナビとのCTAクリアランスを実測する規則を追加した。ルート`README.md`は存在しないため、既存の`SKILL.md`、監査、レシピ構成を維持して更新した。

## 6巡の表示QA

| 巡 | 表示条件 | 所見 | 修正・判定 |
| --- | --- | --- | --- |
| 1 | 390×844 | 構造変更後、主要要素の交差0、CTA改行0、overflow 0 | 主役とCTAの階層を合格 |
| 2 | 320×568 | overflow・タップ領域は合格、資料図版によりCTAが初期画面外 | 短辺時に資料図版を省略、CTAを56pxへ |
| 3 | 320×568 再検証 | 副CTAが固定ナビへ28px侵入 | 短辺時のみ2CTAを横並びへ |
| 4 | 320×568 再々検証 | 両CTA1行、固定ナビとの最小余白35.7px、overflow 0 | 合格 |
| 5 | 768×1024 | 日付・きぬ・基本情報バーの交差0、CTA改行0 | タブレット境界合格 |
| 6 | 1440×900 | 日付・きぬ・CTA・資料の交差0、版面の主従も明瞭 | デスクトップ合格 |

## スクリーンショット

変更前:

- `docs/qa-hero-fix/before-production-390x844.png`
- `docs/qa-hero-fix/before-production-1440x900.png`

6巡:

- `docs/qa-hero-fix/round-01-390x844.png`
- `docs/qa-hero-fix/round-02-360x800.png`
- `docs/qa-hero-fix/round-03-1024x768.png`
- `docs/qa-hero-fix/round-04-320x568-fixed.png`
- `docs/qa-hero-fix/round-05-768x1024.png`
- `docs/qa-hero-fix/round-06-1440x900.png`

Reduced motion:

- `docs/qa-hero-fix/reduced-motion-390x844.png`

## 自動QA結果

対象幅は`320×568 / 360×800 / 375×812 / 390×844 / 393×852 / 430×932 / 768×1024 / 1024×768 / 1440×900`。さらに`844×390`横向きを確認した。

- Chromium: 全マトリクス、横向き、reduced motion、公開版baseline撮影 合格
- WebKit: 全マトリクス、横向き、reduced motion 合格
- 重なり面積: 0
- 横overflow: 0
- CTA改行: 0
- 44px未満のヒーロー操作対象: 0
- ヒーロー本文: 16px以上
- 320×568のCTA—固定ナビ間隔: 35.7px
- reduced motion連続アニメーション: 0
- console error: 0
- HTTP 400以上: 0
- lint: 合格
- typecheck: 合格
- production build: 合格
- `/`, `/information/`, `/map/`, `/robots.txt`, `/sitemap.xml`: HTTP 200

物理iPhoneのDynamic Island、Safariのアドレスバー伸縮、低電力・熱状態は自動環境では再現できないため、コード上の`svh`・safe areaとWebKitで代替検証した。
