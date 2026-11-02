# FINN — Codex desktop handoff

Prepared 3 November 2026 (Asia/Kolkata). This is a continuation brief, not a verbatim chat export. Read this file, README.md and BUILD_HISTORY.md before continuing.

## Start here

- User is moving from ChatGPT Work to the newly installed Codex desktop app on a laptop.
- Goal: finish a credible, working FINN prototype for the ENAM Holdings AI Engineer assignment, then prepare submission materials.
- **User-confirmed deadline: 3 November 2026, 11:59 pm IST.** Earlier assistant statements saying 1 November were superseded by the user's correction.
- Repository: https://github.com/VikashSunda/sector-intelligence-monitor
- Working branch: `finn-enam-prototype`
- Application directory: `finn/`. The repository root is an older Python/Streamlit application; do not accidentally run or replace that project.
- Previously deployed demo: https://finn-investor-intelligence.chirpymarch.chatgpt.site
- Hosting project ID in `.openai/hosting.json`: `appgprj_6ae536141dc081919a736d0a0f60f61a`.
- Original deployed access was owner-private through ChatGPT sign-in. Current access and deployment health need checking.
- User authorized building, fixes, GitHub branch work, and useful plugin setup. No submission email has been sent. Do not send one without explicit authorization.
- User prefers action and brief, clear updates. Avoid repeated permission questions for routine authorized work.

## First actions in the new session

1. Inspect working-tree status and local AGENTS.md instructions. Fetch/check out the existing branch without discarding local changes.
2. Read this handoff and inspect the actual implementation. Run the existing build, tests and artifact validation; record current results.
3. Help configure a model key securely. No key has been supplied or verified in this conversation.
4. Test real model-backed research, citations, source failures and a ticker outside the preloaded corpus.
5. Fix material failures, verify phone usability, arrange reviewer access with the user, and finish submission materials.
6. Keep development decisions and actual AI conversation history for the assignment. This handoff does not replace the required conversation export.

## Assignment requirements and product decisions

The following brief comes from the prior conversation's reading of two PDFs:
- `1. ENAM_AI_Engineer_Build_Challenge_Main.pdf`
- `2. ENAM_AI_Engineer_Build_Challenge_Reference.pdf`

These PDFs were available in the old session under `upload/`, but are not in this GitHub branch. Do not assume that path exists on the laptop. If exact wording is needed, ask the user for the PDFs; do not claim this summary is the original document.

Build FINN, a mobile-first investor assistant for Indian listed companies:
- Push: “Tell me what matters” — prioritised portfolio announcements, digest and significant-change alerts.
- Pull: “Research this company” — analysis grounded in primary company reports and earnings-call transcripts.
- 15–20 mock portfolio companies across sectors/sizes.
- 3–5 demo research companies. Research must generalise to an unfamiliar NSE ticker, rather than display prewritten answers.
- Working EOD price/volume data, NSE/BSE announcements and filings, and annual-report/transcript ingestion.
- Suggested digest period defaults to 24 hours; configurable price/volume thresholds and routine filing suppression.
- Example enrichments include executive background and quarterly Revenue/EBITDA/PBT/PAT comparisons. Do not claim these are implemented.
- Research options include business/financial snapshot, growth and margins, debt, cash conversion, guidance, management narrative vs actuals, and bull/bear case.
- “Promised vs delivered” over four quarters was the recommended distinguishing feature, but **is not implemented yet**.
- Research claims must use annual reports/transcripts, not news, broker analysis, Screener financial tables or model memory. Screener may discover primary-document links.
- Prioritise thin-but-working, thoughtful workflow, efficient models/caching, sound architecture and concise mobile UI.

Agreed scope: a portfolio brief plus source-backed company research. Preserve truthful coverage and fallback labels.

Submission package:
1. Working prototype link that reviewers can open on a phone.
2. GitHub repository.
3. Actual AI build conversations via exports/share links.
4. Short covering email explaining what was built, choices, trade-offs, omissions and next steps.

Recipient previously extracted from the brief: `assessment@enam.com`.
Exact subject previously extracted: `ENAM - IIT screening - 2027`.
Confirm against original brief before sending. Prepare a draft; user has not authorized sending.

## Verified repository state at handoff

This session read the remote branch's README, BUILD_HISTORY, package.json, .env.example, build/dev/validation scripts and hosting configuration. The branch exists and contains the files below. It did not rerun the app or live providers during handoff preparation.

Application stack:
- Node 24+; plain HTML/CSS/JS frontend.
- A bundled server-side Worker; same Worker runs under local Node development server.
- `unpdf@1.6.2` for PDF extraction; `esbuild@0.25.12`.
- Offline Python/PyMuPDF snapshot collector.
- No D1 or R2 binding configured in the current hosting metadata.

Important paths relative to `finn/`:
| Path | Purpose |
| --- | --- |
| `web/index.html`, `web/styles.css`, `web/app.js` | Mobile UI |
| `worker/index.js` | Worker/API and integrations; inspect before changing |
| `worker/core.js` | Shared calculations and retrieval helpers |
| `data/companies.json` | Portfolio registry |
| `data/snapshot.json` | Real price and exchange-announcement snapshot |
| `data/research.json` | Primary-document text corpus with provenance |
| `scripts/collect.py` | Offline real-source collection |
| `scripts/dev.mjs` | Local HTTP server; builds Worker and passes process.env |
| `scripts/build.mjs` | Builds `dist/server/index.js`, copies hosting manifest |
| `scripts/validate-artifact.mjs` | Checks ESM artifact and default.fetch |
| `tests/core.test.mjs`, `tests/api.test.mjs` | Existing automated checks |
| `README.md`, `BUILD_HISTORY.md` | Product scope, limitations and decisions |
| `.env.example` | Variable names; contains no credentials |

README-described implementation:
- 18 mock holdings, add/remove NSE symbols, close/move/volume and recent history.
- 24-hour, 7-day and 30-day filing digest, importance heuristics, routine-category expansion, exchange links.
- Browser-local alert preferences; checks on refresh, not background mobile notifications.
- Preloaded research: **INFY, TCS, RELIANCE, HDFCBANK**.
- Generic ticker document discovery and extraction where sources allow access.
- Source URLs/PDF page references, missing-source disclosures, explicit source-excerpt mode without a key.
- Optional Gemini/OpenAI synthesis, citation-ID validation and separation of facts/inferences.
- Fresh/snapshot/stale/unavailable states, bounded isolate-local caches.
- EOD volume baseline excludes current day, needs at least 10 sessions; in-progress bars excluded before 15:40 IST.
- Online PDF limit 14 MB; OCR not implemented; caches are not durable.
- No verified automated Revenue/EBITDA/PBT/PAT extraction table.
- No verified four-quarter guidance-vs-actuals scorecard.

Historical checks reported by previous build session (not rerun in this handoff):
- 12 automated checks passed; build and artifact validation passed.
- Real snapshot covered 18 price feeds and 222 recent filings at the time of collection. These are historical counts, not guaranteed current/live coverage.
- Desktop and 390px layout inspected.
- Price threshold 4% → 3% changed alert count 2 → 3 in that snapshot.
- HAL outside preloaded corpus returned 10 attributed evidence passages through the bundled Worker locally; annual report was blocked and disclosed.
- Hosted uncached-ticker parsing and model-backed synthesis still need independent live verification.

## Run locally

If not already cloned, in the parent folder:

```sh
git clone --branch finn-enam-prototype https://github.com/VikashSunda/sector-intelligence-monitor.git
cd sector-intelligence-monitor/finn
npm ci
npm run build
npm test
npm run validate
npm run dev
```

If a checkout exists, inspect status first; do not clone over it or force reset it.
Open http://localhost:3000.
Local mobile QA iframe: http://localhost:3000/_qa/mobile.
The development server rebuilds before starting, but does not automatically load .env files.
Commands must run from `finn/`, not repository root.

Optional source refresh (network/source accessibility varies):

```sh
python -m pip install pymupdf
python scripts/collect.py --tickers INFY TCS RELIANCE HDFCBANK
npm run build
```

Do not replace a usable real snapshot with empty/partial data without reviewing collection output and diffs.

## API key setup — unfinished

- User has ChatGPT Plus and a Gemini Pro subscription, but did not know how to obtain an API key.
- No API key was pasted, created, configured or validated in the visible continuation.
- OpenAI Developers plugin was installed and its tools became available in ChatGPT Work. This does not mean an API key or billing has been configured, and plugin availability may differ in Codex desktop.
- The plugin is optional for FINN; earlier assistant suggestions overstated its necessity.
- ChatGPT subscription usage and API usage are separate. Do not assume either consumer subscription supplies app API credits.
- We suggested starting with Gemini API free-tier access, subject to account eligibility, available models and quotas.
- User was directed to https://aistudio.google.com/apikey and told to keep any key private. They have **not** confirmed “key ready.”
- Check current official provider documentation for model availability and pricing before live setup.

Variables as committed (defaults are configuration, not freshly verified model availability):
- `GEMINI_API_KEY`
- `GEMINI_MODEL=gemini-2.5-flash`
- `OPENAI_API_KEY`
- `OPENAI_MODEL=gpt-4.1-mini`
- Gemini takes precedence if both keys exist, according to README.

Use secure secret entry or an ignored local config with appropriate loading. Do not ask for plaintext keys in chat, put them in commands shown in transcripts, print environment values, commit them, or place them in browser code. For hosted use, configure runtime secrets; a laptop environment variable does not configure the deployed site. Verify via key presence and a bounded test, never by printing credentials. Follow any available provider-key skill when applicable.

## Priority completion checklist

### Must finish

- [ ] Run baseline checks in the new environment.
- [ ] Securely configure one provider and verify a small live request.
- [ ] Test actual research answers with source evidence; manually inspect several material claims and PDF pages.
- [ ] Test blocked/missing documents, no evidence and quota/provider failure. Preserve clear fallback labels.
- [ ] Verify unfamiliar NSE ticker through deployed parsing, not just local snapshot.
- [ ] Refresh/review snapshot timestamps and stale labels as appropriate.
- [ ] Verify deployed mobile flows and usable reviewer access.
- [ ] Commit final source and align demo deployment with GitHub revision.
- [ ] Prepare README/architecture, trade-offs, covering-email draft and exact links.
- [ ] Obtain actual build-history conversation export/share links. Do not fabricate transcripts or treat this handoff as the required export.

### If time permits after reliability

Implement a small, carefully sourced guidance-vs-actuals view for one well-covered company, only if period, metric, units, currency and consolidated/standalone basis can be aligned. Show unsupported comparisons as unavailable. This was a recommendation, not a delivered feature.

### Acceptance checks

A reviewer should be able to:
- Open on a phone, inspect portfolio and prioritised filings, adjust alert thresholds and follow original sources.
- Research a preloaded and unfamiliar ticker; understand which documents were found or blocked.
- Read AI answers with valid, relevant source/page references, or see a clear explanation when synthesis/evidence is unavailable.
- Distinguish management statements, measured outcomes and model inference.
- Reproduce the project from GitHub without secrets.

## Deployment continuity

The Sites-hosted project and GitHub branch are separate source/deployment systems. A GitHub push does not by itself prove the hosted demo updated. Inspect the hosting setup and use the existing project ID; do not create a duplicate site. If Sites tools are available, read their skill and current site/access state first. Codex desktop may not have the same tools or credentials. If unavailable, finish local work and commits, then use the original ChatGPT Work session to deploy.

Owner-private access is not reviewer access. User has not selected a new audience. Coordinate the concrete access choice before changing it. Never claim public access, deployment success, current prices or live AI validation without verification.

## Earlier repositories and reuse context

- https://github.com/chaudharypriyanshu606-max/nifty-market-breadth-intelligence
- https://github.com/VikashSunda/sector-intelligence-monitor

Prior review found Nifty mainly useful for dashboard/refresh ideas. The sector monitor had ingestion/page-chunking/LLM infrastructure but fixed companies, fintech-specific schema/prompts, missing metric provenance and quarter-ordering issues. FINN is a new Worker implementation using architectural ideas, not a direct running copy of the Python backend. Do not reintroduce the old generic synthesis fallback or its unproven metrics.

## Conversation continuity and honesty

This handoff summarises visible conversation plus repository files; it is not a complete verbatim archive. Earlier assistant messages sometimes described planned scope as though it were present. The verified README limitations above take priority over optimistic summaries. Verify code and deployment before reporting completion.

Latest user instruction: “app is installed, create complete handoff then will do later work there.” Pause further feature work after saving the handoff; the next implementation session is intended to be in Codex desktop.
