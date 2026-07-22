# 「繭が遺した地図」キャラクターバイブル

> Status: Draft / 仮設定
> Character ID: `GUIDE-01`
> Working name: **繭標（まゆしるべ）**
> この名称・造形・設定は正式決定ではない。正式名称、商標、自治体・施設・運営による承認、史実監修、商用利用条件の確認後に差し替え可能な形で扱う。

## 0. 前提と安全境界

- 「繭標」は実在人物、史実上の人物、富岡市の公認キャラクターを表さない。
- 現行サイトにある「永山 繭」「明治五年」「百五十年前の研究記録」は、受領済みサイト内の物語設定として参照する。ただし、本バイブルでは史実として断定しない。
- キャラクターは謎の答え、キーワードの実値、判定条件を話さない。画像名、alt、メタデータ、レイヤー名にも答えを入れない。
- キャラクターは主要情報の唯一の伝達手段にしない。吹き出しを閉じても、地図・地点一覧・進行状況・エラー復帰を利用できること。
- 正式な施設情報と未確認情報を区別する。未確認時は断定せず、「いま確認しています」等の状態表現へ置き換える。

## 1. 採用コンセプト

### 1.1 一文定義

**研究記録の欄外に残された注釈が、繭殻・絹糸・古紙の姿で立ち上がり、街の記憶を指し示す小さな非人型案内体。**

### 1.2 役割

繭標は装飾用マスコットではなく、ユーザーと記録の間をつなぐ「状態の翻訳者」である。

1. 初回訪問で、記録を開く操作と探索の目的を一文ずつ案内する。
2. 地図では、朱い絹糸の先端で選択地点と次の操作を示す。
3. 発見時は、進行状況の変化を短い反応で補強する。
4. ヒント表示前に、ネタバレへ進む意思を確認する。
5. 未確認・通信不良・保存失敗を責めずに説明し、復帰操作へ視線を導く。
6. 完了時はユーザーの観察と歩行を称え、物語を奪わない。
7. 再訪時は初回説明を繰り返さず、続きから再開できることを知らせる。

### 1.3 物語上の立場

- 人間でもカイコでも妖精でもなく、「記録に残った意志の形」という曖昧さを保つ。
- 過去の出来事をすべて知る語り手ではない。読めるのは、画面内で解放された記録と確認済み公開情報だけ。
- 答えを知っていて隠す存在ではなく、ユーザーと同じ順序で記録を読み解く共同調査者。
- 街や施設を所有・代表しない。富岡市、公的機関、個別店舗の代弁者として振る舞わない。

## 2. キャラクター設計

### 2.1 性格

| 軸 | 定義 | UIでの表れ方 |
| --- | --- | --- |
| 観察好き | 小さな差異に気づく | 答えではなく「見る場所」「次の操作」を示す |
| 静かな好奇心 | 大げさに煽らない | 発見時も一拍置き、短く喜ぶ |
| 慎重 | 未確認を断定しない | 「確認中」「もう一度試せる」を明示する |
| 対等 | 子ども扱いしない | 命令口調・幼児語・過剰な敬語を避ける |
| 伴走的 | 失敗を評価しない | ユーザーを責めず、復帰方法を示す |

年齢感は設定しない。視覚上は幼児体型ではなく、細身で縦長の比率と抑制した表情により「小さな知性」を表す。

### 2.2 話し方の核（詳細台詞はConversation担当へ）

- 一文は原則24〜42字、吹き出しは最大2文。1回の表示で一つの目的だけを扱う。
- 「〜だよ」の連続、幼児語、キャラクター語尾、過剰な感嘆符を使わない。
- 基本は穏やかな常体。「見てみよう」「確認できる」「少し待ってください」を自然に使い分ける。
- 一人称は原則省略。呼びかけの「あなた」を連呼しない。
- 「探偵」「勇者」「任務」など既製ゲームの役割語より、「記録」「観察」「印」「糸」「続き」を使う。
- 正解・不正解を人格評価へ結びつけない。「違う」ではなく「まだ記録と結びつかないようです」。
- 未確認情報は「この情報は、いま確認しています」。通信時は「記録を読み込めませんでした。地図はそのまま使えます」。
- 音声を前提にせず、同内容のDOMテキストを提供する。

## 3. 造形

### 3.1 シルエット

正面の外形を、上から順に次の三層で固定する。

1. **割れた繭殻のフード**：縦長の卵形。右上に小さな欠け、左側に深緑の影。完全な球体にしない。
2. **古紙の短冊胴**：肩幅より下が細い、栞のような縦長台形。裾は中央に浅いV字の切り欠き。
3. **一本の朱糸**：頭頂の後ろから出て、向かって左へ一度だけ輪を描き、必要時に案内方向へ伸びる。

手足は作らない。左右の「腕」に見える動作は、胴の脇から出る二本の細い絹糸で行う。指の生成崩れを防ぎ、非人型としての独自性を保つ。足元は浮遊させず、真鍮色の小さな栞留めが接地点になる。

### 3.2 比率（正面・基準ポーズ）

- 全高を100としたとき、繭殻フード34、顔面領域18、短冊胴51、真鍮留め5、上下の間隔10。
- 最大幅はフード部44。胴の肩幅34、裾幅26。
- 頭身表現では約2.7頭身相当だが、幼児型の大頭・短肢にはしない。
- 朱糸の太さは全高の0.8〜1.1%。48px以下のアイコンでは2px相当に補正する。
- 正面は完全左右対称にしない。**右上の欠け、左側の深緑影、左回りの朱糸**を恒常的な非対称要素とする。

### 3.3 顔

- 目：墨色の小さな縦楕円を2点。外側へわずかに上がる。白目、虹彩、まつ毛は作らない。
- 眉：通常は表示しない。考える・注意・困る状態のみ、目の上に短い墨線を一本ずつ置く。
- 口：通常は1本の短い水平線。喜びは浅い弧、驚きは小さな丸。歯、舌、頬染めを描かない。
- 鼻、耳、髪、眼鏡を追加しない。
- 表情は目の間隔・顔パーツ位置を変えず、目の開き、眉線、口線、フード角度で作る。

### 3.4 恒常モチーフ

| モチーフ | 意味 | 固定ルール |
| --- | --- | --- |
| 割れた繭殻 | 記録が開いた状態 | 右上の欠け位置と輪郭を全画像で固定 |
| 朱い一本糸 | 道筋・選択・発見 | 分岐させない。常に一本の連続線 |
| 古紙の短冊 | 研究記録・栞 | 裾のV字欠けを保持 |
| 真鍮の栞留め | 地図上の地点・接点 | 足や靴へ変形させない |
| 深緑の左影 | サイトUIとの接続 | 常にキャラクター自身から見て右、画面から見て左 |

## 4. 色・線・素材

既存UIトークンと素材写真へ合わせ、新しいアクセント色を増やさない。

| 用途 | 色 | 既存UIとの関係 |
| --- | --- | --- |
| 繭殻・紙の主色 | `#F4F0E7` | paper |
| 紙の影 | `#E7DECD` | paper-deep |
| 墨線・顔 | `#24251F` | text |
| 左側の影・裏地 | `#17372F` | ink-green |
| 最暗部 | `#0C241F` | ink-green-deep |
| 真鍮留め | `#9B7A3F` | gold |
| 案内糸・重要状態 | `#A33B2B` | vermilion |

- 既存のライム `#D8EF6B` はWeb上の機能的CTA色として残すが、キャラクター本体には使わない。
- 線は墨のドライブラシではなく、わずかに濃淡のある0.9〜1.4%幅の端正なインク線。毛羽立ちは外輪郭の10%未満。
- 紙と繭殻はマット。ハイライトは面積の8%以下。真鍮のみ低い反射を許可する。
- 汚し、焼け、しみ、破れを足しすぎない。経年表現は紙影と微細な繊維で行う。
- 3Dレンダー風の強い被写界深度、プラスチック光沢、ゲーミング発光を使用しない。

## 5. 表情・ポーズ・状態

全状態で顔の基準点、右上の欠け、裾のV字、朱糸の起点、色を固定する。下表の差分以外を勝手に変えない。

| 状態ID | 表情・姿勢 | 朱糸／小道具 | 動作意図 | 静止代替 |
| --- | --- | --- | --- | --- |
| `neutral` 通常 | 正面3/4、目は水平、口は短い直線 | 朱糸は左後ろに一輪 | 画面内に静かに同席 | 基準立ち絵 |
| `greeting` 挨拶 | 上体を6°前傾、目をわずかに細める | 右側の糸先を胸高へ | 初回・再訪の歓迎 | 前傾した立ち絵 |
| `thinking` 考える | フードを8°左傾、片眉線、目線を左上 | 糸先が小さな疑問形ではなく一重の輪 | 観察を促す | 左傾ポーズ |
| `surprised` 驚く | 目を縦に12%拡大、口を小円 | 糸が一度だけ上へ跳ねる | 予期しない変化 | 糸先が上向きの立ち絵 |
| `found` 発見 | 目線を選択地点へ、浅い弧の口 | 糸が地点へ一直線、先端に小さな真鍮点 | 新規記録・地点の発見 | 方向線＋真鍮点 |
| `delighted` 喜ぶ | フードを3°上向き、目を細め、浅い弧 | 糸が身体の後ろに一つの大きな弧 | 進行更新への共感 | 開いた姿勢 |
| `troubled` 困る | 眉線を内側へ、口を短い下向き弧 | 糸先が胴の近くで止まる | 入力・保存・通信の停滞 | まとまった糸先 |
| `caution` 注意 | 正面、目を開く、口は直線 | 糸を横一線に張り、先端に朱の小印 | 安全・ネタバレ確認 | 横線の停止標識 |
| `direction` 方向 | 身体を案内方向へ10°回す | 一本糸を目的UIへ伸ばす | 次の操作・マップ誘導 | 糸先を矢印化せず対象へ接続 |
| `map` 地図を見る | 3/4俯瞰、目線を下へ | 二本の補助糸で無地の小さな紙を支える | 地点選択・全体把握 | 無地紙＋視線 |
| `idle` 待機 | 基準姿勢、4〜6秒ごとに一度まばたき | 朱糸は静止時間を長く取る | 常時運動を避けた存在感 | `neutral` と同一で可 |
| `loading` ローディング | 目線を糸先へ、口は直線 | 糸先の小さな輪が1回転後に停止 | 読み込み中の状態説明 | 3/4円の糸輪 |
| `error` エラー | 困る表情より弱い眉、身体は直立 | 朱糸が真鍮点の手前で途切れたように重なる（線自体は一本） | 復帰可能な失敗 | 糸先＋再試行UIを別DOMで表示 |
| `clear` クリア | フードを5°上向き、目を細め、口は浅い弧 | 一本糸が全地点を結ぶ大きな輪。金粉は使わない | 完了した経路の可視化 | 輪と地点点の静止画 |

### 5.1 向き差分

- 必須：正面3/4（基準）、左右3/4、背面3/4。
- 完全な横顔は「direction」のみ。顔パーツが消えるため通常会話には使わない。
- 左右反転で済ませない。右上の欠け、深緑影、朱糸の起点はキャラクター固有の側に保つ。
- 背面でも右上の欠け、紙の裾V字、真鍮留めを見せ、別キャラクター化を防ぐ。

## 6. 2D・2.5D・3Dの使い分け

### 採用

- **主表現：精密な2D**。透過PNGマスターから、WebP/AVIFを派生。吹き出し、地点案内、エラーなど、可読性と一貫性が重要なUIへ使う。
- **演出表現：限定的な2.5D**。`shell-front`、`face`、`paper-body`、`thread-front`、`thread-back`、`brass-tab`、`shadow`の7層へ分け、CSS/SVG/Rive等で短い視線・傾き・糸の移動を作る。
- **極小表示：手作業の簡略SVG記号**。フード輪郭、墨の二眼、朱糸一周だけで表す。AI画像の縮小だけで済ませない。

### 現時点で不採用

- **常用フル3Dキャラクター**：既存サイトには地図用WebGLがあり、キャラクターまで常時3D化するとロード・発熱・WebGL失敗範囲を広げる。繭殻や紙がプラスチック玩具化しやすく、表情同一性も下がる。
- 3Dは将来、マスター造形を保持できるクレイ／紙シェーダーの試作と実機性能検証を通過した場合に限り、クリア時の短い特別演出へ検討する。
- 地図上へ置く場合も、WebGL内でしか読めない情報にせず、2D DOM版を同時に成立させる。

## 7. Web使用寸法と構図

| 用途 | CSS表示目安 | 素材 | 構図・安全域 |
| --- | --- | --- | --- |
| 呼び出しボタン | 40〜48px | 簡略SVG | フード＋目＋朱糸、装飾なし |
| モバイル吹き出し | 72×88〜96×116px | 2D透過WebP | 全身、外周12%の透明余白 |
| PC吹き出し | 112×136〜152×184px | 2D透過WebP | 全身、吹き出し側へ視線 |
| マップ地点案内 | 64〜88px | 簡略SVGまたは胸上 | 地図マーカーと誤認しない円形背景を付けない |
| 状態・エラー | 88〜128px | 2D透過WebP | `troubled` / `error`、復帰ボタンを隠さない |
| プロローグ | 180〜260px mobile / 260〜360px desktop | 2.5D | 画面端へ寄せ、主CTAと見出しを避ける |
| クリア演出 | 240〜320px mobile / 360〜480px desktop | 2.5D | 1.2秒以内の短い状態変化、終了後静止 |
| OGP・ポスター | 全高が画面短辺の28〜38% | 高解像度2D | キャラ単体にせず古地図・朱糸と統合 |

- 生成マスター：透過2048×2048px、sRGB、外周12%の透明余白、人物のみで文字なし。
- 表情を読ませる通常運用の最小全高は72px。48px以下では簡略記号へ切り替える。
- UI上の画像に重要文言を焼き込まない。台詞・状態名・ボタンはHTMLで実装する。
- キャラクターが固定表示される場合、モバイルでは幅96px以下、高さ116px以下を初期値とし、下部ナビ・地図ズーム・フォーム送信を覆わない。
- 透過画像の余白込みファイルサイズ目標：通常1枚80KB以下、クリア用160KB以下。PNGは制作マスター、配信はWebP/AVIFを優先する。

## 8. 同一性ロック

以下は全バリエーションで変更禁止。生成後の採否判定に使う。

1. 右上が欠けた縦長の繭殻フード。
2. 画面から見て左側に入る深緑の影。
3. 顔は墨色の縦楕円二眼＋短い一本口。鼻・耳・髪なし。
4. 裾中央に浅いV字欠けがある縦長の古紙短冊胴。
5. 頭頂後方から始まる一本の朱糸。通常は左回りの輪を一つだけ作る。
6. 接地点となる小さな真鍮の栞留め。足・靴なし。
7. 手指なし。操作は細い絹糸で行う。
8. 既定7色以外を本体へ追加しない。
9. 目・口の基準座標と間隔を維持し、状態差分で顔面比率を変えない。
10. 紙・繭殻はマット、真鍮のみ低反射。プラスチック光沢なし。

### 8.1 生成差分の許容値

- 全高に対する最大幅：42〜46%。
- 左右の目の中心間：顔面幅の32〜36%。
- 目の高さ差：全高の0.6%以内。
- フード右上の欠け：全高の3〜5%、外周の1か所のみ。
- 朱糸：本体に対し一本。見かけ上の交差は1回以内。
- 真鍮留め：全高の4〜6%。
- 色差：承認マスターから知覚上明らかな色相変更を不可とし、影の明度差だけを許容する。

### 8.2 QAで即時不採用とする崩れ

- 目が3個以上、左右で形状・高さが大きく異なる、虹彩や白目が追加される。
- 指、靴、耳、髪、触角、羽、尻尾が発生する。
- 朱糸が複数本へ分裂する、糸が体を貫通する、行き止まりが不自然に浮く。
- V字の裾、右上の欠け、真鍮留めが消える、または左右反転する。
- 状態ごとに輪郭・比率・衣装・素材・色が変わる。
- 繭殻が毛皮、石、陶器、プラスチック、金属へ見える。
- 背景の残存、偽の透明市松、発光フリンジ、切り抜きの白縁がある。
- 意味不明な文字、記号、ロゴ、署名、ウォーターマークが入る。
- 既存アニメ、自治体マスコット、ゲームキャラクターを連想させる固有要素が強い。

## 9. 画像生成仕様

### 9.1 制作順序

1. `GUIDE-01-neutral-front-master.png` を一枚だけ生成し、輪郭・顔・欠け・朱糸・栞留めを目視承認する。
2. 承認マスターを参照画像として、左右3/4・背面3/4を**編集**で作る。毎回ゼロから再生成しない。
3. 同じ承認マスターを参照し、状態差分を一画像一ポーズで編集する。
4. 目・口・糸の崩れを100%表示で確認し、必要なら手作業で修正する。
5. 2.5D対象だけを7層へ分割する。元画像と編集後画像を別ディレクトリで管理する。
6. 本番採用分だけをトリミング規則・命名規則・圧縮規則へ揃え、実画面で72px／96px／144px表示を確認する。

### 9.2 マスター生成プロンプト（背景透過・基準正面）

以下は画像生成ツールへ渡す基準プロンプト。正式名ではなく `GUIDE-01` を識別子として使う。

```text
Create one original non-human guide character for a refined Japanese cultural mystery web experience, character ID GUIDE-01, on a truly transparent background with generous 12% clear padding. Single character only, centered, full body, calm three-quarter front view, no text, no symbols, no logo, no props floating in the background.

Identity: an annotation from an old research record given a small physical form. The silhouette has exactly three layers: a tall oval cocoon-shell hood with one small chip on its upper-right rim; a slim vertical antique-paper bookmark body with a shallow V-notch at the center of the bottom edge; and one continuous vermilion silk thread emerging from behind the crown, making exactly one loose loop toward image-left. No arms, hands, fingers, legs, feet, shoes, ears, hair, antennae, wings or tail. A small low-reflective brass bookmark clasp touches the ground below the paper body.

Face: exactly two small vertical oval ink-black eyes, evenly aligned, no whites and no irises; one very short horizontal ink line for the mouth; no nose. Keep the expression observant, intelligent, gentle and restrained, suitable for both children and adults, never infantile.

Fixed asymmetry: the upper-right chip, a deep ink-green shadow on image-left side of the hood and body, and the single left-looping red thread must all remain visible. Materials are matte fibrous cocoon shell, handmade old paper, fine silk thread and softly aged brass. Clean controlled ink outline, subtle paper fiber, very limited weathering.

Palette only: warm paper #F4F0E7, paper shadow #E7DECD, ink #24251F, deep green #17372F and #0C241F, aged brass #9B7A3F, vermilion thread #A33B2B. Soft quiet directional light from upper left, minimal contact shadow contained inside the transparent canvas. Premium editorial character design, Japanese archival material culture, precise silhouette, production-ready cutout, no anime styling, no mascot costume, no chibi proportions, no glossy 3D plastic, no gradients, no neon, no decorative kimono pattern, no photoreal human, no real historical person.
```

### 9.3 状態差分用編集プロンプト

各状態は承認済み基準画像を参照し、以下の固定文＋状態差分だけで編集する。

```text
Edit the supplied approved GUIDE-01 master. Preserve the exact silhouette, proportions, face anchor positions, upper-right hood chip, image-left deep-green shadow, center V-notch, single vermilion thread origin, brass clasp, palette, material texture, line weight, lighting and transparent 2048×2048 canvas. Do not redesign, mirror or add anatomy. Change only the expression, tilt and thread gesture described below. Keep one character only and no text.

STATE DELTA: [paste exactly one state delta from the list below]
```

状態差分：

- `greeting`: upper body leans forward 6 degrees, eyes slightly narrowed, the thread tip rises to chest height; calm welcome.
- `thinking`: hood tilts 8 degrees toward image-left, one short eyebrow line above each eye, gaze shifts upper-left, thread makes one small simple loop near the body; no question-mark symbol.
- `surprised`: eyes become only 12% taller, mouth becomes one tiny circle, thread flicks upward once; restrained surprise.
- `found`: eyes look toward image-right, mouth is a shallow upward arc, the single thread extends cleanly to image-right and ends at one small brass point.
- `delighted`: hood tilts upward 3 degrees, eyes gently narrow, mouth is a shallow upward arc, thread makes one broad arc behind the body; no confetti.
- `troubled`: two short brows angle slightly inward, mouth is a short shallow downward arc, thread tip rests close to the paper body.
- `caution`: straight upright posture, open attentive eyes, straight mouth, thread stretches horizontally and ends at one small vermilion stop mark; no warning triangle.
- `direction-left`: body turns 10 degrees toward image-left, gaze follows, the single thread extends toward image-left and visually connects to an off-canvas target; no arrowhead.
- `direction-right`: body turns 10 degrees toward image-right, gaze follows, the single thread extends toward image-right and visually connects to an off-canvas target; no arrowhead.
- `map`: three-quarter downward gaze, two short thread segments from the same continuous thread support one small completely blank paper sheet; no writing or map labels.
- `loading`: gaze follows the thread tip, straight mouth, thread forms one clean three-quarter circle beside the body; no spinner icon.
- `error`: upright body, very mild inward brows, straight mouth, one continuous thread overlaps itself just before the brass endpoint to suggest an interrupted route; no broken body and no alarming face.
- `clear`: hood tilts upward 5 degrees, eyes gently narrow, shallow upward mouth, one continuous thread forms a large calm loop around four small unlabeled brass points; no letters, numbers, words, confetti or fireworks.

### 9.4 方向・背面モデルシート用プロンプト

```text
Using the supplied approved GUIDE-01 master as an exact identity reference, create a clean production model sheet on a truly transparent background showing four separate non-overlapping views at equal scale: front three-quarter, left three-quarter, right three-quarter, and back three-quarter. Preserve the character's fixed physical side: the one upper-right cocoon-shell chip, the dark green material side, the center V-notch, the origin and direction of the single vermilion thread, and the brass clasp. Do not simply mirror views. Neutral expression only. No labels, no text, no grid, no shadow crossing between views. This is an identity consistency check, not a redesign.
```

### 9.5 生成後の書き出し規則

- 制作マスター：PNG、2048×2048、sRGB、straight alpha、非圧縮または可逆。
- Web配信：透過WebPを第一候補。対象ブラウザとビルド構成でAVIF透過を検証できた場合のみAVIF併用。
- 命名：`guide-01_[state]_[view]@2x.webp`。答え、キーワード、正式未確認名称をファイル名へ入れない。
- 同じ外接矩形・基準線・12%余白を維持し、状態切替時のジャンプを防ぐ。
- `alt` は状態の重複説明を避ける。隣接テキストが同内容なら装飾画像として空文字。キャラクターだけが状態を伝える場合は「案内役が地図の方向を示している」等、謎を含まない機能説明にする。

## 10. 不採用コンセプト

### A. 明治期の少女研究者

人間の少女が和洋折衷の衣装と研究ノートを持つ案。表情と会話は作りやすいが、不採用。

- 実在人物・史実の再現と誤認されやすい。
- 衣装考証が未確認のまま文化・歴史表現を断定する危険がある。
- アニメ作品風へ寄りやすく、対象年齢が狭く見える。
- AI生成で手指、服飾、左右差の破綻点が増える。
- 既存サイトの静かな資料性より人物イラストが前に出すぎる。

### B. かわいいカイコ／繭の動物マスコット

丸い白いカイコが地図を持つ案。一目で製糸を連想しやすいが、不採用。

- 自治体・観光・蚕糸関連で広く使われる語彙に近く、独自性を作りにくい。
- 丸い頭、大きな目、短い手足は一般的なゆるキャラのシルエットになる。
- 子ども向けへ偏り、現行サイトのエディトリアルな緊張感と衝突する。
- 3D化した場合に白いプラスチック玩具へ見えやすい。
- 地図・記録・UI状態との接続が「持ち物」に依存し、キャラクター自身の造形へ統合されない。

## 11. 禁止事項

- 正式マスコット、公認キャラクター、歴史上実在した存在と表記する。
- 既存キャラクター名、特徴的な配色、顔比率、シルエット、衣装、決めポーズを参照・模倣する。
- カイコの幼虫、動物、人間の子どもへ寄せる。
- 意味のない和服、家紋、麻の葉、青海波、桜、鳥居、扇子を追加する。
- 研究者らしさの記号として眼鏡、白衣、虫眼鏡を安易に足す。
- 「かわいい」を理由に頭を大型化し、目に白目・ハイライト・頬染めを追加する。
- 糸を魔法、武器、鞭、拘束具として描く。
- 常時跳ねる、点滅する、浮遊し続ける、画面端から頻繁に飛び出す。
- 吹き出しで主要CTA、地図ズーム、地点名、フォーム、ブラウザ戻る相当の導線を覆う。
- ユーザーの操作を待たせる登場演出、閉じられない案内、同じ台詞の強制反復。
- 金粉、粒子、過剰な発光、虹色グラデーション、ガラス、ネオン、派手な勝利演出。
- 生成画像の文字をUIとして使用する。
- 未確認の観光情報、歴史、施設営業時間、謎の正解を画像や台詞へ含める。

## 12. ブランド展開

- **Web**：キャラクター本体より朱糸をUI接続要素として使い、吹き出し、選択地点、進行線を同じ一本の線で結ぶ。
- **地図**：地点マーカーそのものにはせず、選択地点を案内する補助レイヤーにする。実座標の正確性をキャラクター演出で曖昧にしない。
- **研究記録カード**：真鍮留めと裾V字をカードのインデックス形状へ転用する。
- **SNS／OGP**：単体の顔アップより、古地図の余白＋一本の朱糸＋小さな全身でブランドの物語を伝える。
- **印刷・グッズ**：1色版は墨一色の輪郭＋線種差で成立させる。朱糸の意味を色だけに依存させない。
- **ローディング／エラー**：キャラクターを状態の説明補助に留め、進捗・再試行・2D地図への導線は独立したHTMLで提供する。

## 13. 添付要件チェックリスト

- [x] 役割、性格、年齢感、シルエット、モチーフ、配色、素材感を定義した。
- [x] 通常、挨拶、考える、驚く、発見、喜ぶ、困る、注意、方向、地図、待機、ローディング、エラー、クリアを定義した。
- [x] 正面・左右・背面の向き差分と、左右反転禁止を定義した。
- [x] 2D／2.5D／3Dの使い分けと、フル3D不採用理由を示した。
- [x] 小型スマートフォンUIでの最小寸法と簡略版を定義した。
- [x] AI生成の同一性ロック、崩れ判定、背景透過プロンプトを用意した。
- [x] 既存の古紙、絹糸、墨緑、真鍮、朱の世界観へ接続した。
- [x] 主要操作、アクセシビリティ、reduced-motionをキャラクターから独立させる方針を示した。
- [x] 謎の答え、未提供の史実、実在人物、公認表現を禁止した。
- [x] 仮名称・未承認・差し替え前提を明記した。
- [ ] 正式名称・商標・類似意匠の専門的クリアランスは未実施。
- [ ] 画像生成ツールの利用規約・商用利用条件・公開範囲は、実際に使うツールとアカウントで未確認。
- [ ] 正式ストーリー監修、施設監修、運営承認は未取得。
- [ ] 承認マスターの画像生成・目視QA・小サイズ実画面確認は、Visual Production担当の次工程。

## 14. 次工程への受け渡し

1. Visual Production担当は、まず`9.2`の基準画像を一枚だけ生成し、`8`の同一性ロックで採否判定する。
2. 採用前に、既存キャラクター・商標との類似調査と、使用ツールの商用利用・公開条件を確認する。
3. Motion担当は7層構造を使い、待機は4〜6秒の静止時間を主体、予備動作100〜160ms、状態変化240〜420ms、クリア1.2秒以内を初期値として試作する。
4. Conversation担当は、本書の話し方だけを制約として受け取り、正式ストーリーや正解を補完しない。
5. Web統合担当は、キャラクターなしでも全導線が成立する状態を先に確認し、その後に案内を漸進的強化として追加する。
6. QA担当は、PC・390px幅・屋外相当の低コントラスト環境・reduced-motion・画像失敗・WebGL非対応で確認する。
