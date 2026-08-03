# 絹糸に導かれて、富岡の世界を歩く Web

作業ブランチ: `feat/silk-thread-guided-tomioka`
土台コミット: `b2a7e14`（SILK STORY ARCHIVE リデザインのマージ）
Three.js 実装の取り込み元: `origin/feature/threejs-apple-class-scroll` @ `56f6b62`

> 指示文の一部（新ブランチ名・基準 commit・記録先パス・DPR/品質の表・確認幅の一覧・Section 3 の内容）は
> コードブロックが空で届いたため、以下の判断で進めた。空欄が埋まれば合わせて直せる。
>
> - ブランチ名: `feat/silk-thread-guided-tomioka`
> - 基準 commit: 現在の完成状態 `b2a7e14`（`feature/threejs-apple-class-scroll` は旧 main 由来のため、
>   丸ごと土台にすると配布キット連動リデザインが巻き戻る。Three.js の実装ファイルだけを取り込んだ）
> - 記録先: 本ファイル
> - 確認幅: 320 / 360 / 375 / 390 / 393 / 430 / 768 / 1024 / 1440
> - DPR 上限・品質段階: 既存の `src/lib/device-tier.ts` の値を踏襲（下表）

## 作業開始時の状態

| 項目 | 値 |
| --- | --- |
| branch | `feat/silk-thread-guided-tomioka`（`b2a7e14` から作成） |
| 未コミット変更 | 無し（開始時点） |
| worktree | 本体 + `tomioka-qa-threejs`（`qa/threejs-acceptance-gate`） |
| stash | 無し |
| 遵守 | main へ直接 commit せず / gh-pages を触らず / 本番公開せず / force push せず |

## 採用・不採用

| | 内容 | 状態 |
| --- | --- | --- |
| A | タイトルの織り上がり | **実装** `WovenTitle.tsx` |
| B | サイト全体をつなぐ絹糸 | **実装** `SilkTrail`（3 本撚りへ更新） |
| C | 古地図と街が形成されるスクロール体験 | **実装** `SilkCityScene.tsx` |
| D | 2.5D パララックス | **不採用**（指示により実装しない。作りかけた `DepthField` は削除済み） |
| E | 絹布によるページ切り替え | **実装** `SilkVeilTransition.tsx` |
| F | きぬの限定リアクション | **実装**（常時ループを撤去） |
| — | チェックポイント発見の大規模演出 | **実装しない** |
| — | 傾き / DeviceOrientation / ジャイロ / カーソル追従 | **実装しない** |

## premium-product-design の適用

`~/.codex/skills/premium-product-design`。SKILL.md は全 24 件。

```
（ルート）SKILL.md
animation-qa / anti-template-design / character-motion / design-md-systems /
editorial-layout / gsap-core / gsap-scrolltrigger / interaction-design /
ios-web-experience / japanese-typography / lenis-scroll / liquid-glass /
liquid-logo / mobile-first-luxury / motion-direction / nuxt-lenis /
premium-art-direction / react-bits-patterns / reduced-motion / shader-gradient /
shader-performance / vanta-backgrounds / visual-regression
```

指示にあった `information-architecture` / `threejs` / `responsive-layout` /
`touch-interaction` / `mobile-navigation` / `accessibility` / `performance` /
`production-release` は独立した SKILL.md としては存在しない。
それぞれ `references/ux-system.md`・`spatial-3d-system.md`・`accessibility-and-qa.md`・
`implementation-system.md`・`audits/03-mobile-ios.md`・`audits/05-motion-and-performance.md`・
`audits/06-visual-regression-and-release.md` に対応する内容があり、そちらを判断基準に使った。

| スキル | 今回の適用箇所 |
| --- | --- |
| premium-art-direction | 主題を一文に固定（「絹糸に導かれて富岡を歩く」）。配色を配布キット由来から富岡の温かい方向へ戻す判断 |
| anti-template-design | S1 同一セクションリズム / S5 英語ラベル + 巨大見出しの反復 / S6 全要素同一フェードの除去 |
| editorial-layout | 街の形成セクションに「情報を置かない間合い」を設け、索引と CTA を終端へ寄せた |
| japanese-typography | 本文 16px 下限、流体サイズの排除、非改行単位の維持 |
| motion-direction / gsap-scrolltrigger | scrub のみ・pin なし。scrollTrigger の range を sticky の可視域へ一致させた |
| character-motion | きぬの常時瞬き・常時呼吸を撤去し、入場・接触・長時間無操作の 3 契機だけに限定 |
| shader-performance / spatial-3d-system | tier 判定による分割数・DPR・粒子数の切り替え、画面外での描画停止、全 dispose |
| reduced-motion / animation-qa | reduce では canvas を作らない。常時ループ数を実測して 0 を確認 |
| mobile-first-luxury / ios-web-experience | 縦長では俯瞰を強めて引く「縦の編集版」。同じ進行を維持しつつ構図だけ変える |
| visual-regression | 9 幅 × 2 エンジンのスクリーンショットと数値レポート |

## A. タイトルの織り上がり — `WovenTitle.tsx`

縦糸（`repeating-linear-gradient` の細線）を張る → 横糸（光る 1 本の線）が左から通る →
**通った範囲だけ文字が現れる**（`clip-path: inset(0 100% 0 0)` → `inset(0)`）。

- 文字は 1 つのテキストノードのまま。**1 文字ずつに分解しない**ので選択・読み上げ・検索・翻訳が壊れない
- タイプライター表示・下からのフェードアップは使っていない（旧 `titleThreadIn` は削除）
- 総尺 1.56 秒（行ごとに 160ms / 420ms のずれ）。**タイトルが読めない時間を作らない**
- 織り終わったら糸は消え、以降は完全に静止（`data-woven="done"`）
- PC / スマートフォンで同じ「織り上がる」体験。縮小や単純フェードへの置き換えはしていない
- reduce では `useSyncExternalStore` で購読し、**最初から布がある状態**で描き出す

## B. サイト全体をつなぐ絹糸 — `SilkTrail`

path を 3 本重ねて「線」ではなく「撚った糸」にした。

| 層 | 役割 |
| --- | --- |
| `threadShade` | 芯の右下 0.6px。糸に厚みを与える |
| `thread` | スクロール量で伸びる本体（`stroke-dashoffset`） |
| `threadSheen` | 芯より細く明るい。絹の控えめな照り |

3 本は同じ `dasharray` / `dashoffset` を共有する。1 本でも遅れると糸が割れて見えるため。
本文の外側（左端 40px / モバイル 22px）を通り、本文・CTA・番号・施設名へ重ならない。
発光させない・太くしない・常時揺らさない。

## C. 古地図と街の形成 — `SilkCityScene.tsx`

スクロール量がそのまま進行になる（**pin は使わない**。スクロールを一度も奪わない）。

| 進行 | 内容 |
| --- | --- |
| 0.00–0.14 | 古地図の紙が浮かび上がる（机に落ちる影も同時に） |
| 0.14–0.34 | 道が描かれていく（`setDrawRange`） |
| 0.30–0.48 | 絹糸が道へ接続する |
| 0.42–0.70 | 紙模型の街区が立ち上がる（**Y スケールのみ**。回転しない） |
| 0.62–0.84 | 地点が順に灯る（朱の輪。**名前は canvas に描かない**） |
| 0.84–1.00 | 街全体が一つの構図として静止し、索引と CTA へ収束する |

- 古地図テクスチャは `CanvasTexture` で手続き的に生成。**画像を 1 枚も追加読み込みしない**
- 街の座標は**構図のための相対座標**。Leaflet の実緯度経度とは無関係（混同させない）
- カメラは寄るだけ。回り込み・飛行・急旋回なし
- 横長＝机上の地図を斜め上から。縦長＝より俯瞰・より引き。**進行は同一で構図だけ変える**
- 施設名・開催情報・CTA はすべて DOM

### 検証中に見つけて直した自分の不具合

1. **`overflow: hidden` が sticky を壊していた。** セクションに掛けた `overflow: hidden` が
   スクロールコンテナを作り、内側の `position: sticky` がビューポートではなくセクションに
   貼りついていた（＝街が枠内で縮んで見える）。`overflow: clip` はコンテナを作らないので解決。
2. **ScrollTrigger の end が sticky の可視域とずれていた。** `bottom top` だと sticky が解けた後も
   進行が続き、街が完成しないまま画面外へ出ていた。`bottom bottom` に合わせた。
3. **暗い霧を生成りの版面へ重ねていた。** 汚れにしか見えないため、霧の色を紙の色にした。
4. **カメラが近すぎて手前の街区だけが画面を埋めていた。** 机上の地図を見る角度まで引いた。

## E. 絹布によるページ切り替え — `SilkVeilTransition.tsx`

薄い絹布 3 枚が速度差をつけて画面を横切り、繊維の織り目が一瞬見えてからほどける。

- 覆い 560ms → 遷移 → ほどけ 880ms。**2 秒以上待たせない**
- 画面は黒くならない（生成りの布。背後が透ける）
- `pointer-events: none`。操作を一度も奪わない
- 修飾キー・別タブ・外部リンク・ダウンロード・同一パスは素通し
- 遷移が失敗しても 4 秒で必ず布を片付ける保険を持つ
- `next/link` は anchor 自身に click を張るため、**捕捉フェーズ**で押さえないと布が一度も出ない
- reduce では布を出さず、通常の遷移だけを行う

## F. きぬの限定リアクション

旧実装は 3.5〜8 秒ごとに無条件で瞬きし続けていた（＝常時ループ）。撤去した。

反応するのは 3 つの契機だけ。

1. そのセクションへ入ってきたとき（一度だけ）
2. 触れられたとき（220ms スロットル）
3. 18 秒間まったく操作が無かったとき（**一度だけ**。繰り返さない）

呼吸ループも既定で停止。現在地取得中だけは処理が動いていることを示すため 3 回に限って繰り返し、
取得が終われば state が変わって直ちに静止する。

## Section 3 / 7 — 絹糸が項目を順に結ぶ（`ThreadProgress.tsx`）

参加方法（壱・弐・参）と、駅から入口までの道順で同じ仕組みを使う。

- 読み進めた項目に `data-reached`、いま読んでいる項目に `data-current` が付く
- **到達は一方通行**。戻すと「読んだ／まだ」が読み取れなくなるため
- 到達で結び目に朱が入り、現在の項目だけがわずかに強まる。読み終えた項目は
  背景へ一段下がる（`opacity: .74`）。**消さない。文章は常に読める**
- 経路線は左端 18px を縦に通り、文字と交差しない（取り消し線に見せない）
- 番号の位置と綴じの罫は動かさない（指摘事項の保護対象）
- `IntersectionObserver` は交差の瞬間しか呼ばれないため、現在位置の追従には
  passive なスクロール購読を足した。**スクロール 1 回につき rAF 1 回**、止まれば何も回らない
- reduce では観測せず、最初からすべて到達済みにする（情報を隠さない）

## Three.js の品質段階

`src/lib/device-tier.ts`（既存）を踏襲。

| tier | 条件 | DPR 上限 | tube 分割 | 粒子 | antialias |
| --- | --- | --- | --- | --- | --- |
| high | ≥1024px・cores ≥ 8・memory ≥ 8 | 1.75 | 220 | 420 | 有 |
| medium | 上記以外の非 coarse | 1.5 | 140 | 240 | 有 |
| low | coarse pointer / <768px / cores ≤ 4 / memory ≤ 2 | 1.25 | 80 | 110 | 無 |
| static | reduce / saveData / WebGL 不可 | canvas を作らない | | | |

判定材料: viewport / devicePixelRatio / hardwareConcurrency / deviceMemory /
saveData / pointer / WebGL 可用性 / prefers-reduced-motion。

街の場面は `low` でさらに落とす: 古地図テクスチャ 512px（通常 1024）、
紙の斑 60 個（通常 180）、道の分割 26（通常 60）、稜線クローン無し、リムライト無し。

## 検証結果

`e2e/silk-archive-qa.spec.mjs`（5 件）+ `e2e/teacher-feedback.spec.mjs`（4 件）を
Chromium / WebKit で実行 — **18/18 合格**。

| 検査 | 結果 |
| --- | --- |
| 横スクロール（3 ページ × 9 幅） | 0px |
| 主要操作対象 44px 未満 | 0 件 |
| ボタン内改行 | 0 件 |
| 本文 16px 未満 | 0 件 |
| reduced-motion 常時ループ | 0 件（3 ページ） |
| コンソールエラー / HTTP 400 以上 | 0 件 |
| 指摘事項 6 項目のゲート | 4 テスト合格 |
| lint / 型検査 / build | 成功 |

reduced-motion 時の実測: 街の場面の canvas 0 枚 / 常時ループ 0 / タイトルは即時可読。

証跡: `docs/qa-silk-archive/city/`（進行別）、`docs/qa-silk-archive/final-v2/`（2 エンジン）、
`docs/qa-silk-archive/veil/`（布の通過）、`docs/qa-silk-archive/weave/`（織り上がり）。

## 変更していないもの

イベント名 / 開催日 / 場所 / 受付時間 / 参加費 / 説明文 / アクセス情報 /
地図の緯度経度 / ピン先端アンカー / 現在地機能 / Google マップリンク /
ボトムシート / 公式 URL / basePath。
配布キット内の謎・キーワード・ヒント・攻略情報・QR 情報は転載していない。
