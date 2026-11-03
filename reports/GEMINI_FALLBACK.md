# Gemini model fallback verification

Tested 2026-11-03T10:04:10.233Z (UTC).

Configured chain: gemini-3.1-flash-lite → gemini-3.5-flash-lite → gemini-3.8-flash.

| Model | Live result |
| --- | --- |
| gemini-3.1-flash-lite | 503 |
| gemini-3.5-flash-lite | timeout |
| gemini-3.8-flash | 503 |

The live chain attempted all three models, then retained attributed source excerpts. No successful synthesis from the new backups is claimed. Google capacity remains outside FINN’s control. Earlier 2.5 candidates returned HTTP 404 (not available to this account) and were removed from defaults.

39 automated tests, build, artifact validation and browser script syntax checks passed. Tests cover fallback success, stop on quota/auth/bad request, bounded attempts, native timeout exceptions and rejection of invalid fallback citations. The UI names the actual responder when synthesis succeeds; this display path has not yet been observed with a successful live backup response.

Defaults have free-tier text entries in Google pricing: https://ai.google.dev/gemini-api/docs/pricing. Eligibility and quotas remain project-specific; no billing or tier changes were made. HTTP 503 is documented as provider unavailability: https://ai.google.dev/gemini-api/docs/troubleshooting.
