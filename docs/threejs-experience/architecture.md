# Three.js アーキテクチャ

## 1. 採用判断: Three.js 直接実装（React Three Fiber は不採用）

| 観点 | Three.js 直接 | React Three Fiber |
| --- | --- | --- |
| 既存構成 | 本サイトは Next.js **静的書き出し**（`output: "export"`）。3D は 1 セクションのみで、React 状態と 3D の往復がほぼ無い | R3F は React ツリーと 3D を統合する利点があるが、その利点を使う場面が本サイトにはほぼ無い |
| バンドル | `three` のみ | `three` + `@react-three/fiber`（+ drei）で純増 |
| GSAP 連携 | `ScrollTrigger` から `camera.position` 等を直接触れる。最短経路 | R3F の render loop と GSAP ticker の二重管理になりやすい |
| cleanup | `dispose()` を自分で書く＝**確実に把握できる** | 自動化される反面、何が破棄されたか追いにくい |
| context lost | `webglcontextlost` を自分で扱える | ラッパ越しになり扱いが増える |
| Strict Mode 二重初期化 | `useEffect` 内で ref ガードすれば制御可能 | 同様だが層が増える |

**結論: Three.js 直接実装。** R3F の主目的（宣言的に多数の 3D コンポーネントを React 状態と同期）が本件の要件に無く、バンドルと二重ループのリスクだけが増えるため。drei も不採用。

> ライセンス注記: `gsap` は MIT ではない。`package.json` の license は
> `Standard 'no charge' license: https://gsap.com/standard-license.`
> **依存として利用**するのみで、エンジンのソースをリポジトリへ複製しない。

## 2. 構成: Hybrid Architecture

| 責務 | 担当 |
| --- | --- |
| Hero の 3D 空間（糸・繭・粒子・霧） | Three.js |
| 本文・見出し・番号・施設名・CTA | **DOM / CSS / SVG**（canvas へ描かない） |
| スクロール同期 | GSAP ScrollTrigger |
| 実地図・ピン・現在地 | **既存 Leaflet のまま**（Three.js と完全分離） |

**canvas には情報を一切描かない。** 文章は DOM のまま保持し、選択・検索・読み上げ・拡大を維持する。canvas は `aria-hidden`。

## 3. Scene 分割

段階実装。今回のブランチで実装したのは **Hero Scene のみ**（残りは storyboard に設計を記載）。

```
HeroScene   … 糸 + 繭 + 粒子 + 霧      ← 本ブランチで実装
StoryScene  … 手記・古地図の紙片       ← 設計のみ
CityScene   … 地図から立ち上がる街      ← 設計のみ
RouteScene  … 駅→入口の道順            ← 設計のみ
FinalScene  … 収束と CTA               ← 設計のみ
```

画面外のシーンは描画を止める（`IntersectionObserver`）。

## 4. Renderer 方針

```
WebGLRenderer
  alpha: true            … DOM 背景（墨緑）の上へ重ねるため
  antialias: tier >= MEDIUM のみ
  powerPreference: "high-performance"（LOW では "default"）
  preserveDrawingBuffer: false
  DPR: PC min(dpr, 1.75) / Mobile min(dpr, 1.25)
```

## 5. Device Quality 切替

検出する: viewport 幅 / `devicePixelRatio` / `matchMedia('(pointer: coarse)')` / WebGL 可用性 / `hardwareConcurrency` / `deviceMemory` / `prefers-reduced-motion` / `navigator.connection.saveData`。

| tier | 条件 | 内容 |
| --- | --- | --- |
| `high` | ≥1024px・WebGL2・cores ≥ 8 | 糸 tube 分割多・粒子多・霧・antialias |
| `medium` | ≥768px または cores ≥ 4 | 粒子削減・分割削減 |
| `low` | coarse pointer / 小画面 / 低スペック | 低ポリ・粒子最小・antialias 無・DPR 1.25 上限 |
| `static` | WebGL 不可 / reduce / saveData | **canvas を作らない**。CSS のみで静的表示 |

`static` でも情報・CTA・地図・文章は完全に利用できる。

## 6. GSAP ScrollTrigger 同期

- `scrub: true` で **スクロール量＝アニメーション時間軸**にする（スクロールジャックはしない）
- `pin` は使わない（長い pin はモバイルで嫌われるため）
- timeline は Hero セクション単位で 1 本
- 同期対象: `camera.position` / 糸の `drawRange` 相当の uniform / 繭の `material.opacity` / 粒子の可視性 / 霧の density
- `resize` で `ScrollTrigger.refresh()`。フォント・画像読み込み後にも refresh
- React Strict Mode の二重初期化は ref ガードで防止

## 7. Cleanup（必須）

unmount 時に必ず全て行う。

```
cancelAnimationFrame
ScrollTrigger.kill()  /  timeline.kill()
geometry.dispose() / material.dispose() / texture.dispose()
renderer.dispose()
renderer.forceContextLoss()
canvas を DOM から除去
ResizeObserver / IntersectionObserver / matchMedia / event listener 解除
参照を null に戻す（二重初期化防止）
```

## 8. WebGL context lost / restored

- `webglcontextlost` → `preventDefault()` し、描画ループを停止
- `webglcontextrestored` → シーンを再構築、または `static` へ降格
- 復旧不能なら **静的フォールバックへ切り替え、情報は保持**

## 9. 地図との分離（重要）

Three.js の街演出は**相対座標**で構わないが、**Leaflet の実緯度経度は一切触らない**。
ピン先端は座標に固定し、`translateY` / bounce / floating / 先端が動く scale を禁止する。
3D 演出のために地図の操作性を犠牲にしない。
