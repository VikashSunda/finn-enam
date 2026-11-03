# Portfolio and unfamiliar-company reliability audit

Audit started: 2026-11-03T09:05:27.650Z (UTC). This is a dated local check, not a live counter.

All 18 registered price and filing feeds returned live-mode data without reported source errors. Every price summary used 20 previous sessions and had 30 available completed sessions. Latest price session: 2 November 2026. Intraday prices are not claimed.

Validated replacement snapshot: 2026-11-03T09:07:25.724Z. 231 indexed filings. The previous snapshot remains in Git history and `.cache/reliability/snapshot-before-refresh.json`. Historical price coverage in this replacement is 30 completed sessions per company.

Fresh fetches do not prove complete exchange coverage, a source calendar, or factual correctness of every filing. Timestamps on each feed are retained separately from session dates.

| Company | Latest price session | Prior baseline sessions | Indexed filings | Price / filing state |
| --- | --- | ---: | ---: | --- |
| RELIANCE | 2026-11-02 | 20 | 18 | live / live |
| TCS | 2026-11-02 | 20 | 15 | live / live |
| INFY | 2026-11-02 | 20 | 16 | live / live |
| HDFCBANK | 2026-11-02 | 20 | 17 | live / live |
| ICICIBANK | 2026-11-02 | 20 | 19 | live / live |
| ITC | 2026-11-02 | 20 | 6 | live / live |
| HINDUNILVR | 2026-11-02 | 20 | 13 | live / live |
| MARUTI | 2026-11-02 | 20 | 16 | live / live |
| M&M | 2026-11-02 | 20 | 12 | live / live |
| SUNPHARMA | 2026-11-02 | 20 | 17 | live / live |
| DRREDDY | 2026-11-02 | 20 | 15 | live / live |
| LT | 2026-11-02 | 20 | 16 | live / live |
| BEL | 2026-11-02 | 20 | 6 | live / live |
| HAL | 2026-11-02 | 20 | 3 | live / live |
| TITAN | 2026-11-02 | 20 | 7 | live / live |
| DIXON | 2026-11-02 | 20 | 12 | live / live |
| CDSL | 2026-11-02 | 20 | 9 | live / live |
| KPITTECH | 2026-11-02 | 20 | 14 | live / live |

## Research outside the preloaded corpus

These tests used the keyless local Worker to verify discovery, PDF parsing and attribution independently of model availability. No company below was added to the preloaded corpus.

| Symbol | HTTP | Evidence passages | Coverage and limits |
| --- | ---: | ---: | --- |
| AXISBANK | 200 | 10 | Annual Report 2026: parsed (582 text-bearing pages); Earnings call · 2026-10-26: link_notice — Filing is a link notice, not the transcript itself.; Earnings call · 2026-07-24: link_notice — Filing is a link notice, not the transcript itself.; Earnings call · 2026-04-30: link_notice — Filing is a link notice, not the transcript itself.; Earnings call · 2026-02-02: link_notice — Filing is a link notice, not the transcript itself. |
| ASIANPAINT | 200 | 7 | Annual Report 2026: unavailable — PDF exceeds the online parsing limit; Earnings call · 2026-08-03: parsed (26 text-bearing pages); Earnings call · 2026-06-03: parsed (26 text-bearing pages); Earnings call · 2026-02-02: parsed (38 text-bearing pages); Earnings call · 2025-11-18: parsed (30 text-bearing pages) |
| COFORGE | 200 | 10 | Annual Report 2026: parsed (182 text-bearing pages); Earnings call · 2026-10-24: link_notice — Filing is a link notice, not the transcript itself.; Earnings call · 2026-09-15: link_notice — Filing is a link notice, not the transcript itself.; Earnings call · 2026-07-29: link_notice — Filing is a link notice, not the transcript itself.; Earnings call · 2026-05-12: link_notice — Filing is a link notice, not the transcript itself. |
| ZZFINNINVALID123 | 422 | 0 | Source returned HTTP 404 |

All returned evidence for successful unfamiliar-company requests had a positive PDF page and a document ID/URL matching the response document list. This is attribution integrity, not manual factual verification of every passage.

AXISBANK and COFORGE returned annual-report evidence; link-only transcript notices were excluded. ASIANPAINT returned transcript evidence; its annual report exceeded the 14 MB parsing limit. Original links and explicit failure reasons remain available.

The synthetic invalid symbol returned a controlled error and no invented evidence. The UI/API message was subsequently improved to distinguish a missing discovery page from proof that a ticker does not exist.

## Safeguards and remaining work

- A separate COFORGE request through the keyed port-3001 server returned ten passages and correct document statuses, but Gemini synthesis returned HTTP 503 high demand. The response explicitly fell back to source excerpts. Successful model synthesis for this unfamiliar company is not claimed.
- Added and passed regressions for missing discovery pages and empty fresh price responses. Empty prices now retain a usable old snapshot with a stale label rather than claiming live coverage. Final build, all 24 tests and artifact validation passed.

- The snapshot promotion script validates exact company coverage, source modes, baseline/history lengths, unique sorted sessions, finite positive closes, nonnegative volumes, valid nonfuture filing timestamps and source URLs before writing. Empty filing responses require manual review.
- Research source cards now explicitly describe link-only notices and parser/download failures.
- Hosted-network behaviour and reviewer access remain separate checks. These local results do not prove the deployed site has been updated.
- Live synthesis for these three unfamiliar companies and manual content-support checks remain separate from these ingestion checks.
