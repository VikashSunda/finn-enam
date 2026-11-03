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
| Public working prototype link | LIVE: https://finn-enam-yid1.onrender.com — public health/status, all 18 feeds, filing analysis, Gemini fallback, unfamiliar-company research and mobile layouts checked. See HOSTED_VERIFICATION.md. |
| GitHub repository | COMPLETE: https://github.com/VikashSunda/finn-enam — public, `main` pushed and remote revision matched. Anonymous `git ls-remote` succeeded with credential helpers disabled. Original projects remain untouched. |
| Actual AI build history | INCOMPLETE: user confirms this Codex chat is the only build session. Its actual share/export is still needed. Earlier user-provided ChatGPT share URL remains recorded but its content/completeness/reviewer access is unverified. Decision logs are not substitutes. |
| Short covering writeup | DRAFT ready in SUBMISSION_DRAFT.md; final prototype/repository/history links must be inserted. |
| Submission email | NOT SENT. Recipient and subject are recorded in the draft; sending requires the user's instruction. |

## Final verification

- 71 automated tests pass, including independent NSE discovery when Screener fails, production HTTP routing, health check, body limit, HEAD requests, non-leaking errors and hosted desktop-control isolation.
- Build, artifact validation and browser-script syntax checks pass.
- Previous manual checks and sampled live Gemini outcomes are recorded under `reports/`; the Windows notification was explicitly confirmed by the user.
- Latest feed report: `PORTFOLIO_FRESHNESS.json`. Local data success does not establish hosted coverage.
- Credential-pattern scan of tracked history and publishable working files found no matching Google/OpenAI keys or private-key headers. Ignored caches, environment files and node_modules are excluded from publication.

The source is public on GitHub and the app is live on Render. The entire submission is NOT complete until the actual conversation history and final covering note are verified and the user sends the submission. OCR, hosted/mobile push and fully automatic financial extraction remain deliberate limitations.
