# Mobile / iOSテスト計画

## 自動WebKit/Chromium

幅 `320 / 375 / 390 / 430`、DPR 1で次を実行します。

- 横overflow 0px、日本語保護語の分断0。
- mobile pinは0を推奨。存在する場合でも1.5 viewportを超えない。
- page末尾、map list/detail末尾へ到達し、白い固定高余白がない。
- 地図はview modeでpointerを奪わず、利用者が「地図を操作」を押した時だけpanする。
- CTA/主要操作44×44px以上、Canvas `pointer-events:none`。
- portrait→landscape後もoverflow/白い隙間0。
- reduce時に情報差分0、描画loop 0。
- 404、header/footer、Section 3〜6、mapをWebKit別画像で比較。

## 物理iPhoneでのみ確定できる項目

1. Safariアドレスバーを開閉しながら上下端へscroll。
2. safe-area、ホームインジケータ、固定CTA被り。
3. 縦横回転後のScrollTrigger refreshとCanvas backing size。
4. OSの「視差効果を減らす」をページ表示中にON/OFF。
5. tab切替、別app復帰、browser back/bfcache後のloop増殖。
6. 低電力モード30fps、5〜10分連続閲覧の発熱/熱低下。
7. VoiceOver順序、地図操作、固有名詞読み。
8. pinch zoom/200%で文字・CTA・sheetが隠れない。

Playwright WebKitはSafariエンジン差の早期検出には使えますが、物理iPhoneのbrowser UI、GPU、safe-area、低電力、熱を再現しません。自動WebKit PASSを「iPhone実機確認済み」と表記してはいけません。
