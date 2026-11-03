# FINN — Investor Intelligence

A mobile-first portfolio brief and primary-source company research prototype for the ENAM AI Engineer Build Challenge.

**Live demo:** https://finn-enam-yid1.onrender.com · Free Render hosting can take time to wake after inactivity. Hosted verification and known limits: [reports/HOSTED_VERIFICATION.md](reports/HOSTED_VERIFICATION.md).

**Current state:** Working EOD monitoring, a prioritised exchange-filing digest, configurable browser-local rules, and primary-document search with PDF page attribution. AI synthesis is implemented but requires a server-side Gemini or OpenAI API key. Without a key, the app explicitly shows source excerpts and never pretends those are model-generated analysis.

## Run

Node 24 LTS:

```sh
npm ci
npm run dev
```

Open http://localhost:3000. No key is needed to explore the real source snapshot.

For model-backed synthesis, export **one** provider's key in the server environment before starting. The development server does not automatically load `.env` files. For example, in PowerShell:

```powershell
$env:GEMINI_API_KEY = "your-key"
npm run dev
```

Never commit keys. Hosted secrets belong in the hosting provider's runtime environment. Supported names are documented in `.env.example`. API usage is separate from a ChatGPT subscription and may incur provider charges.

## Gemini availability

FINN tries the configured Gemini model first (default `gemini-3.1-flash-lite`), then `gemini-3.5-flash-lite` and `gemini-3.8-flash`. The response and UI identify the actual responder. All models use the same required quote schema and server-side source checks.

The chain runs sequentially, with short increasing jittered delays, a 25-second timeout per attempt, and at most three attempts. Capacity/server errors, timeouts and unavailable models can advance the chain. Bad requests, credentials and quota errors stop immediately; invalid generated content is rejected without trying to find a more permissive answer. If none answers, attributed excerpts remain available.

Override the ordered backups with `GEMINI_FALLBACK_MODELS` (comma-separated); an empty value disables fallback. Configure this in the server environment, since dev does not load env files. Changing the configured chain requires restarting the server; this default implementation was loaded by the running server through the existing development reload.

Google documents HTTP 503 as temporary provider unavailability: https://ai.google.dev/gemini-api/docs/troubleshooting. These default text models have free-tier entries in https://ai.google.dev/gemini-api/docs/pricing; project-specific eligibility and quota still apply. FINN does not enable billing or change account tier. Model-list visibility alone does not prove inference access: live tests found the older 2.5 models return 404 for this account.

## Product

- **Daily brief:** 24-hour default, 7-day and 30-day windows; important categories first; routine filings expandable; direct exchange links.
- **Portfolio:** 18-company demonstration watchlist, add/remove NSE symbols, daily close, percentage move, relative volume against up to 20 preceding sessions and interactive price/volume history with session tooltips.
- **Appearance & profile:** Profile avatar V opens Vikash’s menu and Settings. Choose Light, Dark or System; the saved choice applies before initial paint and follows device changes in System mode. The brief greets Vikash using device-local time. No account or login actions are implied.
- **Alerts:** A dedicated navigation section contains triggered alerts and existing rules. The brief keeps a compact linked alert summary. Configurable absolute price and relative-volume thresholds plus announcement-category preferences. Checked on refresh, not background phone notifications. Preferences remain in the browser.
- **Research:** Four preloaded companies (INFY, TCS, RELIANCE, HDFCBANK); generic NSE ticker discovery and PDF extraction where accessible. Business, financials, cash quality, balance sheet, guidance, leadership and risk evidence search. Questions use the same primary corpus.
- **Evidence:** Document links and PDF page numbers; facts/inferences separated in optional AI outputs. Unknown citation IDs, unmatched supporting quotes and numbers absent from cited evidence are rejected. Matched quotes can be expanded in the research view.
- **Source health:** Fresh fetch, snapshot, stale fallback and unavailable states; missing data is never replaced by generated numbers.

## Sources and provenance

`data/snapshot.json` contains real Yahoo Finance daily prices and NSE corporate announcements fetched by `scripts/collect.py`. Each feed preserves its URL and fetch time. No synthetic financial data is seeded.

`data/research.json` contains extracted text from primary reports/transcripts. Screener is a **link-discovery source only**. Its financial tables and AI summaries are not research evidence. The Infosys annual report is downloaded directly from Infosys; available transcripts are company filings on NSE. Stored documents include original URLs, PDF pages, content hashes and download status.

The repository does not contain downloaded PDFs; `.cache/` is ignored. Some annual reports are blocked by the source. Link-only transcript notices are detected and not treated as transcript evidence. The UI discloses these coverage limits.

Refresh source snapshots locally:

```sh
python -m pip install pymupdf
python scripts/collect.py --tickers INFY TCS RELIANCE HDFCBANK
npm run build
```

The collector needs Node only for the app, and Python/PyMuPDF for offline collection. The deployed Worker uses `unpdf` for on-demand PDF extraction.

## Architecture and choices

Browser UI → Worker API → source adapters / cached corpus → evidence retrieval → optional LLM synthesis.

- Plain HTML/CSS/JS and one bundled Worker keep deployment and review simple.
- Server-side requests avoid browser CORS problems and keep API keys off the client.
- Primary-source corpus is chunked by PDF page. Term/topic retrieval avoids embedding cost for this small corpus. Larger corpora should use hybrid retrieval and relevance evaluation.
- Parsed sources and answers use bounded, isolate-local caching. These caches are not durable across cold starts.
- The genuine snapshot provides a usable first load when financial sites throttle requests. Live refresh failures retain clearly labelled cached evidence.
- EOD volume baseline excludes the current day and requires at least 10 historical sessions. In-progress daily bars are excluded before 15:40 IST.

## Trade-offs and limitations

- Prototype, not investment advice. Filing-category rules are explainable heuristics, not a comprehensive materiality model.
- No brokerage integration, real holdings, real-time prices or hosted/mobile background delivery. Unattended local checks and Windows delivery require the local server and monitor to remain running.
- Online parsing is capped at 14 MB per document. Scanned/image PDFs may require OCR, which is not implemented.
- Financial websites can block hosted requests even if local requests work. Missing annual reports and blocked transcripts are visible.
- Research checks validate source IDs, copied supporting quotes and numeric presence. These do not establish semantic correctness, metric/period alignment or every inference; human review remains necessary. Model-written limitation text is replaced by a fixed statement scoped to retrieved passages. See reports/AI_VERIFICATION.md for live outcomes and remaining limits.
- A manually reviewed Infosys guidance-versus-delivery example is available in Research without a model call, including four reporting quarters of outlook history and one aligned FY26 annual comparison. It is explicitly curated, not automated for every ticker. The comparator rejects period/metric/unit/basis mismatches; FY27 annual delivery remains pending.
- No automatic Revenue/EBITDA/PBT/PAT table is claimed. These metrics require verified filing extraction; EBITDA should not be fabricated where unreported or unsuitable for a sector.
- Research corpus snapshots expire after seven days and rediscover company reports/transcripts on demand; failed rediscovery retains clearly labelled older evidence. Provider/source availability remains variable.
- Public sharing for interviewers remains a submission step. Sampled live Gemini checks are recorded in reports/FINAL_AI_CHECKS.json; they do not guarantee future availability or correctness.

## Verification

```sh
npm run build
npm test
npm run validate
```

Tests cover EOD boundaries, baseline exclusion, insufficient data, timestamp zones, ticker validation, priority classification, document discovery, retrieval attribution and API contracts.

## Build history and reuse

See `ATTRIBUTION.md`, `BUILD_HISTORY.md` and `LOCAL_STATUS.md`. This standalone repository started with only the original `finn/` application, copied without upstream Git history, and includes subsequent local improvements. It follows review of Sector Intelligence Monitor and Nifty Market Breadth Intelligence, reusing architectural ideas (source adapters, page-level chunks, explicit data-integrity states) with a Worker implementation. Both original repositories remain untouched.

The actual coding-agent conversation export/share link must be included with the submission. `BUILD_HISTORY.md` is a decision log, not a substitute or a fabricated transcript.

## Automatic portfolio refresh

The open app checks sources on startup and every 15 minutes while visible and online. Returning to the tab or reconnecting triggers a check if due. Requests do not overlap; existing rows remain visible on failure.

For unattended local checks while the app tab is closed, keep the FINN server running and run `npm.cmd run monitor:portfolio` from this folder. This process refreshes all 18 registered companies every 15 minutes, validates complete live feeds before replacing the fallback snapshot, and rebuilds the Worker. Stop with Ctrl+C. It does not survive computer shutdown and is not an OS-installed task. `npm.cmd run refresh:portfolio` runs once. Current outcomes are in reports/PORTFOLIO_FRESHNESS.json. Failed or partial refreshes retain the snapshot.

## Filing contents

From a brief item, choose Inspect filing → Read & analyse filing. FINN reads the actual indexed PDF and shows page-attributed passages, or validated AI claims when a configured provider responds correctly. Category cues remain rules. Accepted factual AI summaries also appear in the brief during the current browser session. Parsing limits, selected-evidence coverage and provider failures remain visible; see reports/FILING_ANALYSIS.md.

## Local desktop alert delivery

Alerts contains an opt-in Windows desktop-delivery checkbox and Save desktop delivery settings action. The monitor must run with the local FINN server. The first scheduled check establishes a baseline without replaying historical alerts; subsequent new price/volume crossings and selected non-routine filings are grouped into a Windows notification every 15-minute check. Saved rules and watchlist changes sync while the local control is connected. Delivery is off by default. Windows notification settings may suppress display. This is local Windows delivery, not mobile web push, email, instant alerts, or a shutdown-resilient service.

## Reviewed guidance comparison

Research → Explore guidance vs delivery opens a reviewed Infosys example without calling an AI provider. It links the annual guidance/result and four quarters of outlook history to source pages, with explicit comparison-basis safeguards. This curated case is separate from the generic research engine. Current validation and remaining submission actions are in reports/FINAL_READINESS.md.

The default 18-company portfolio is a demonstration watchlist selected for the challenge, not the user’s actual investments. The brief and Portfolio screen label this explicitly.

## Render deployment

See [DEPLOYMENT.md](DEPLOYMENT.md). Build with `npm ci --include=dev && npm run build`; run with `npm start`. The production server uses Render's `PORT`, binds to `0.0.0.0`, exposes `/healthz`, and never exposes local Windows delivery controls. `render.yaml` defines a free web service with automatic deploys disabled. Gemini credentials must be entered as Render secrets, not committed.

Current requirements mapping, tested scope and outstanding submission deliverables are in [reports/DELIVERABLE_AUDIT.md](reports/DELIVERABLE_AUDIT.md). Earlier status/handoff notes are historical; use the audit for current readiness.

## Durable daily updates

The approved [daily workflow](.github/workflows/daily-refresh.yml) runs at 22:47 IST, with manual dispatch available. It validates all 18 live feeds before committing a new snapshot, then deploys through a service-specific GitHub secret and verifies the exact public revision. No Gemini key is stored in GitHub. The first end-to-end run passed, including all 79 tests. Failed validation retains the previous deployed snapshot. Scheduling may be delayed, free Render instances can sleep, and external data/model services can fail; no indefinite uptime guarantee is implied. See [long-term operations and test evidence](reports/LONG_TERM_OPERATIONS.md).
