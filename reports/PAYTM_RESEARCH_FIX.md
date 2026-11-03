# Conversational research correction — 3 November 2026

User-reported inputs: `hello` and `what payment does` while researching PAYTM.

## Reproduction

The public API loaded four PAYTM transcripts and Gemini responded, so this was not simply a server outage. The answer contained a valid core-business statement but also unrelated AI/monetisation commentary and a generic contradictory limitation. Greeting text was being processed as a financial evidence query. When AI validation failed, six raw passages could also look like an unrelated answer.

## Changes

- Recognise greetings and return deterministic guidance without fetching documents or spending model quota.
- Recognise short company-overview questions, including the reported wording, for any selected ticker. The UI shows the interpreted question rather than silently changing it.
- Route an explicit business overview to Business even if another topic was selected. Specific financial questions retain their wording and topic.
- Constrain company introductions to at most two short sourced claims in plain language; avoid unrelated initiatives and unnecessary jargon.
- Broaden business retrieval beyond IT-oriented terminology.
- Show an explicit unavailable-answer message when synthesis/validation fails. Retrieved passages remain available under a collapsed disclosure and are not presented as an answer.
- Citation, copied-quotation and numeric checks remain unchanged.

## Additional reported Reliance issue

The user also reported that `TELL ME ABOUT GROWTH OF RELIANCE` and `WHAT DOES REILANCE DO` looked the same. Growth now overrides the selected Business topic, retrieves performance evidence and receives a separate growth instruction. Overview remains a concise description. Regression tests ensure these intents and passages differ.

Live testing exposed a provider rejection of a large quote-enum schema; that enum was removed. Copyable exact-source quote choices remain in the prompt, and all original citation/quote/number checks remain enforced. Generic scope-only warnings no longer appear as contradictory primary claims next to a valid sourced answer; they remain in response metadata and a partial-coverage note.

A further guard rejects a calendar financial-period end inferred only from a filing/call date. Growth instructions distinguish source disclosure dates, reported/underlying growth and segment/group scope. These safeguards still do not prove all metric interpretations.

## Verified release

Same public URL: https://finn-enam-yid1.onrender.com/ . Actual live revision: `c51bdc7980a9594f7f5d28da9a4502c8f5e24a40`. The submitted URL did not change.

- 89 local tests pass; build, artifact validation and script syntax checks pass.
- Live PAYTM `hello`: HTTP 200, conversational guidance without a model request.
- Live PAYTM `what payment does`: HTTP 200, AI mode, two short supported business-model claims, no unrelated AI-initiative commentary or contradictory limitation.
- Live Reliance growth question: HTTP 200, growth intent, Financials topic, three performance-related claims with disclosure dates and source links.
- Live Reliance overview question: HTTP 200, overview intent, Business topic, two descriptive claims; different from the growth response. Reliance annual-report text is unavailable (403), so this answer uses the available transcripts and may overrepresent digital services. No complete group-business coverage is claimed.
- The local preview had no model key. Its UI now states that explicitly and links to the live app; greetings work even without a key. The screenshot's missing-key message was not evidence of a missing hosted key.
- Local browser checks confirmed the missing-key heading and greeting/question flow. No key was copied from Render into local files or Git.

Raw samples remain in ignored `.cache/paytm/`. They are sampled regression evidence, not proof of universal AI accuracy. The user's GitHub submission-draft edit was preserved when integrating releases.
