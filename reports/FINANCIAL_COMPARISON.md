# Reviewed financial comparison and Leadership — 3 November 2026

Research now provides an independent, model-free Infosys financial comparison. FY26 and FY25 annual values come from PDF page 287 of the company annual report, on a consolidated Ind AS basis, in INR crore. Revenue from operations, PBT and PAT include their original quotes and source links. PAT includes non-controlling interests. This is a reviewed historical example, not automatic financial-table extraction across companies.

YoY calculations reject missing metadata, incompatible metrics/currencies/units/bases, invalid dates, unsupported periods and zero/negative prior values. Only aligned calendar month-end annual or quarterly periods are supported. Annual figures never produce QoQ. EBITDA is unavailable rather than substituted with operating profit. The reusable calculator supports quarterly comparisons when matching quarterly inputs exist; the current reviewed UI example contains annual data only.

Leadership is a new Research topic that prioritises professional background, qualifications, profiles and appointments in retrieved company documents. It uses the existing page-attributed evidence and citation checks. It does not scrape social profiles, guarantee a complete biography or establish present-day office holders from an older annual report. Generic committee and remuneration passages are down-ranked.

## Verification

- 66 existing and new regression tests pass, including endpoint scope, unsupported tickers, reporting-basis/date validation, primary-page quote matching and leadership retrieval ranking.
- Build and artifact validation pass.
- Manually opened the financial panel, expanded source wording and closed it, confirming focus returns to the opener.
- Desktop source links retain `#page=287`; no document links were replaced.
- Requested 390px and 360px browser widths (embedded inner widths 375px and 346px): no horizontal page overflow. The wide financial table scrolls within its own container.
- Manually opened Infosys research and the Leadership tab; company annual-report profile passages appear with page links. Retrieval ranking was refined after generic governance passages initially appeared too high.
- Local desktop notification delivery was separately confirmed by the user. Physical-phone push, OCR and general automatic financial extraction remain unavailable.

Screenshot: `.cache/qa/financial-comparison-desktop.png` (local, ignored by Git).

No repository was created remotely; nothing was pushed or deployed.
