# WebGL / Three.js テスト計画

## 検証hook contract v1

検証ビルドだけで次を公開します。

```ts
window.__THREEJS_QA__ = {
  snapshot(): {
    version: 1,
    mode: "HIGH" | "MEDIUM" | "LOW" | "STATIC",
    contextState: "ready" | "lost" | "restoring" | "fallback",
    fallbackVisible: boolean,
    rendererCount: number,
    canvasCount: number,
    activeRafLoops: number,
    scrollTriggerCount: number,
    resizeObserverCount: number,
    intersectionObserverCount: number,
    ownedEventListenerCount: number,
    offscreenDraws: number,
    markers: number,
    resources: { geometries: number, materials: number, textures: number },
    rendererInfo: { calls: number, triangles: number, geometries: number, textures: number }
  },
  dispose(): Promise<void> | void,
  reinitialize(): Promise<void> | void,
  loseContext(): Promise<void> | void,
  restoreContext(): Promise<void> | void
}
```

counterはQA側からThree.js内部へ手を伸ばすためでなく、実装が所有するresource/listenerを公開APIで数えるためのものです。`renderer.info`は各snapshot時点の値を複製して返し、renderer本体を外へ公開しません。

## 初期化/重複

- 通常: renderer 1、`canvas[data-threejs-canvas]` 1、RAF 1以下。
- React Strict Mode: mount-cleanup-mount後も1。
- `reinitialize()` 2回でも1。
- route 5往復、bfcache、visibility復帰後も増加0。
- dev HMR後にCanvas/renderer/RAF/STが増えない。HMRは手動操作を含むため録画とsnapshot前後値を残す。
- productionにGSAP marker 0。

## Cleanup

`dispose()` 後に renderer/canvas/RAF/ScrollTrigger/ResizeObserver/IntersectionObserver/owned listener/resource 全て0を要求します。geometry、material、textureは生成箇所でregistry counterを増減し、共有resourceはreference countを用います。`renderer.dispose()`、context release、Canvas DOM除去までを完了とします。

## Context loss

`WEBGL_lose_context`または同等の検証経路を `loseContext()` に閉じ込めます。lost時はpreventDefaultし、RAFを止め、静的fallbackを表示します。`main`本文、CTA、header、map routeはCanvasなしで利用可能でなければなりません。restore不能でもSTATICのまま情報を保持します。

## Capability mode

判定入力は viewport、DPR、reduce、saveData、WebGL可否、hardwareConcurrency、deviceMemory、pointer、hoverです。UA文字列だけで判定しません。

- HIGH: desktop、十分なCPU/memory、saveData off、WebGL可。
- MEDIUM: 小型PC/tabletまたは中程度能力。
- LOW: touch mobile、低memory/CPU、saveData等。DPR/粒子/更新を下げる。
- STATIC: reduce、WebGL不可、context復旧不能。RAF/ScrollTrigger/WebGL描画0。

モードごとの結果はhookの`mode`で判定し、見た目だけから推測しません。
