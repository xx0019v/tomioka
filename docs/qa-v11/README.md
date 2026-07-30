# v11 release QA record

Use this file as the evidence template for a v11 release candidate. Automated
results come from `npm run test:e2e:v11`; physical-device checks must remain
explicitly marked as unverified until they are actually performed.

## Candidate

- Commit: `edaf1a3` plus the release-QA typography/touch-target fix
- Build command: `NEXT_PUBLIC_BASE_PATH=/tomioka npm run build`
- QA base URL: `http://127.0.0.1:3002/tomioka`
- Tester: Codex automated recovery run
- Date and timezone: 2026-07-30 / Asia/Tokyo
- Chromium: system Google Chrome through Playwright
- WebKit: Playwright WebKit
- Physical iPhone / iOS: not run
- Physical Android / OS: not run

## Automated gate

- [x] Chromium: all 9 viewports passed
- [x] WebKit: all 9 viewports passed
- [x] 320x568 / 360x800 / 375x812 / 390x844 / 393x852 / 430x932 / 768x1024 / 1024x768 / 1440x900 covered
- [x] Horizontal overflow: 0
- [x] Visible first-party touch targets below 44×44px: 0
- [x] Short button-label wraps: 0
- [x] Single-character final-line orphan approximations: 0
- [x] Console errors and uncaught page errors: 0
- [x] Failed or HTTP 4xx/5xx same-origin resources: 0
- [x] Broken same-origin images: 0
- [x] SilkTrail progress recorded at 0 / 25 / 50 / 75 / 100 percent
- [x] All five SilkTrail dash offsets differ and decrease monotonically
- [x] resize / orientationchange / persisted pageshow burst schedules one frame
- [x] hidden state schedules no frame; visible restoration schedules one frame
- [x] idle and lifecycle checks report `data-loop-count="0"`
- [x] reduced motion reports running 0 / infinite 0 / autoplay video 0
- [x] reduced motion leaves SilkTrail complete (`progress=1`, `dashoffset=0`)
- [x] Map view/interaction mode toggles correctly
- [x] Spot detail updates URL, Escape closes it, and focus returns
- [x] Geolocation success renders the current-location marker
- [x] Landscape map route has no horizontal overflow

Command and result:

```text
npm run test:e2e:v11

10 passed (2.0m)
```

## Manual iOS and accessibility gate

- [ ] Safari address-bar expansion/collapse does not cover a primary control
- [ ] Portrait → landscape → portrait preserves the current map state
- [ ] App switch and tab switch restore without duplicated or missing motion
- [ ] Browser back through bfcache restores the same SilkTrail and map state
- [ ] Reduce Motion toggled on-device produces zero persistent motion
- [ ] Low Power Mode has no broken time-based motion or input stalls
- [ ] VoiceOver reading order and control names are coherent
- [ ] 200% text and 400% reflow preserve content and actions
- [ ] Pinch zoom and native back gesture remain available
- [ ] No fixed control overlaps the home indicator or keyboard
- [ ] Five-minute use shows no material heat or progressive slowdown

Unverified physical-device items:

```text
Physical iPhone/Android, Safari address-bar behavior, Dynamic Island/home
indicator on hardware, VoiceOver, Low Power Mode, real app switching/bfcache,
five-minute thermal behavior, and physical GPS were not run.
```

## Evidence and failures

- Numeric report: `docs/qa-v11/results.json`
- Summary: `docs/qa-v11/summary.md`
- Screenshots: `home-390x844.png`, `home-1440x900.png`, `map-webkit-393x852.png`
- Numeric animation observations: Chromium `1002.250 / 751.616 / 501.127 / 250.489 / 0`; WebKit `1002.254822 / 751.616165 / 501.127411 / 250.488754 / 0`
- Fixes: prevent the hero guide control shrinking to 3px at 320px; keep Japanese heading meaning units together
- Retest result: Chromium/WebKit 10/10 passed

## Release decision

- [x] PASS — automated production-preview release gate
- [ ] BLOCKED — unresolved automated failure

Decision notes:

```text
The production static export passes both browser engines and every automated
release gate. Physical-device-only observations remain explicitly unverified
and are not represented as completed.
```
