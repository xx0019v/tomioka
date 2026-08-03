# パフォーマンス予算

## 目標（計測できない値は書かない）

| 指標 | 目標 |
| --- | --- |
| 横 overflow | 0px |
| console error | 0 件 |
| WebGL error | 0 件 |
| CLS | 0.05 以下 |
| LCP | 2.5s 以内（目標値。未計測） |
| INP | 200ms 以内（目標値。未計測） |

> 本ブランチでは Lighthouse / 実機計測は未実施。上表のうち実測したものだけを QA 節に記す。

## tier 別 予算

| 項目 | high | medium | low | static |
| --- | --- | --- | --- | --- |
| DPR 上限 | 1.75 | 1.5 | 1.25 | — |
| 糸 tubular segments | 220 | 140 | 80 | — |
| 糸 radial segments | 10 | 8 | 6 | — |
| 粒子数 | 420 | 240 | 110 | 0 |
| 繭 detail | 3 | 2 | 1 | — |
| ライト数 | 3 | 2 | 2 | 0 |
| antialias | on | on | off | — |
| post-processing | 限定的に可（本実装では未使用） | なし | なし | なし |
| canvas 枚数 | 1 | 1 | 1 | 0 |

## 常時負荷を出さないための規則

- 画面外では描画しない（`IntersectionObserver`）
- タブ非表示では描画しない（`visibilitychange`）
- rAF ループは**サイト全体で 1 本**
- `prefers-reduced-motion` では canvas を作らない（`static`）
- `saveData` でも `static`
- テクスチャは使わない（本実装は手続き的マテリアルのみ＝ネットワーク増分 0）

## 実測結果

`docs/threejs-experience/qa.md` に記載する。推測値は書かない。
