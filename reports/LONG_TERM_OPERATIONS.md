# Long-term operation and repeat verification

The user explicitly approved daily automated GitHub snapshot commits and Render redeployment on 3 November 2026. No paid hosting was authorised or selected.

## Update paths

- Open app: check live portfolio feeds on startup and approximately every 15 minutes while visible/online; reconnect and returning to the tab trigger due checks. This is EOD monitoring, not an intraday price feed.
- Research: a bundled corpus expires after seven days and is rediscovered when requested. Freshly fetched corpora use a six-hour in-memory cache. A failed rediscovery retains the old corpus as a labelled stale fallback. Reviewed historical guidance/financial examples remain deliberately historical.
- Daily durable portfolio: `.github/workflows/daily-refresh.yml` schedules one run at 22:47 IST (`17 17 * * *` UTC), plus manual dispatch. It checks tests/build, requests all 18 live feeds, validates the complete response, commits only the audited snapshot/report, triggers this FINN service's deploy hook and waits for `/healthz` to report the exact new commit.
- Failed validation stops before snapshot replacement and publication. Partial/cached responses, invalid values, future sessions, insufficient history, old fetches and missing companies are rejected. The previous deployed snapshot remains available. Quiet individual filing feeds may be empty; all-empty exchange coverage requires review.
- The deployment hook is a GitHub Actions secret scoped to this service. The Gemini key remains solely on Render. Hooks and credentials must never be added to code or reports.

## Activation and limitations

ENABLED AND MANUALLY VERIFIED. The user approved the ongoing GitHub commits/deployments and final scoped secret save. [First full run](https://github.com/VikashSunda/finn-enam/actions/runs/41650554328) succeeded in 1m 9s. All build, 79-test, validation, source-refresh, Git commit and deployment-verification steps passed. It generated snapshot commit `6d50c5dd2cb4be41bdee1f0af50d98a12b3de034`; the public health endpoint reported that exact revision. `/api/status.snapshotAt` matched the persisted `HOSTED_REFRESH.json.checkedAt` value (`2026-11-03T14:07:33.558Z`), proving the new instance loaded the automated snapshot. The first actual scheduled trigger is still in the future; the identical job was verified by manual dispatch.

GitHub schedules may run late or be dropped under load; public scheduled workflows can be disabled after repository inactivity. Review Actions failures and repository notifications. This is not an exact-time or indefinite availability guarantee. Render free services sleep when idle; the daily job allows for wake-up but does not prevent sleep or circumvent free-plan limits. Source sites and model quotas/capacity remain external dependencies. Neither background mobile notifications nor always-on market alerts are claimed.

## Current checks

Repeat hosted checks returned HTTP 200 for health, status, all 18 live feeds, reviewed financials and guidance. The latest repeat AI request returned attributed excerpts because an unsupported numeric claim was rejected. Earlier hosted checks demonstrated valid AI and real model fallback after 503. The numeric prompt has been strengthened to prohibit rounding, unit conversion and derived claims; the quote/number checks remain strict.

After the automated deployment, two additional uncached requests passed:

- Forced Infosys document rediscovery (`refresh: true`) returned a live corpus with 381 annual-report pages and four transcripts (48/47/46/39 pages). Its fetch time advanced to `2026-11-03T14:11:02.913Z`. Gemini 3.1 returned 503; 3.5 answered Q2 FY27 FCF as $928 mn and 113% of net profit, supported by matching quotations on two primary PDF pages. Full cold document processing and synthesis took approximately 87 seconds.
- HDFCBANK's requested EBITDA was not established by the retrieved passages. The backup model returned an explicit scoped limitation rather than inventing an amount. Its annual report remains unavailable; four transcripts were present.

No unsupported AI answer was made acceptable by weakening validation. These are observed tests, not a claim that every future answer will be supported or every source will remain accessible. Local generated monitor files were preserved in a Git stash before fast-forwarding to the automation commit.

References: https://render.com/docs/free · https://render.com/docs/deploy-hooks · https://render.com/docs/environment-variables · https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule
