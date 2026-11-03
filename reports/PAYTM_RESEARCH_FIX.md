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

84 tests, build, artifact validation and browser-script syntax checks pass locally. Live and browser verification follow deployment; do not claim the reported issue fixed online until those checks complete.
