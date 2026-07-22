# キャラクター UI・アニメーション QA

> 実施日: 2026-07-22
> 再監査: Round 3（P1修正後）
> 対象: 現在の未コミット実装
> 判定: **P1解消。公開候補として合格、残るP2は継続改善項目**

## 1. 再監査範囲

- 仕様: `AGENTS.md`、キャラクター追加要件、`docs/character-bible.md`、`docs/character-motion-spec.md`
- 実装: `GuideCharacter.tsx`、同 CSS、`guide-character.ts`、`layout.tsx`、`ArchivePrelude.tsx`、地図・地点詳細・進捗・全体 CSS
- 素材: neutral / thinking / discovery の公開用透過 PNG 3点と制作 QA
- 検証: lint、TypeScript、production build、HTTP、画像の寸法・alpha・容量、墨緑／古紙背景での目視

このエージェントの in-app Browser 接続候補は0件だったため、操作再現はメイン環境の実測結果を照合した。メイン環境ではmobile map heroでbubble bottom 273.9px、h1 top 285.98px、overlap falseを確認済み。runtime console、動的なreduced-motion / Save-Data、画像404は引き続き最終公開QAで確認する。

## 2. Round 1 指摘の修正確認

| 初回指摘 | 再判定 | 確認内容 |
| --- | --- | --- |
| ルート遷移後に手動メッセージが残る | **解消** | `ManualMessage` にpathnameを保持し、現在pathnameと一致するときだけ有効。前ページの台詞は次ページへ残らない。 |
| 地図詳細とGuideのEscape競合 | **解消** | focusがguide内にある場合だけGuideがEscapeを処理。地図詳細内のEscapeではGuideがfocusを奪わない。 |
| 「後で見る」がない | **UI追加済み** | close / 後で見る / 案内を減らすを全てbuttonで提供。意味の分離はP2参照。 |
| close / footerが32px | **解消** | desktop 44px、mobile 48px。character buttonも54×58px以上。 |
| 一枚絵だけで状態差が読めない | **改善** | neutral / thinking / discovery の3状態へ分離。表情、傾き、朱糸の方向差がある。 |
| priority offでも暗黙live | **解消** | offではroleとaria-liveの両方を付けない。 |
| closed時の壊れたaria-controls | **解消** | open時だけ `aria-controls` を付与。 |
| 初回開封前からキャラクターが出る | **解消** | homeは`archiveReady`まで描画しない。開封完了イベント後に表示。 |
| Save-Data / 2Gで動き続ける | **部分解消** | `data-static=true`でcharacter/thread/bubble animationを停止。素材tierはP2参照。 |
| 情報準備中の自動吹き出しが強すぎる | **解消** | auto-open対象を明示的な7状態に絞り、checkpoint pendingは手動呼び出しのみ。 |

## 3. 総評

キャラクター単体は採用水準を維持している。繭殻、古紙、朱糸、真鍮が富岡・製糸・研究記録へ直接つながり、幼児向けのゆるキャラ、アニメ模倣、意味のない和柄を避けている。3状態とも右上の欠け、左の深緑影、二眼、V字裾、真鍮留めを保持し、文字、透かし、余計な手足、背景残りはない。

thinkingは短い眉と左への傾き、discoveryは浅い笑みと右へ伸びる朱糸・真鍮の糸先で、neutralからの意味差を読める。CSSだけの回転だったRound 1より、状態と物語の結びつきが明確に改善した。

UIも、履歴、進捗、ページ文脈、初回開封、閉じる、再表示、案内頻度、画像失敗、reduced-motion、低速回線へつながり、単なる装飾ではない。地図ではhero内へ配置して地図本体とスクロール分離し、初回台詞も開封後の時制へ修正された。公開を止めるP0/P1は残っていない。

## 4. Round 3 P1解消確認と残るP2

### 解消 — 地図右パネルとの競合

MapPage hero内へ `<GuideCharacter placement="map-hero" />` を配置し、global版は`/map`で描画しない。map-heroはhero基準のabsolute配置なので、スクロール後のLeaflet、右側地点一覧、地点詳細へ追従せず、地図操作と競合しない。

mobileではheroを500pxへ拡張し、h1を9vw・span nowrapへ調整。メイン環境の実測はbubble bottom 273.9px、h1 top 285.98pxで、12px以上の分離を確認した。hero top 63px / bottom 563px内に収まる。

- 判定: **解消**。desktopのright panel競合とmobileのhero copy重なりの両方を回避。

### 解消 — 初回開封後の時制

first-visitを「記録が開きました。準備ができたら調査を始めましょう。」へ変更。開封完了後の画面状態と一致し、未提供の歴史情報や謎の答えを含まない。

- 判定: **解消**。opened / skipped共通でも矛盾しない中立文として成立。

### P2 — 「後で見る」と「閉じる」が同じ処理

「後で見る」と右上closeは両方 `closeGuide` を呼び、同じ`messageKey`をsessionStorageへ保存する。UI要件は満たしたが、操作の意味差はない。

- 修正案: `later`は同一ページ滞在中だけ抑止し、永続既読へ入れない。closeはsession既読、案内を減らすはlocalStorageの頻度設定、と3段階に分離する。実装を簡潔に保つなら文言を「この案内を閉じる」へ統一し、重複ボタン自体を置かない選択もあるが、今回の必須要件では意味分離を推奨する。

### P2 — Save-Data tierは動きを止めるが、neutral一枚へ固定しない

`data-static=true` はanimationを停止するが、画像選択は通常と同じ `guideImageSrc` である。さらに画像は `loading="eager"`。低速回線でdiscovery/thinkingへ入ると、その差分PNGを取得する。

- 現状: 公開PNGは320×320へ最適化済みで、neutral 57KB、thinking 59KB、discovery 56KB、合計約172KB。各80KB／全体450KBの両予算を満たす。
- 修正案: static tierではneutralへ固定し、`loading="lazy"`又はviewport近傍でのみ取得する。状態はDOMテキストで伝わるため、低速時に差分画像は必須ではない。

### P2 — 小ラベルと操作文字が屋外利用には小さい

`FIELD GUIDE` は0.56rem、bubble actionは0.68rem、calloutは0.62rem。ターゲット面積は改善したが、文字そのものは約9–11pxである。

- 修正値: actionは最低0.75rem（12px）、calloutも0.75rem。FIELD GUIDEは装飾なら非表示にしてもよい。本文はmobile 0.875rem（14px）以上を推奨。

### P2 — 3画像で14状態の核は表せるが、map-readingはneutralのまま

`map-reading` はgetGuideImageのthinking群に含まれずneutral画像を使い、CSSで-2°回転する。最低3状態の試作としては合格だが、キャラクターの主要責務である地図案内が専用の視線／朱糸方向を持たない。

- 修正案: 次の追加1点は `map-reading` を優先する。顔座標を固定し、視線を下げ、一本糸を地図側へ伸ばす。全14状態を一度に増やさない。

## 5. PC 1440×900

コードから確定できる点:

- Guide外幅368px、right最大34pxでviewport横overflowは起こしにくい。
- open character buttonは82×110px、closedは60×66px、close/actionは44pxでターゲット基準を満たす。
- bubbleは286pxで、45文字以内の台詞は過度な長行にならない。

mapはhero内に限定され、スクロール後の右400px panelと同一領域を占めない。global fixed版については、final/checkpointのページ末尾フォームやnavigationを覆わないことを公開URLで継続確認する。

## 6. Mobile 390×844

コードから確定できる点:

- grid合計は `100vw - 16px`、right 8pxなので左右8pxに収まり、横overflowは起こしにくい。
- global版は現行emergency banner無効、mobile header 62pxに対しGuide top72pxで、header直下10pxから始まる。
- close / actionは48px、character buttonは54×58px以上。
- bubbleは最大278pxで、character列と合わせても390px内に収まる。
- map版は500px hero内のtop10pxに限定。実測bubble bottom 273.9px、h1 top 285.98pxでoverlapなし。

実画面で必要な確認:

- 375×667と200% zoomでも、map heroの12px間隔が維持されるか確認する。
- 200% text zoomでfooterの2 actionが折返し、切れ、重なりを起こさない。
- emergency bannerを有効化した場合はtop offsetを固定72pxのままにしない。

## 7. キーボード・読み上げ

合格できる実装:

- native button、`aria-expanded`、open時だけの`aria-controls`、日本語labelを使用。
- off messageにはlive roleを付けない。
- focusがGuide内にある場合だけEscapeを処理し、地図詳細のfocus復帰を奪わない。
- 自動表示でfocusを強制移動しない。
- キャラクター画像は装飾で、情報はDOMテキストにも存在する。
- close後はGuide buttonへfocusを戻す。

メイン環境で必要な確認:

- Tab / Shift+Tab / Enter / Space / Escape。
- map detailとGuideを同時表示したEscape。
- 開封完了statusとGuide greetingの二重読み上げ。
- 画像404時のfallback buttonとbubble読み上げ。

## 8. Motion・reduced-motion・fallback

- idleは1px、最大3回、12秒周期で、常時大振幅ではない。
- discoveryは720ms、bubbleは420msで操作を待たせない。
- reduced-motionではbubble、character、loading thread、discovery/clearを停止。
- Save-Data / 2Gでは `data-static=true` により同じ主要animationを停止。
- image onError後はCSS繭形fallbackへ切替え、bubbleとbuttonは残る。
- GuideはDOM/CSS/PNGで、Three.js/WebGLと独立している。

残る確認は、OS設定を表示中に切替えた場合、画像404、WebGL context loss、2Gエミュレーションで主要操作が継続するかである。

## 9. ビジュアル品質

### 採用

- 繭、紙、糸、真鍮の素材感が既存の古地図・研究記録UIと一貫。
- 縦長の栞型で識別性があり、幼児的な大頭身・過剰な笑顔・アニメ目がない。
- neutral / thinking / discoveryで、輪郭、顔、欠け、V字裾、留め具が同一キャラクターとして保たれる。
- thinkingの短い眉と傾き、discoveryの笑みと伸びる糸は状態に意味がある。
- 320×320 RGBA、3点合計約172KB、文字・ロゴ・生成崩れなし。400px版からの縮小後も輪郭と顔の同一性を維持する。

### 改善余地

- 円形portrait＋固定吹き出しはhelp widgetの既視感が残るが、mapではhero内へ物語的に接続され、global fixedだけだった状態より改善した。
- small UI chromeが密集している。FIELD GUIDE、進捗、仮名、calloutを全て常時見せる必要があるか、実画面で一要素ずつ減らす。
- discoveryだけ糸先に円錐状の真鍮具があり、今後別小道具へ増殖させない。

判定は、**キャラクター画像・Guide UIとも公開候補**。P2は機能を阻害しない継続改善項目とする。

## 10. 検証記録

- `npm run lint`: 成功
- `npx tsc --noEmit`: 成功
- `npm run build`: 成功。18静的ページ生成
- `/`、`/map/`、`/checkpoints/atelier/`: 前回確認で200 OK
- `git diff --check`: 成功
- PNG: neutral 57KB、thinking 59KB、discovery 56KB、各320×320 RGBA
- 3画像を原寸で目視し、同一性と生成崩れを再確認
- `npm test`: scriptなし
- 本再監査の編集は `docs/character-ui-qa.md` のみ。`src/lib/geo.ts`、src、public、Git操作には触れていない

## 11. 未確認事項と次作業

未確認:

- in-app Browserが利用できないため、実スクリーン、runtime console、DOM矩形、実キーボード操作
- 200% zoom、動的reduced-motion、Save-Data/2G、画像404、WebGL context loss
- 商用公開条件、類似意匠・商標の専門的確認

メインエージェントが次に行うべきこと:

1. 公開直前にPC 1440×900 / mobile 390×844で home、map、checkpoint、close、later、reduce、restore、Escapeを通し確認。
2. reduced-motion、画像404、2G/static tierを確認。
3. 375×667と200% zoomでmap heroの間隔とbubble actionの折返しを確認。
4. Pages base path build、公開URLのconsoleを再確認。
5. 公開後の改善候補としてlater/closeの意味分離、static tierのneutral固定、小文字サイズ、map-reading専用画像を優先する。
