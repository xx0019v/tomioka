# v11 automated QA summary

Generated: 2026-08-03T05:55:27.679Z

QA base URL: `http://localhost:3000`

| Project | Viewports | Layout/resource failures | Silk states | Reduce infinite | Map landscape overflow |
| --- | ---: | ---: | ---: | ---: | ---: |
| chromium | 9 | 0 | 5 | 0 | 0 |
| webkit | 9 | 0 | 5 | 0 | 0 |

## SilkTrail scroll measurements

### chromium

| Progress | stroke-dashoffset |
| ---: | ---: |
| 0.000 | 1002.250000 |
| 0.250 | 751.628000 |
| 0.500 | 501.127000 |
| 0.750 | 250.501000 |
| 1.000 | 0.000000 |

Lifecycle request counts: burst 104 → 105; hidden 105; restore 106; idle 106; persistent loops 0.

### webkit

| Progress | stroke-dashoffset |
| ---: | ---: |
| 0.000 | 1002.254822 |
| 0.250 | 751.722511 |
| 0.500 | 501.064621 |
| 0.750 | 250.532310 |
| 1.000 | 0.000000 |

Lifecycle request counts: burst 33 → 34; hidden 34; restore 35; idle 35; persistent loops 0.

## Scope note

This automated record covers emulated Chromium and Playwright WebKit. Physical iPhone, VoiceOver, Low Power Mode, thermal behavior, browser chrome, and real bfcache/app-switch behavior remain manual release gates.

