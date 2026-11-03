# Final local readiness — 3 November 2026

## Completed in the final pass

- Added a reviewed Infosys guidance-versus-delivery view, independent of model availability. It includes four consecutive reporting quarters of outlook history, source-page links, and a matched FY26 annual revenue-growth comparison. FY27 annual outcomes remain pending. This is a curated example, not automated extraction for every company.
- Added a reusable comparator that refuses period, metric, units or reporting-basis mismatches. Tests cover in-range, below/above-range, incomplete and incomparable inputs.
- Retested live Gemini: INFY period-separated cash, TCS guidance and HDFCBANK unsupported EBITDA all returned schema-valid responses. INFY and TCS content received sampled contextual review; the bank answer declined to invent missing metrics. See FINAL_AI_CHECKS.json. Three successes do not establish universal correctness or provider uptime.
- Fixed a real local outage caused by scheduled builds deleting the live Worker bundle. Builds now write a temporary output and rename it into place. Thirty API status requests during a concurrent build completed without failure.
- User explicitly confirmed the Windows test notification appeared. Scheduled event delivery still depends on fresh data, enabled delivery, server/monitor uptime and Windows settings; no mobile push or shutdown-resilient delivery is claimed.
- Final five-screen phone walkthrough at requested 390x844 and 360x800 settings passed without measured page overflow (embedded inner widths 375 and 346). Header remained visible and bottom navigation kept its gap. Light/Dark persisted through reload; original Dark preference restored. Existing System tests pass. No physical-device certification is claimed.
- Added a reviewed annual financial comparison with source-page quotes, explicit reporting basis, safe YoY calculation and honest missing EBITDA/QoQ states. Added Leadership research retrieval from company disclosures. See FINANCIAL_COMPARISON.md for scope and manual checks.
- All 66 tests passed; build and artifact validation passed.

## Core prototype coverage

18-company EOD portfolio; configurable 24-hour/7-day/30-day digest; category-based prioritisation with collapsed routine items; original filing links; source-backed filing PDF analysis with strict AI fallback; generic NSE research discovery; primary-document evidence with pages; saved alert rules; local scheduled refresh and opt-in Windows notifications; responsive UI and saved appearance preferences.

## Deliberate limits

The challenge presents research outputs as a menu, not a requirement to implement all of them. OCR, generic automatic Revenue/EBITDA/PBT/PAT comparisons, external leadership-background enrichment, mobile web push, brokerage holdings and fully automatic cross-company guidance scoring remain unimplemented. The reviewed Infosys financial example and primary-document Leadership topic do not establish those broader capabilities. Blocking/oversized/link-only PDFs remain explicitly disclosed. Evidence selection and matching quotes cannot prove every inference. Local schedules stop when their process or computer stops.

## Still required before submitting

1. Authorisation to create/push the GitHub repository and deploy the reviewed version. Earlier no-push/no-deploy instruction remains in force.
2. Verify signed-out access to the actual deployed version and repository after publication. Existing hosted metadata does not establish current revision/access.
3. Export the actual coding-agent conversations. The supplied ChatGPT share link is recorded but its contents/completeness/reviewer access are not verified. No export tool was available for the current Codex chat; use the app's available conversation-sharing/export controls or preserve the original conversation files for review. Decision logs are not substitutes.
4. Review SUBMISSION_DRAFT.md and add the final links. No email has been sent.

User's stated deadline: 3 November 2026, 11:59 pm IST.
