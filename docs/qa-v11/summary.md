# v11 automated QA summary

Generated: 2026-07-30T02:53:43.026Z

QA base URL: `http://127.0.0.1:3002/tomioka`

| Project | Viewports | Layout/resource failures | Silk states | Reduce infinite | Map landscape overflow |
| --- | ---: | ---: | ---: | ---: | ---: |
| chromium | 9 | 0 | 5 | 0 | 0 |
| webkit | 9 | 0 | 5 | 0 | 0 |

## SilkTrail scroll measurements

### chromium

| Progress | stroke-dashoffset |
| ---: | ---: |
| 0.000 | 1002.250000 |
| 0.250 | 751.616000 |
| 0.500 | 501.127000 |
| 0.750 | 250.489000 |
| 1.000 | 0.000000 |

Lifecycle request counts: burst 95 → 96; hidden 96; restore 97; idle 97; persistent loops 0.

### webkit

| Progress | stroke-dashoffset |
| ---: | ---: |
| 0.000 | 1002.254822 |
| 0.250 | 751.616165 |
| 0.500 | 501.127411 |
| 0.750 | 250.488754 |
| 1.000 | 0.000000 |

Lifecycle request counts: burst 32 → 33; hidden 33; restore 34; idle 34; persistent loops 0.

## Scope note

This automated record covers emulated Chromium and Playwright WebKit. Physical iPhone, VoiceOver, Low Power Mode, thermal behavior, browser chrome, and real bfcache/app-switch behavior remain manual release gates.

