# v10 デザインスキル適用記録

> 記録日: 2026-07-30
> 対象: 富岡「繭が遺した地図」 / ブランチ `feat/v10-design-experience-revolution` → main `f548a60`
> スキル出典: `xx0019v/premium-product-design` @ `da84c75`（ブランチ `feat/design-skill-os-source-integration`）

## 1. 適用したスキルと適用箇所

| スキル | 適用箇所 | 具体的に何を反映したか |
| --- | --- | --- |
| `motion-direction` | `SilkTrail`、既存 ambient 全体 | 「1画面に主役モーションは1つ」。絹糸を主役に据え、既存の桑・記録紙の ambient は従属に留めた。常時ループの同時本数を増やさない方針を維持 |
| `reduced-motion` | `SilkTrail`、`GuideCharacter` | CSS リセットだけに頼らず、JS 側で `matchMedia` を購読し停止経路を実装。reduce 時は糸を引ききった静止状態にし、繭（位置マーカー）を隠す＝位置情報を動きだけに依存させない |
| `character-motion` | `GuideCharacter`、`EventAreaMap` | 連打対策（220ms スロットル＋同一キーフレーム2本での再生し直し）。状態駆動の反応（現在地 locating/granted/denied、スポット選択）。CTA・ホームインジケーターを塞がない配置 |
| `gsap-core` / `gsap-scrolltrigger` | **不採用** | 後述のとおり GSAP を導入せず、素の rAF＋`stroke-dashoffset` で実装。理由は §3 |
| `lenis-scroll` | **不採用** | 同スキルの「告知・情報サイトでは既定のネイティブスクロールが正解」という判断ゲートに従い導入しない。屋外・低速回線での街歩き用途と、地図／ボトムシートの入れ子スクロールが決定的 |
| `react-bits-patterns` | **不採用（原則のみ）** | カタログ139件の評定は 5 adopt / 21 adapt / 125 avoid。本サイトの静かな世界観に合う派手な文字演出が無く、コンポーネント投入はしていない |
| `shader-gradient` / `vanta-backgrounds` | **不採用** | §3 のライセンスと性能判断による |
| `liquid-logo` | **不採用（技法のみ）** | PolyForm Shield のためコード非複製。今回は導入自体を見送り |
| `liquid-glass` | **不採用** | 屋外・日中の可読性を優先。ガラスはコントラストを下げるため、墨緑の不透明サーフェスを維持 |
| `design-md-systems` | 既存トークン維持の判断 | 複数ブランドの見た目を混ぜない原則に従い、既存の墨緑／生成り／金／朱のトークンを変更しなかった |

## 2. 今回実装した中身

### 絹糸の導線（`SilkTrail`）
サイトのコンセプト「絹糸が記憶を縫い合わせる」が**文言だけで、画面上に存在していなかった**。これを実体化した。

- 本文の外側（左端）を通る細い糸。`stroke-dashoffset` をスクロール進行度で描画
- 糸の先端に繭が付き、読んでいる位置を示す
- **常時 rAF ループを持たない**。スクロール／リサイズ時に1フレームだけ合体して再描画
- 更新するのは `stroke-dashoffset` と `transform` のみ＝レイアウトを起こさない
- `visibilitychange` で停止
- `prefers-reduced-motion` では糸を引ききって静止、繭は非表示
- `pointer-events: none`＝地図やきぬのタップを奪わない

## 3. 採用しなかった技術と理由（重要）

| 技術 | 判断 | 理由 |
| --- | --- | --- |
| GSAP | 不採用 | 今回必要なのは「1本の線の描画進捗」だけで、タイムライン制御が要らない。`LICENSES.md` のとおり GSAP は MIT ではなく Standard "no charge" license であり、案件ごとの条件確認が必要。CSS/SVG で足りるものに依存を増やさない |
| Lenis | 不採用 | `lenis-scroll` スキル自身の判断ゲートに該当（告知サイト・入れ子スクロールが主役・屋外低速回線） |
| ShaderGradient | 不採用 | **LICENSE ファイルが無く license 記載も無い**ため、コード複製もパッケージ導入も許諾未確認。加えてモバイル GPU 負荷が高い |
| Vanta | 不採用 | MIT だが three.js 依存を負ってまで入れる背景表現が本サイトに無い。既存の写真＋ambient で世界観は成立している |
| Liquid Logo | 不採用 | PolyForm Shield（競合利用禁止）。技法のみ記録し、コードは持ち込まない |
| React Bits | 不採用 | Commons Clause の販売制限があり、かつ 125/139 件が本サイトではテンプレート感リスク高 |

**競合回避の確認**: 今回スムーススクロールライブラリは 0 本、GPU canvas は 0 枚、追加ランタイム依存は 0 件。既存の three.js 由来コンポーネントと新規 canvas を重ねていない。

## 4. 性能・モバイル・iOS・アクセシビリティ判断

- **性能**: 追加バンドルは自作 SVG コンポーネント1つのみ（外部依存なし）。idle 時の CPU 使用は 0（rAF 常駐なし）
- **モバイル**: 糸の幅を 680px 未満で 22px に縮小し、本文に干渉させない
- **iOS**: `position: fixed` + `pointer-events: none` のみで、`backdrop-filter` や重い blur を追加していない
- **アクセシビリティ**: 糸は `aria-hidden="true"`（装飾）。位置情報は本文・ナビ・見出しで伝わるため、糸が読めなくても情報は欠けない

## 5. 検証状況（正直な記録）

**確認できたこと（本番 `https://xx0019v.github.io/tomioka/` 実測）**
- HTTP 200、新ビルド `Pbwi_cUDVoq3EKed1qchG` 反映
- thread / guide / bead すべて DOM に存在
- `getTotalLength()` が実ジオメトリに対し 1002 を返し、`stroke-dasharray` がその値で初期化されている
- ラッパーが `position: fixed` / `pointer-events: none` / `z-index: 1` / stroke `rgb(201,170,104)`
- 型チェック・lint・production build すべて通過

**確認できていないこと**
- **スクロールに追従して糸が伸びる動き自体は未検証。** 使用中のプレビューペインは `document.hidden === true` を報告し、`requestAnimationFrame` が 0 回しか発火せず、合成スクロールが scroll イベントを発火しないため。ペインで観測されたのは本コンポーネントの「タブ非表示時は停止する」ガードが正しく働いている状態
- reduced-motion の実挙動（メディアクエリを強制できないため）
- 物理 iPhone での確認
