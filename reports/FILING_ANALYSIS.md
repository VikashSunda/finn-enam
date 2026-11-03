# Filing-content analysis

Implemented on-demand in Daily brief → Inspect filing → Read & analyse filing. The server resolves the selected indexed filing, downloads its actual PDF, retrieves attributed passages, and optionally synthesises event/terms/conditions using existing Gemini routing and quote/number validation. Client-supplied arbitrary URLs are not accepted. Category cues remain explicitly rule-based. Validated factual summaries appear on brief cards after analysis in the current browser session.

Live extraction passed for ITC merger (4 readable pages) and quarterly results (20 readable pages). The desktop drawer displayed actual merger passages with original PDF page links. One live Gemini attempt failed the copied-quote check and was rejected; the UI retains attributed passages. A successful live filing synthesis has not been established. Mocked acceptance/rejection, blocked PDFs, unknown IDs and real PDF parsing are covered by tests. All 46 tests, build and artifact validation pass.

Parsing retains the existing 14MB and text-PDF limits; no OCR or complete automated results table is claimed. Evidence is selected, not guaranteed exhaustive. Analysis is opt-in to avoid bulk model calls. Mobile filing rendering reuses the existing drawer/sheet layout, but this new content flow has only been exercised in the desktop browser this pass.

Additional user-requested lighting correction: ambient body gradients are viewport-fixed and the summary-attached decorative glow is removed. Browser computed style confirmed fixed attachment and no horizontal overflow after scrolling. No push or deployment.
