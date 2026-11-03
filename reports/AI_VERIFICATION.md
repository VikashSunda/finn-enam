# AI verification and support controls

Baseline sweep started 2026-11-03T09:15:13.842Z (UTC). This report distinguishes provider availability, deterministic validation and semantic review.

## Live baseline sweep

| Case | Company | Result |
| --- | --- | --- |
| infy-caveat | INFY | Gemini 503; labelled source-excerpt fallback |
| infy-periods | INFY | Gemini 503; labelled source-excerpt fallback |
| tcs-guidance | TCS | Gemini 503; labelled source-excerpt fallback |
| hdfc-sector | HDFCBANK | Gemini 503; labelled source-excerpt fallback |
| coforge-primary | COFORGE | Gemini 503; labelled source-excerpt fallback |
| infy-missing | INFY | Gemini 503; labelled source-excerpt fallback |
| infy-injection | INFY | Gemini 503; labelled source-excerpt fallback |

All seven baseline attempts returned Gemini HTTP 503, so none is counted as a successful AI-answer content check. Empty claim lists do not pass citation verification. Raw requests, answers and retrieved evidence are retained locally under ignored `.cache/ai-audit/`.

## Earlier successful manual samples

See SOURCE_AUDIT.md for the observed INFY pricing-caveat and quarter-separated cash answers. Publisher text at the cited pages supported those sampled statements. The unsupported future-profit test found overbroad commentary, which was subsequently constrained. These samples predate the new support-quote schema.

## Implemented hardening

- Every fact/inference needs a copied supporting quote for each cited source. Quotes must match the retrieved passage after conservative typography/whitespace normalisation.
- Numeric literals in a fact/inference must occur in its cited evidence or source label. Newly calculated values are rejected rather than silently accepted.
- Unknown source IDs, missing support, invented quotations, unsupported numbers and invalid output reject the entire synthesis; the UI retains attributed excerpts.
- Limitation claim bodies and notes use fixed, scoped wording; arbitrary model text cannot bypass support validation by labelling itself a limitation.
- The UI offers expandable matched source quotations alongside existing page/source actions.

The expandable quote UI was not observed with a successful live answer in the final browser pass: Gemini returned 503 and the source-excerpt fallback rendered. Its browser verification remains pending. The same pass found low-contrast dark-mode research buttons; their background and text colours were corrected.

## What these checks do not prove

Matching quotes and numeric presence do not establish entailment, correct metric/unit/period association, completeness, independence, causality, or inference quality. A number may appear in the wrong context. A real quote can be misinterpreted. Claims are not labelled universally or independently fact-checked.

## Acceptance and remaining validation

The new schema is covered by deterministic unit/API tests, including acceptance of valid support and rejection of invented quotes/numbers. The live follow-up below records a separate successful schema probe and its sampled review; the baseline provider failures are not counted as successful content checks. No claim that all future answers are supported is made.

## Structured-output live follow-up

The Gemini request now supplies a required JSON Schema including support arrays, following https://ai.google.dev/gemini-api/docs/generate-content/structured-output. A live INFY cash-flow probe passed it: one $955 million Q1 FY27 claim, a matching copied quotation, and source PDF page 31. Manual review of the retrieved passage and the earlier publisher-text audit supports this single sampled fact. This establishes schema compatibility for that response, not all future responses.

A subsequent seven-case sweep returned six HTTP 503 fallbacks and one future-profit limitation. The latter overgeneralised beyond the retrieved documents in its claim body. After that observation, the server was changed to discard all model-written limitation bodies and use a fixed scoped message, with a regression test. The final live limitation retry returned HTTP 503; its final wording is covered by automated tests, not a successful final live retest.

All 32 automated tests, build and artifact validation passed. Broader live content review remains incomplete because of provider availability. See ai-verification-hardened.json for dated follow-up metadata.
