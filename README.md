# FINN — Investor Intelligence

A mobile-first portfolio brief and primary-source company research prototype for the ENAM AI Engineer Build Challenge.

**Current state:** Working EOD monitoring, a prioritised exchange-filing digest, configurable browser-local rules, and primary-document search with PDF page attribution. AI synthesis is implemented but requires a server-side Gemini or OpenAI API key. Without a key, the app explicitly shows source excerpts and never pretends those are model-generated analysis.

## Run

Node 24 or newer:

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

## Product

- **Daily brief:** 24-hour default, 7-day and 30-day windows; important categories first; routine filings expandable; direct exchange links.
- **Portfolio:** 18 diversified mock holdings, add/remove NSE symbols, daily close, percentage move, previous-session volume comparison and recent price history.
- **Alerts:** Configurable absolute price and relative-volume thresholds plus announcement-category preferences. Checked on refresh, not background phone notifications. Preferences remain in the browser.
- **Research:** Four preloaded companies (INFY, TCS, RELIANCE, HDFCBANK); generic NSE ticker discovery and PDF extraction where accessible. Business, financials, cash quality, balance sheet, guidance and risk evidence search. Questions use the same primary corpus.
- **Evidence:** Document links and PDF page numbers; facts/inferences separated in optional AI outputs. Unknown citation IDs are rejected.
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
- No brokerage integration, real holdings, real-time prices, background push service, or unattended daily ingestion.
- Online parsing is capped at 14 MB per document. Scanned/image PDFs may require OCR, which is not implemented.
- Financial websites can block hosted requests even if local requests work. Missing annual reports and blocked transcripts are visible.
- Research citations validate source identity, not whether every model inference is correct. Human review remains necessary.
- A full four-quarter **guidance versus actuals** scorecard is deliberately not implemented. Guidance excerpts are labelled as management statements, not demonstrated delivery. This requires verified period/metric/currency/reporting-basis alignment.
- No automatic Revenue/EBITDA/PBT/PAT table is claimed. These metrics require verified filing extraction; EBITDA should not be fabricated where unreported or unsuitable for a sector.
- Public sharing for interviewers and a live LLM-provider check remain submission steps.

## Verification

```sh
npm run build
npm test
npm run validate
```

Tests cover EOD boundaries, baseline exclusion, insufficient data, timestamp zones, ticker validation, priority classification, document discovery, retrieval attribution and API contracts.

## Build history and reuse

See `ATTRIBUTION.md`, `BUILD_HISTORY.md` and `LOCAL_STATUS.md`. This standalone repository contains only the original `finn/` application, copied without upstream Git history. It follows review of Sector Intelligence Monitor and Nifty Market Breadth Intelligence, reusing architectural ideas (source adapters, page-level chunks, explicit data-integrity states) with a Worker implementation. Both original repositories remain untouched. No GitHub remote or push is configured.

The actual coding-agent conversation export/share link must be included with the submission. `BUILD_HISTORY.md` is a decision log, not a substitute or a fabricated transcript.
