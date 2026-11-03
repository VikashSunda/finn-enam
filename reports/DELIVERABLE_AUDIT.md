# Submission audit — 3 November 2026

Checked against the original four-page Main challenge PDF, the companion reference, the application and current verification reports. User deadline: 3 November 2026, 11:59 pm IST. The Main PDF explicitly presents frontend examples/research outputs as illustrations and a menu, not a completion checklist.

| Requirement | State and evidence |
| --- | --- |
| Mock portfolio of 15–20 NSE/BSE companies | Implemented: 18 NSE companies across 10 sectors; explicitly a demo watchlist, not actual investments. |
| EOD price and volume | Implemented: completed-session prices, previous-close changes, relative volume with baseline exclusion; source links and freshness states. |
| Exchange announcements | Implemented: original NSE links, category/priority classification, selectable digest window, collapsed routine items. |
| Configurable triggered alerts | Implemented in app; opt-in local Windows background delivery is user-confirmed. Hosted/mobile background delivery is not implemented. |
| Primary-source fundamentals | Implemented: annual reports/transcripts; four seeded companies plus generic NSE document discovery. Blocked/unreadable data is disclosed. |
| Generalises beyond demo companies | Implemented generic NSE path with prior unfamiliar-ticker tests; not every company's documents are accessible. |
| Pull research grounded in primary data | Implemented page-attributed excerpts, optional Gemini, copied quote/citation/numeric checks, explicit fallback. Meaning and all interpretations are not automatically proven. |
| Mobile-first interactive product | Implemented responsive screens, saved themes, profile/settings, Alerts, research/evidence, interactive price and volume charts. Browser widths 360/390 and desktop checked; no physical-device certification. |
| Financial / guidance depth | Reviewed Infosys annual financial and guidance comparisons, four-quarter outlook history. Generic automatic quarterly tables and four-quarter delivery scoring are not claimed. |
| Management enrichment | Leadership primary-document topic implemented; automatic incoming-person biographies and external profile enrichment are not implemented. This is an illustrative feature, not a core requirement. |
| Public working prototype link | PENDING: Render production adapter and blueprint are ready; no deployment/access test yet. |
| GitHub repository | PENDING publication in this audit pass. User authorised a separate FINN repository and push; original projects remain untouched. |
| Actual AI build history | INCOMPLETE: earlier user-provided share URL recorded in ASSIGNMENT_SOURCES.md; its content/completeness/reviewer access is unverified. Current and other actual build conversations still need export/share links. Decision logs are not substitutes. |
| Short covering writeup | DRAFT ready in SUBMISSION_DRAFT.md; final prototype/repository/history links must be inserted. |
| Submission email | NOT SENT. Recipient and subject are recorded in the draft; sending requires the user's instruction. |

## Final verification

- 70 automated tests pass, including production HTTP routing, health check, body limit, HEAD requests, non-leaking errors and hosted desktop-control isolation.
- Build, artifact validation and browser-script syntax checks pass.
- Previous manual checks and sampled live Gemini outcomes are recorded under `reports/`; the Windows notification was explicitly confirmed by the user.
- Latest feed report: `PORTFOLIO_FRESHNESS.json`. Local data success does not establish hosted coverage.
- Credential-pattern scan of tracked history and publishable working files found no matching Google/OpenAI keys or private-key headers. Ignored caches, environment files and node_modules are excluded from publication.

The core local prototype is ready to publish for hosted testing. The entire submission is NOT complete until the public app/repository links, actual conversation history and final covering note are verified. OCR, hosted/mobile push and fully automatic financial extraction remain deliberate limitations.
