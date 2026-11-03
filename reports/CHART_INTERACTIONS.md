# Portfolio chart interactions — 3 November 2026

- Price history has a nearest-session crosshair and point marker on pointer movement.
- Volume history highlights the selected histogram bar with the same session details.
- Tooltip shows ticker, date, closing price, traded shares and price change against the preceding displayed completed session. The first displayed session has no fabricated prior-session percentage.
- Click/tap pins details; clicking the same session again dismisses them. Keyboard Left/Right, Home/End and Escape work on the focusable chart. The existing session table and original source link remain available.
- On phone layouts, details appear below the plot, avoiding a tooltip covering the small chart. No continuous animation is introduced.

Manual browser checks: price and volume modes; first/last session values; keyboard navigation and Escape; requested 360px and 390px viewport widths without horizontal page overflow. Embedded viewport inner widths were 346px and 375px. RELIANCE latest details matched the visible source-backed portfolio: 3 November close INR 1,307.9, volume 42,318,217 shares, +0.61% against 2 November. No physical touch-device certification is claimed.

Build, artifact validation and all 66 regression tests pass. Local screenshot: `.cache/qa/chart-volume-tooltip.png`.
