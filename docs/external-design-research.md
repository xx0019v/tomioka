# 外部デザイン調査・反テンプレート品質監査

> 調査日: 2026-07-22（Asia/Tokyo）
>
> 調査担当: AGENT J — Contemporary Design Research Director
>
> 対象: 公開サイト `https://xx0019v.github.io/tomioka/` と現行実装
> 調査方針: 固有表現を模倣せず、設計原理だけを富岡・絹・街歩き・研究記録へ翻訳する

## 1. 結論

現行サイトは、富岡の実座標、絹糸、研究記録、進行状態、2Dフォールバックを実装しており、一般的な観光サイトより明確に先へ進んでいる。一方、厳格な反テンプレート基準では、以下の9項目が該当する。

1. 大見出し、説明、2つのCTAを置く一般的な没入型LPヒーロー。
2. `eyebrow → 大見出し → 説明`の編集パターンを複数セクションで反復。
3. 円環、グロー、グリッド、ぼかし、浮遊カードといった近年のクリエイティブLP定型。
4. A〜Dの円形ノードが、実際の発見状態ではなく装飾に見える場面がある。
5. ホームだけで「円環図」「実座標概念図」「3D経路図」が並び、地図の役割が重複。
6. キャラクターの固定吹き出しが、文脈によってはチャットボットに見える。
7. ヒーローではCanvas・斜視カード・連続モーションを使う一方、後半は通常の説明セクションとリストへ戻る。
8. 墨緑・古紙・金・朱を全面的に使うため、固有資料との結び付きが弱い箇所では「高級和風」テンプレートに寄る。
9. 回転円環、上下浮遊、光沢走査、ノード浮遊、波打つ糸が同時に存在し、静けさより“動いているサイト”が先に立つ可能性がある。

3項目以上に該当するため、局所的な色・影・角丸調整では不十分。ホームのアートディレクションを「高級没入型LP」から、**一冊の調査台帳を開き、街の記憶を綴じていく可変アーカイブ**へ再構成するべきである。

## 2. 現在のベンチマーク（Round 0）

実ブラウザ接続は本担当枠では取得できなかったため、点数は公開URLの到達確認、現行コード、既存のPC 1440×900／mobile 390×844 QA記録を根拠にした暫定値である。スクリーンショット比較後にメイン担当が確定する。

| 評価軸 | 得点 | 根拠 |
| --- | ---: | --- |
| 富岡固有性 | 11 / 15 | 富岡の実地点・実座標、繭、絹糸、調査キットがある。一方、円環・グロー・英字ラベルは都市名を替えても成立しやすい。 |
| アートディレクション | 10 / 15 | 墨緑・古紙・真鍮・朱糸は統一。高級ダークLPの既視感と、後半の通常セクション化が残る。 |
| タイポグラフィ | 7 / 10 | 大小の対比と和文編集性は高い。英字eyebrowの反復と、小さい補助文字が屋外利用に弱い。 |
| レイアウトと余白 | 6 / 10 | PCの非対称2カラムは成立。各節の幅・余白・見出し構造が反復し、密度変化が乏しい。 |
| キャラクター統合 | 6 / 10 | 3状態と進行連動は意味がある。global固定吹き出しは物語内の存在よりhelp widgetに近い。 |
| 物語と操作の接続 | 7 / 10 | 開封、進捗、地点選択が連動。ホーム内の3種類の地図表現は、一つの調査行為へ収束していない。 |
| モーション品質 | 7 / 10 | reduced-motionと停止条件がある。常時Canvas、複数の浮遊、走査光、円環回転が同時に走る。 |
| モバイルUX | 7 / 10 | 48px級操作、地図フォールバック、片手操作を考慮。ヒーロー情報密度と小さいCTA文字は屋外で再確認が必要。 |
| 性能 | 4 / 5 | 3D遅延初期化、low-power、DPR制限、停止条件がある。ヒーローCanvasは表示中連続描画。 |
| アクセシビリティ | 4 / 5 | DOMテキスト、キーボード、reduced-motion、画像／WebGL fallbackがある。実画面で200% zoomと読み上げ順を再確認する。 |
| **合計** | **69 / 100** | 完成基準85点未満。富岡固有性・アートディレクションも12点未満。 |

## 3. 調査した事例と一次技術情報

すべてのURLは2026-07-22にHTTP 200を確認した。公開年が明示されない公式ドキュメントは確認日を記載する。

### 3.1 事例・文化アーカイブ

| 事例 | 公開URL／年 | 評価すべき特徴 | 富岡へ応用する原理 | 応用してはいけない要素 | モバイル・性能・a11y | 難易度 | 採否 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| My Little Storybook / Awwwards SOTD | https://www.awwwards.com/sites/my-little-storybook / 2021 | 一場面ずつ進む物語、WebGL・音・UI反応を同じ世界観へ統合。Awwwards掲載値ではAnimation 9.0に対しAccessibility 6.4、Responsive 6.8。 | 「次へ進む」たびに絹糸、記録、地図状態が一つだけ変わる場面設計。派手さではなく、発見前後の差を演出する。 | 全編WebGL、児童向けの絵本語彙、常時音、固有キャラクターや構図。 | 受賞作でもa11y・responsiveが相対的に弱い。DOM操作と2D版を主、WebGLを従にする。 | 高 | **原理のみ採用** |
| Noomo — New focus. New brand. New website / Awwwards | https://www.awwwards.com/new-focus-new-brand-new-website.html / 2024 | ブランドの固有素材をインタラクション全体へ展開し、各hoverにも理由を与える。Three.js・GSAP利用と性能重視を明記。 | 富岡では“glass/pixel”ではなく「紙へ刺さる朱糸」「真鍮留め」「調査印」を、状態と操作へ一貫させる。 | ガラスモーフィズム、ピクセル絵文字、上方向スクロール、画面外3D反射物。 | 多数の3D物体はGPU・通信負荷。現行の小規模2.5Dに限定し、常時描画しない。 | 高 | **原理のみ採用** |
| Rijksmuseum Collection Online | https://www.rijksmuseum.nl/en/explore-the-collection/ / 確認日2026-07-22 | 作品、作者、主題、物語、利用者コレクションという異なる入口を一つのコレクションへ束ねる。 | チェックポイント、発見語、歴史資料、進行を「調査記録」という単一モデルへ統合し、地図・章・収蔵記録から同じ記録を開く。 | 白い美術館UI、高解像作品の構図、Rijksmuseum固有の分類・文章・画像。 | 入口が多くても対象モデルが一つなら認知負荷を抑えられる。画像一覧化は通信量に注意。 | 中 | **採用** |
| Rijksmuseum Data Services — About Collection Online | https://data.rijksmuseum.nl/about/ / 確認日2026-07-22 | オン／オフラインの文化資料を統合し、多声的な物語で人とコレクションを結ぶ方針を明示。 | 現地体験、店舗の記憶、Web進行を別コンテンツにせず、同じ記録の異なる層として扱う。 | データ基盤や分類体系そのものの模倣。未確認の歴史情報を“資料らしく”創作すること。 | データの出典・確認状態をUIに残す。未確認情報は演出で隠さない。 | 中 | **採用** |
| Scroll-Reactive 3D Gallery / Codrops | https://tympanus.net/codrops/2026/03/09/building-a-scroll-reactive-3d-gallery-with-three-js-velocity-and-mood-based-backgrounds/ / 2026 | 「スクロールを時間経過として感じさせる」という編集思想。奥行きレイヤーと色変化を速度へ接続。 | 明治資料→現在の街を、同一地図の層が薄くずれる表現へ翻訳。章切替時だけ紙層が移動し、時間の変化を示す。 | 速度追従する常時歪み、画像ギャラリー構図、背景色の全面変化、慣性スクロール上書き。 | 速度連動は酔い・操作予測困難・GPU負荷のリスク。mobile／reduced-motionでは離散状態にする。 | 高 | **限定採用** |
| Responsive and SEO-friendly WebGL Text / Codrops | https://tympanus.net/codrops/2025/06/05/how-to-create-responsive-and-seo-friendly-webgl-text/ / 2025 | HTMLを意味構造として保持し、その位置・寸法をWebGLへ同期するHTML-first設計。 | 立体化する場合も、地点名・章名・進捗はDOMを正本にし、Canvasは紙層・光・糸だけを補助する。 | 日本語本文のWebGL複製、troika文字メッシュへの依存、ポストプロセスで可読性を変えること。 | 二重レンダリングと同期は重い。日本語の文字品質、zoom、読み上げに不利なので本文には使わない。 | 高 | **設計原理のみ採用** |

### 3.2 公式技術・性能・アクセシビリティ

| 情報源 | 公開URL／確認日 | 根拠 | 富岡での判断 | リスク・禁止 | 難易度 | 採否 |
| --- | --- | --- | --- | --- | --- | --- |
| React Three Fiber — Scaling performance | https://r3f.docs.pmnd.rs/advanced/scaling-performance / 2026-07-22 | 静止できるsceneはon-demand rendering、段階的fallback、PerformanceMonitor、適応DPRを推奨。 | 3D地図は常時60fpsループを止め、地点選択・章切替・短いカメラ移動時だけ描画。低品質→高品質ではなく、まず完全な2D経路図を出す。 | 高性能端末を前提にDPRを固定、装飾のためだけのpost-processing、常時loop。 | 中 | **採用** |
| Three.js — CSS2DRenderer | https://threejs.org/docs/pages/CSS2DRenderer.html / 2026-07-22 | HTMLラベルを3D物体へ結べる一方、公式に100% browser/display zoomのみ対応と記載。 | 地点ラベルを3D座標へ同期する場合も、CSS2DRendererへ全面依存せず、現行DOMリストを正本として選択同期する。 | zoom非対応を承知せず主要操作・本文をCSS2DRendererだけに置くこと。 | 中 | **主要UIには不採用** |
| GSAP — `gsap.matchMedia()` | https://gsap.com/docs/v3/GSAP/gsap.matchMedia%28%29/ / 2026-07-22 | desktop/mobile/reduced-motion条件を一つのcontextで管理し、revertできる。 | 将来GSAPを導入するほど複雑な章遷移が必要になった場合だけ採用。現時点はCSSと既存matchMediaで足りる。 | “滑らかさ”のためだけにGSAP・ScrollTrigger・ScrollSmootherを追加すること。 | 低〜中 | **保留** |
| W3C WCAG 2.2 — Animation from Interactions | https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html / 更新2025-09-16 | 非本質的なinteraction起点motionを停止可能にし、parallax等で前庭障害を誘発しない。 | 発見演出は情報の状態差をテキスト・色・記号でも示し、動きはoffにできる。scroll parallaxを主要理解に使わない。 | motionだけで発見済みを伝える、全画面カメラ移動を必須にする。 | 低 | **必須採用** |
| W3C WCAG 2.2 | https://www.w3.org/TR/WCAG22/ / 2026-07-22 | Target Size、Focus、Contrast、Status Messages等の成功基準。 | 地点・ガイド・閉じる操作は24CSSpx最低、屋外片手操作では現行44〜48pxを維持。focus順とstatus読み上げを地図状態へ接続。 | 小さな円形ノードだけを唯一の操作にすること。 | 低 | **必須採用** |
| web.dev — High-performance CSS animations | https://web.dev/articles/animations-guide / 2026-07-22 | 高頻度motionは`transform`と`opacity`中心、layout/paintを誘発するpropertyを避ける。 | 糸・紙層・調査印のmotionはcomposite中心。Canvasの連続描画を章遷移の短い描画へ置換する。 | box-shadow、filter、backgroundの大面積連続animation、無制限`will-change`。 | 低〜中 | **採用** |
| web.dev — Optimize LCP | https://web.dev/articles/optimize-lcp / 2026-07-22 | LCP資源をHTMLから早期発見可能にし、LCP画像をlazy-loadしない。 | heroの主要画像は現行どおりpriority対象を明確化し、3D bundleと章下画像は後回しにする。 | 初期体験をThree.js import、Canvas準備、イントロ終了待ちで止める。 | 低 | **必須採用** |
| Apple HIG — Motion | https://developer.apple.com/design/human-interface-guidelines/motion / 更新2025-09-09、確認2026-07-22 | motionはstatus・feedback・instructionへ限定し、optionalにする。peripheral motionと持続oscillationを避ける。 | ガイドは常時浮遊させず、発見・選択・保存の直後だけ一度反応。camera focusはユーザー選択と同方向で短く行う。 | 画面端のキャラクターが常時上下する、無関係な要素が周辺視野で動く。 | 低 | **採用** |
| Apple HIG — Accessibility | https://developer.apple.com/design/human-interface-guidelines/accessibility / 更新2025-06-09、確認2026-07-22 | 十分なcontrol size、gesture代替、keyboard、情報の複数表現、Reduce Motion対応。 | 地図dragだけでなく地点一覧・次へボタンを維持。案内画像がなくてもDOM文で理解可能にする。 | 傾き・swipe・dragだけに探索を依存させる。 | 低 | **必須採用** |

## 4. 富岡版への変換原則

### 4.1 原理から固有表現への翻訳

| 抽出した原理 | 富岡との接点 | 元事例と異なる再設計 | 操作・物語上の役割 |
| --- | --- | --- | --- |
| 一場面につき一つの状態変化 | 調査記録、4つの言葉、6地点 | 全画面3D sceneではなく、台帳の紙層と朱糸が一段だけ変わる | 次の地点、発見済み、未確認を理解させる |
| 一つのcollectionを複数入口から読む | 地図、章、地点、発見語 | 美術作品gridではなく、番号・出典・場所・進行を持つ調査票 | 地図と研究記録の重複を解消する |
| 固有素材をinteractionへ転写 | 製糸、古紙、真鍮、朱糸 | ガラスや粒子でなく、糸が“選択した記録”だけを綴じる | 選択・接続・保存・完了を可視化する |
| Scrollを時間・層として使う | 明治の資料と現在の商店街 | velocity distortionでなく、章境界で紙層が8〜16pxだけずれる | 時代の切替を理解させる |
| HTML-first、3Dは補助 | 屋外で読む住所・手掛かり | 本文はDOM、3Dは地図面・糸・真鍮markerだけ | WebGL失敗時も全調査が成立する |
| Motionをstatusへ限定 | 発見、保存、解放 | 常時浮遊を減らし、発見直後だけ700ms以内で反応 | 達成感と状態差を伝える |

### 4.2 模倣回避・禁止事項

1. 参考サイトの色、キャラクター、文章、3Dモデル、画面構図、transitionを複製しない。
2. Awwwards作品の“受賞らしさ”を作るために、全面WebGL、smooth scroll上書き、巨大cursor、粒子、glass、blend modeを追加しない。
3. 富岡の本文や地点名をWebGL textへ置き換えない。
4. キャラクターを固定右下／右上の丸いportrait＋チャット吹き出しとして常用しない。
5. 朱糸を装飾曲線として増殖させない。常に「選択中の記録」「発見済み地点」「次の移動」のどれか一つを表す。
6. 和紙noise、墨、赤、金を“和風らしさ”だけで重ねない。実資料の番号、余白、綴じ、訂正、出典状態へ接続する。
7. 3Dカメラをscroll量へ直接連続同期しない。地点選択という明示操作で短くfocusする。
8. 未確認の歴史事項、謎、正解を、資料風ビジュアルによって事実らしく見せない。

## 5. 優先度付き改善提案（最大3件）

### P1 — ホームを「連続調査台帳」へ再編集する

現在の`signal / story / howTo / route / access / share`というLP節構造を、密度と余白が異なる一冊の台帳へ統合する。

- heroは大見出し＋2CTAのまま終えず、開封後に同じ“資料カード”が目次兼進行票へ変形する。
- 左余白に通し番号・出典状態・ページ位置、中央に本文、右端に地図断片／繭標の注釈を置く。
- 各章を同じ幅・同じ見出し形式にしない。序文は大きな余白、手順は短い綴じ票、地図は横断面、アクセスは切り取り票にする。
- 英字eyebrowを全節で繰り返さず、実務上意味のある`記録番号 / 確認状態 / 場所 / 所要`へ置き換える。
- 完了条件: PCとmobileで、固有名詞を隠しても「絹糸で調査記録を綴じる街歩き」だと分かる。大見出し＋説明＋CTAだけのsectionが連続しない。

### P1 — 三つの地図表現を「一つの可変調査地図」へ統合する

円環ネットワーク、SVG概念図、3D古地図、Leafletをすべて独立の見せ場にせず、同じcheckpoint選択状態を共有させる。

- DOM/SVGの経路図を正本とし、3Dは遅延enhancementとして紙厚、真鍮marker、一本の朱糸だけを追加。
- marker選択で、地図focus・記録票・繭標の視線・進行表が同時に同じslugへ切り替わる。
- A〜Dの装飾円は廃止または実際の未発見／発見済み状態へ結ぶ。
- Leafletは住所確認の実用地図として残し、物語地図と役割を明確に分ける。
- on-demand rendering、低DPR、IntersectionObserver、WebGL失敗・Save-Data・reduced-motion時の2D正本を維持。
- 完了条件: 3Dを無効にしても選択、進行、住所確認が完全に成立し、3D有効時は“どの記録を選んだか”がより明確になる。

### P1 — 繭標を「固定チャット」から「資料内注釈」へ変える

キャラクターは独自性があるが、UI容器がhelp widgetの定型に寄る。姿は維持し、出現場所と発話形式を変える。

- 通常時は台帳の栞、地図の朱糸起点、確認印のそばに小さく存在する。
- 自動発話は開封、初地点選択、発見、完了の4種程度に絞る。
- 長い吹き出しではなく、資料余白の鉛筆注釈／朱印ラベルとして表示し、対象要素へ糸を一本だけ接続。
- mobileでは画面端fixedにせず、現在章の先頭または選択した記録票内へinline配置する。
- 進行や操作に関係しない時は静止し、呼び出しボタンから再表示できる。
- 完了条件: キャラクターを消すと操作説明の補助は減るが主要操作は失われず、表示時は“何を見ればよいか”が一意に分かる。

## 6. 実装時の性能・アクセシビリティ予算

- 主要本文、地点名、住所、進行、ボタンはDOMに保持する。
- 初期表示はThree.js、GSAP、追加scene画像を待たない。
- 3Dはviewport接近後に遅延読込。静止時は描画停止する。
- mobile DPR上限1.25、desktop上限1.5を基準とし、実測FPS低下時は1.0へ落とす。
- 1回の章・地点transitionは700ms以内。連続oscillationと画面端のperipheral motionを避ける。
- `prefers-reduced-motion`では位置・拡大・カメラ移動を外し、opacityまたは即時切替へする。
- Save-Data／2G／WebGL非対応／context lossで2D地図と一覧を即時利用可能にする。
- touch targetは最低44×44pxを制作基準とし、WCAG 2.2の24CSSpxを下回らない。
- 200% zoomで主要操作とラベルが切れない。Three.js CSS2DRendererを主要ラベルへ使わない。
- LCP候補画像はlazy-loadしない。下層画像と3D bundleだけを遅延する。
- animationは`transform`と`opacity`中心。大面積`filter`、`box-shadow`、背景の連続変化を避ける。

## 7. 次の比較・再評価で必要な証拠

メイン担当は実装前後に同じ条件で次を記録する。

1. PC 1440×900: home first view、開封後、台帳中盤、地図選択、地点詳細。
2. mobile 390×844と375×667: 同じ5状態、片手で次の地点へ進めるか。
3. キャラクターあり／なし、3D on／off、reduced-motion、Save-Data、WebGL失敗。
4. Tab、Shift+Tab、Enter、Space、Escape、focus復帰、aria-liveの重複。
5. 横overflow、200% zoom、LCP候補、JS量、3D初期化前後、静止時描画停止。
6. 修正前後を同じcropで並べ、次のRound評価を100点基準で再採点する。

完成判定は合計85点以上に加え、富岡固有性・アートディレクション各12点以上を必須とする。特に「他都市名へ置換しても成立する」「固定キャラクターチャットに見える」「3Dを消しても見た目以外が何も変わらない」のいずれかが残る場合は完成としない。

## 8. URL検証記録

- 上記15URLと公開サイトは2026-07-22に`curl -L`でHTTP 200を確認した。
- Awwwards掲載内容、Codrops記事本文、R3F・Three.js・GSAP・W3C・web.dev・Apple公式記述は、Web検索結果と各公開ページを照合した。
- 公開サイトはHTTP 200を確認。担当枠ではin-app Browser接続が利用できず、新規スクリーンショットとruntime DOM測定は未確認である。
- CSS Design Awards、FWA、Behance、Dribbbleは、今回の3課題に対して実装・性能・アクセシビリティの一次根拠が弱いため採用根拠には使わなかった。

## 9. 未確認事項とリスク

- 公開実画面の新規PC／mobileスクリーンショット、屋外実機輝度、200% zoom。
- 各受賞作の現在のlive実装が掲載時と同一であるか。分析はAwwwards掲載ページの記録を根拠とした。
- 富岡製糸場・各店舗の正式資料、写真、商標、史実の利用許諾。
- 繭標の類似意匠・商標調査。参考事例からキャラクター固有表現は採用していない。
- 実装後のCore Web Vitalsと低性能Android相当のFPS・発熱。

## 10. メイン担当への引き継ぎ

最初の改修は「装飾追加」ではなく、`page.tsx`のLP節構造、3種の地図表現、Guideの固定吹き出しという3点へ限定する。3Dライブラリや新しい生成画像を先に増やさない。DOM/SVG正本、状態共有、inline注釈を成立させてから、必要な箇所だけ2.5Dを加える。
