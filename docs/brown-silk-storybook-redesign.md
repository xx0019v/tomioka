# SILK STORY ARCHIVE — 参加者配布キット連動リデザイン

対象: `https://mayu-no-chizu.cid-ac.com/`（GitHub Pages: `https://xx0019v.github.io/tomioka/`）
ブランチ: `feat/brown-silk-storybook-revolution`
基準資料: 参加者配布キット PDF（全 8 頁）

---

## 1. 配布キット分析

実 PDF の 8 頁すべてを読み、**想像ではなく現物から**視覚言語を抽出した。

| 頁 | 内容 | 抽出した視覚要素 |
| --- | --- | --- |
| p1 表紙 | 暗い室内、古い手記、蝋燭、古地図、繭 | **藍墨の闇**（茶色ではない）、蝋燭の暖色、金の細枠が二重、明朝・字間広めの題字、題字下の細罫、小さな副題 |
| p2 あらすじ | セピアの写真に生成りの文字 | 中央の「— あらすじ —」（両脇に細罫）、ノンブル「— 2 —」、明朝本文 |
| p3 キーワード欄 | 方眼紙 + 罫線 + 生成りのカード | **方眼**、**横罫**、和紙テープ、**臙脂の見出し**、壱弐参肆、濃紺の細い枠、圏点、下線 |
| p4/p5 手がかりの地図 | 紙の地図 | **茶色の道**（太細 2 段）、**臙脂の丸印に漢数字**、**臙脂の破線と矢印**、**濃紺の地名札**（お富ちゃん家）、金枠の箱（交流館）、方位記号、縮尺バー |
| p6/p7 各地点 | セピア写真 + 生成りの帯 | 臙脂の丸数字 + 見出し、「手記、明治八年秋——」のラベル帯、濃紺の引用 |
| p8 注意事項 | 方眼 + 生成りのカード | 臙脂の小見出し、`・` 箇条書き、細い枠 |

**重要な発見**: キットは「茶色いサイト」ではない。基調は**藍墨 + 生成り**で、**茶は地図の道と木**、**臙脂は印と見出し**、**金は細罫**に限定して使われている。
この配分をそのまま持ち込むことを設計の前提にした。

## 2. 新コンセプト

> この画面は**配布キットの台帳そのもの**の手触りで、
> 方眼紙の上に紙が重なる版面／明朝の広い字間／指で触れると紙が反応する押下感として表れる。

暗い面は**表紙とその続きの 1 面だけ**。以降は生成りの台帳が続く。
「暗くて金色」で高級感を作らない（＝屋外・直射日光下で読めなくなるため）。

## 3. カラートークン

`src/app/globals.css` の `:root`。従来の深緑（`#17372f`）とライムグリーン（`#d8ef6b`）は**全廃**。

| トークン | 値 | 由来 |
| --- | --- | --- |
| `--kit-ink` | `#1e2536` | 表紙の闇・本文の墨 |
| `--kit-ink-deep` | `#141a28` | 奥付 |
| `--kit-ink-dusk` | `#2b3550` | 地名札 |
| `--kit-paper` | `#f2ecda` | 方眼紙 |
| `--kit-paper-raised` | `#faf5e8` | めくれた記録カード |
| `--kit-paper-deep` | `#e6dcc0` | 影になった紙・地図の地 |
| `--kit-grid-line` | `rgba(122,100,62,.16)` | 方眼の罫 |
| `--kit-brown` / `-deep` / `--kit-leather` | `#7d6544` / `#5a462c` / `#6b4f31` | 地図の道・古い木・革の記録帳 |
| `--kit-seal` / `-soft` | `#8e2436` / `#a94456` | 印・見出し・順路の破線・封蝋 |
| `--kit-brass` / `-soft` | `#b9964f` / `#d9bd7f` | 細罫・地図ピン・方位記号 |
| `--kit-candle` | `#f5d79b` | 蝋燭（発光ではなく温度として使う） |
| `--kit-cream` / `--kit-cocoa` | `#f6ecd6` / `#b99a76` | きぬの身体と陰影 |

移行は機械的に行った（14 ファイル）。深緑リテラル 15 種・ライム 11 箇所・朱 3 種を対応する藍墨／真鍮／臙脂へ置換。
トークン名も実体に合わせて改名（`--color-ink-green` → `--color-ink`、`--color-vermilion` → `--color-seal`）。

## 4. タイポグラフィ

- 見出しは**明朝・`letter-spacing: .08〜.16em`・`line-height` 1.55〜1.75**。巨大化と負のトラッキングをやめた（旧ヒーローは `clamp(3.5rem,5.9vw,6rem)` / `-0.04em` のゴシック）
- 本文は**流体サイズを使わない**。`--text-body: 1rem`（<768px）/ `1.0625rem`（≥768px）の 2 段階
  - 理由: `clamp(...vw...)` は `16.016px` のような端数を生み、グリフごとに 0.1px 未満のベースラインずれが出る。1 行の文字が複数行に見え、**日本語の改行検査を誤らせる**
- 補助文字の下限を 12px に統一（0.55〜0.72rem の 40 箇所を引き上げ）
- 「読ませる文字」の 15px 級 24 箇所を本文サイズへ引き上げ
- 行間は日本語本文 1.85〜1.95
- `text-wrap: balance`（見出し）/ `pretty`（本文）、`line-break: strict`、`word-break: normal`
- 途中分割を防ぐ語は `.no-break` + `data-ja-unit` で固定（繭が遺した地図 / お富ちゃん家 / 2026年8月8日（土）/ 約60〜90分 / 事前申込不要 / 上州富岡駅 / Googleマップで開く ほか 7 単位を実測検証）

## 5. オブジェクト

新規に **SVG 10 種**を作成（`src/components/immersive/ArchiveObjects.tsx`）。
真鍮の地図ピン / 木製糸巻き / 繭の小箱 / 桑の葉 / 封蝋 / 古い鍵 / 記録タグ / インク瓶 / 蝋燭 / 方位記号。

配置は意味のある場所だけ:
- 参加のしかたの紙 → 封蝋（紙を留めている）
- 受付票 → 繭の小箱・古い鍵
- 街歩きマップ CTA → 真鍮の地図ピン

加えて `FieldMapPlate.tsx` を新規作成。キット p4/p5 の地図版面（茶の道 2 段・臙脂の破線と矢印・方位記号・縮尺バー）を SVG で引き直し、街歩き索引セクションの地に敷いた。
**紙の地図画像を貼っていない。実緯度経度も持たない**（実地図は Leaflet 側だけが扱う）。

既存の写真素材（桑・糸巻き・製糸機械など）は削除せず、**紙に刷られた図版の強さ**（`opacity .16〜.3` + `sepia`）まで落として背景テクスチャに降格。旧実装では `opacity .88` で題字に重なっていた。

## 6. きぬ再設計

- 首元の**緑の桑タグ**（新配色で唯一残っていた緑）を廃止し、**臙脂の細いリボン + 真鍮の紐 + 生成りの記録タグ**へ。付ける小物は 2 点まで
- 身体のグラデーションを**温かいアイボリー → ココア**へ（`#fefcf6 → #f6ecd6 → #dfcdae`）、輪郭を `#c6ac86` に
- 目の大きさは変えない（巨大化しない）。**視線だけが動く** `looking-left` / `looking-right` を追加
- `walking` を追加。脚の位置だけが前後にずれる（別キャラにしない）
- 接地影を藍墨へ、引いている絹糸を臙脂へ

状態: idle / breathing / blinking / looking-left / looking-right / guiding / thinking / walking / locating / success / soft-warning / resting の 12 種を `GuideState` として保持。
常時右下固定のチャットボット型は不採用。各セクションの版面の中に置いている。

## 7. 使用した premium-product-design スキル

`~/.codex/skills/premium-product-design`（SKILL.md 全 24 件）。今回の判断に使ったもの:

premium-art-direction / anti-template-design / editorial-layout / japanese-typography / mobile-first-luxury / ios-web-experience / interaction-design / motion-direction / character-motion / reduced-motion / animation-qa / visual-regression / design-md-systems / accessibility / performance / production-release

不採用（今回の要件に不要なランタイム依存を増やすため）: gsap-core / gsap-scrolltrigger / lenis-scroll / shader-gradient / shader-performance / vanta-backgrounds / liquid-glass / liquid-logo / nuxt-lenis / react-bits-patterns（カタログとしてのみ参照）。
**「全スキル活用」＝全ライブラリ導入ではない。** 本リデザインで新規に増やしたランタイム依存は **0**。

## 8. 各スキルの適用箇所

| スキル | 適用箇所 |
| --- | --- |
| premium-art-direction | 主題の一文（§2）。「暗い + 金 = 高級」の解体。実物（配布キット）からの色の数え上げ |
| anti-template-design | S1 同一セクションリズム / S5 英語ラベル + 巨大見出しの反復の除去。全セクションの英字ラベルをキットの日本語の柱へ |
| editorial-layout | セクションごとの密度設計（宣言=疎 / あらすじ=中 / 参加=中密 / 索引=密 / 奥付=疎）。読みもの幅 680px の分離 |
| japanese-typography | 本文 16px 下限、行間 1.85、`line-break: strict`、非改行単位、流体サイズの排除 |
| mobile-first-luxury / ios-web-experience | 390×844 基準、`100svh`、safe-area、44px 下限、横スクロール 0 |
| interaction-design | CTA の `:active` 沈み込み、`@media (hover:hover)` での hover 隔離 |
| motion-direction / character-motion | 4 階層（Ambient / Scroll / Interaction / Transition）。きぬの状態遷移 |
| reduced-motion | `matchMedia` を JS で購読し、reduce 時は observer を張らず完成状態で出す |
| animation-qa / visual-regression | `document.getAnimations()` による常時ループ数の実測、9 幅 × 2 エンジンのスクリーンショット |
| accessibility / performance | canvas に情報を描かない、装飾は `aria-hidden`、追加依存 0 |

## 9. モーション

- **Ambient**: 蝋燭の光の揺らぎ、浮遊塵、絹糸の輝き、きぬの呼吸・不規則な瞬き（既存を維持、reduce で停止）
- **Scroll**: 見出しの行単位マスクリビール（新規 `TypographyReveal.tsx`）、絹糸の伸長、資料の出現
- **Interaction**: CTA の押下沈み込み、きぬのタップ反応（220ms スロットル）、地図ピン選択
- **Transition**: セクション間の絹糸の連続（`SilkTrail` / `ArchiveTrace`）

文字アニメーションは**行単位のマスクリビールのみ**。1 文字ずつの分解・タイプライター・常時動く文字はしない。表示後は完全に静止する。
`clip-path` + `opacity` + `translate` のみを使い、レイアウトを動かさない。

## 10. モバイル

主基準 390×844。確認幅: 320 / 360 / 375 / 390 / 393 / 430 / 768 / 1024 / 1440（9 幅）。
横スクロール 0 / 44px 未満の主要操作対象 0 / 本文 16px 未満 0 を Chromium・WebKit 双方で機械検証。

## 11. reduced-motion

`prefers-reduced-motion: reduce` で **3 ページとも常時ループ 0**（`document.getAnimations()` の `iterations === Infinity` 実測）。
見出しリビールは observer を張らず完成状態で出す。地図・現在地・ナビは通常どおり使用できる。

## 12. パフォーマンス

- 新規ランタイム依存: **0**（three / gsap / lenis いずれも導入していない）
- 新規ネットワーク要求: **0**（オブジェクトはすべてインライン SVG、紙と方眼は CSS グラデーション）
- 削除: 街歩き索引セクションの背景写真 2 枚（`field-archive-ground.webp` / `silk-strata.webp` の読み込み）
- 静的書き出し 10 ルート、ビルド成功

## 13. 作成した素材

| 素材 | 形式 | 作り方 |
| --- | --- | --- |
| 地図ピン / 糸巻き / 繭の小箱 / 桑 / 封蝋 / 古い鍵 / 記録タグ / インク瓶 / 蝋燭 / 方位記号 | インライン SVG | 新規手描き（`ArchiveObjects.tsx`） |
| 手がかりの地図の版面（道・順路・方位・縮尺） | インライン SVG | 新規手描き（`FieldMapPlate.tsx`） |
| 方眼紙 / 横罫 / 和紙テープ / 記録カード | CSS | `repeating-linear-gradient` |
| きぬの臙脂リボン・記録タグ | インライン SVG | 既存 `SilkwormMascot` へ追加 |

## 14. 外部素材とライセンス

**今回、外部素材は 1 点も追加していない。** 画像生成も使用していない。
既存の写真素材は本リポジトリで従来から使用しているもので、来歴は `docs/checkpoint-photo-provenance.md` / `docs/environment-asset-log.md` に記録済み。
地図タイルは OpenStreetMap（従来どおり、API キー不要、帰属表示を画面内に保持）。

## 15. QA 結果

`e2e/silk-archive-qa.spec.mjs`（新規 5 件）+ `e2e/teacher-feedback.spec.mjs`（既存 4 件）を Chromium / WebKit で実行。

| 検査 | 結果 |
| --- | --- |
| 横スクロール（3 ページ × 9 幅） | 0px |
| 主要操作対象 44px 未満 | 0 件 |
| ボタン内改行 | 0 件（地点一覧の多段行は `data-multiline-ok` で意図を明示） |
| 本文 16px 未満 | 0 件 |
| reduced-motion 常時ループ | 0 件（3 ページ） |
| コンソールエラー | 0 件 |
| HTTP 400 以上 | 0 件 |
| 指摘事項 6 項目のゲート | 4 テストすべて合格 |
| lint / 型検査 / build | すべて成功 |

**検証中に見つけて直した自分の不具合**（いずれも装飾が要件を壊していた例）:

1. 台帳の紙に付けた `rotate: -0.25deg` が全グリフを 0.4px ずつずらし、1 行の日本語が 2 行と判定されていた。紙の傾きを廃止し、テープと影で「留めた感じ」を作り直した
2. 壱弐参をつなぐ絹糸が漢数字の上を通っていた（＝指摘事項そのもの）。綴じの罫として紙の左余白へ移した
3. 宣言セクションが `.page` の背景に依存しており、配色変更で生成りの上に生成りの文字が乗って読めなくなっていた。セクション自身に藍墨の地を持たせた
4. 写真の道具が `opacity .88` で題字に重なっていた

---

## 付記: 変更していないもの

イベント名、開催日、場所、受付時間、参加費、説明文、アクセス情報、地図の緯度経度、ピン先端の固定、公式 URL、GitHub Pages の basePath。
配布キット内の謎・キーワード・ヒント・攻略情報・QR 情報は Web に一切転載していない。
