# Build decision log

This is a concise development record, not the full AI conversation history.

1. Read both ENAM assignment PDFs and separated required data integrations from suggested product features.
2. Reviewed both supplied repositories. The sector monitor has reusable pipeline ideas but fixed company lists, fintech-specific extraction/prompting, missing metric-to-document links in its supplied database, and lexical quarter sorting. The Nifty project addresses market breadth, not portfolio fundamentals.
3. Confirmed the connected GitHub account owns the sector monitor. Chose a separate `finn-enam-prototype` branch and `finn/` folder to preserve the original application.
4. Selected a focused product: portfolio brief plus primary-source research; responsive web for phone access.
5. Used real public sources. BSE blocked several downloads; NSE announcements and archive links provided a working alternate path. No mock financial facts were substituted.
6. Built a reproducible Python snapshot collector with page-level text extraction, original URLs and SHA-256 provenance. Imported annual reports/transcripts only, never Screener summaries or news.
7. Detected that several purported Maruti transcript PDFs were one-page notices pointing to the company website. Excluded those notices from research evidence and selected HDFC Bank as the fourth preloaded research company.
8. Implemented a small server-side Worker, mobile interface, EOD rules, topic/question retrieval and optional Gemini/OpenAI synthesis. Explicit extractive mode works without a model key.
9. Added tests for financial-data edge cases and evidence attribution. Build/validation and browser review results are recorded with the delivery, rather than claiming unperformed checks.
10. Verified desktop and 390-pixel iframe viewport layouts in Chrome. Changed a price threshold from 4% to 3% and observed the alert count change from 2 to 3. Confirmed primary-source research navigation and source/page references.
11. Tested HAL through the same bundled Worker API without a preloaded HAL corpus: live discovery and PDF extraction returned 10 attributed evidence passages; the blocked annual report was correctly reported as unavailable. Hosted-source access can still differ and requires a separate check after deployment.

## Intentionally unfinished before final submission

- Configure and verify a model API key through a secure server-side path.
- Verify an uncached NSE ticker through the hosted parsing path.
- Decide how to share the demo with ENAM; the initial hosted build is owner-private.
- Export/share the actual ChatGPT build conversation. Do not submit this decision log as if it were the full conversation.
- Write the covering email only after final validation and scope are settled.

No submission email has been sent.
