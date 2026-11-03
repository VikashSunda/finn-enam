# Render verification — 3 November 2026

Public app: https://finn-enam-yid1.onrender.com

Render service: `srv-dbku1gtbedkc73eilfp0`, Node 24.14.1, Free ($0/month), Virginia. Existing services were left unchanged. Automatic deploys are off. The user entered Gemini credentials directly in Render; they were not read or committed.

## Observed hosted results

- First deployment of `4ecb913` succeeded in 34.7 seconds. `/healthz` and `/api/status` returned HTTP 200 without browser authentication; Gemini was configured.
- All 18 portfolio price and filing feeds returned live coverage, with 3 November completed EOD sessions (fresh refresh approximately nine seconds).
- The actual Gemini chain handled a primary-model 503: `gemini-3.1-flash-lite` failed, then `gemini-3.5-flash-lite` answered. Its two claims correctly separated Q1 FY27 FCF $955 million / 116.5% of net profit from Q2 $928 million / 113%. Matching excerpts were checked. This demonstrates one successful fallback, not guaranteed future uptime or universal interpretation correctness.
- Actual ITC financial-results PDF analysis returned HTTP 200, 20 parsed pages, ten retrieved passages and validated AI output.
- An initial unfamiliar-company request failed at report-link discovery. Research was corrected to try NSE independently even when Screener is unavailable; a regression test covers this. `ad44c7e` deployed successfully in 38.6 seconds.
- Retested ASIANPAINT: HTTP 200, ten evidence passages and AI synthesis. Four exchange transcripts parsed (34, 26, 26 and 38 text-bearing pages). The annual report exceeded the 14 MB online limit and remained explicitly unavailable. No full annual-report coverage is claimed.
- Guidance and reviewed financial endpoints returned HTTP 200. Hosted `/api/alert-delivery` returned HTTP 404 as intended.
- Browser walkthrough at 390px and 360px: all five screens had no horizontal page overflow; bottom navigation retained a 12px gap. Light/Dark persisted through reload; Dark restored. Profile → Settings worked. Volume tooltip showed the source-backed date, closing price, volume and previous-session change.

## Final UI correction

Manual testing exposed Windows-only delivery controls on the hosted Alerts screen. These are now hidden on non-local origins, with accurate in-app-alert wording; local Windows functionality and server-side hosted isolation remain intact.

Final application revision `4e088d4af980d4b6af288f246e852d8d0e4e3d7c` deployed successfully in 36.8 seconds (Render deployment `dep-dbku6n59fdbs73cbum10`, started 7:06 pm IST). After reloading the public site, Windows-only controls were absent. Changed the price rule from 4% to 5%, saved and reloaded, and confirmed the input remained 5%; restored 4%. Reviewed guidance loaded with its four-quarter history and original PDF-page links. Public HTML, CSS and browser scripts returned HTTP 200 and contained no matching Google/OpenAI credential patterns. Final desktop/mobile screenshots are stored locally in `.cache/qa/hosted-desktop.png` and `hosted-mobile.png`. Subsequent documentation-only commits do not change the deployed application.

## Checks and limits

71 automated tests pass; build and artifact validation pass. Browser width checks are not physical-device certification. The free service sleeps after inactivity; first requests can be delayed. Scheduling, snapshots and Windows notifications retain the limits in DEPLOYMENT.md. No paid resources were selected. Actual conversation export and the final submission email remain outstanding; no email was sent.
