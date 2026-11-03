# INFY first-answer source audit

Checked 3 November 2026 against publisher-hosted PDFs through web PDF extraction.
This is a manual, sampled content review, not automatic entailment verification.
PDF positions below are one-based file pages; printed page labels can differ.
The original answer was observed in the prior local session and is not re-created
as a supposedly current provider response here.

## Publisher documents

- [Annual Report 2025–26](https://www.infosys.com/investors/reports-filings/annual-report/annual/documents/infosys-ar-26.pdf)
- [July 2026 transcript filing](https://nsearchives.nseindia.com/corporate/Infosys_28072026202438_SE_filing_Earnings_call_transcript.pdf)
- [October 2026 transcript filing](https://nsearchives.nseindia.com/corporate/Infosys_28102026173824_SE_filing_Earnings_call_transcript.pdf)

## Findings

| Prior claim theme | Source check | Judgment |
| --- | --- | --- |
| AI-first consulting/services business and strategy | Annual report PDF p.75 describes the business. Stored p.22 has service/strategy context. | Core business description supported; management framing should remain attributed. |
| Operating segments | Annual report PDF p.80 lists the consolidated segment categories. | Listed segments supported. This does not verify an automated financial table. |
| Addressable opportunity and AI revenue share | July PDF p.30 supports the Q1 FY27 share cited in the answer. The answer also cited October PDF p.18 for management's opportunity estimate. | Historical quarter needs explicit labelling; an opportunity estimate is management commentary, not independently measured market size. |
| Cautious spending and decision delays | July PDF p.32 provides sector-specific spending and decision-cycle context. | Broad theme supported; do not silently turn sector/period observations into universal current conditions. |
| Inferred shift toward outcome-based pricing | July PDF p.14 discusses increased interest but says activity is not yet large. The stored retrieval snippet cuts close to this qualification. | Prior inference is too strong without that caveat. Do not claim demonstrated adoption or a material business-model shift. |

The October filing also contains a newer quarter's AI revenue share. A previous
quarter's figure must not be presented as the latest company snapshot.

Page mapping spot checks matched the stored one-based citations: annual PDF
p.75 maps to extracted page index 74, p.80 to index 79; July p.30 to index 29,
and p.14 to index 13. The July filing cover identifies a 23 July call filed on
28 July. Filing date and event date are not interchangeable.

## Follow-up

- Added synthesis instructions preserving caveats/negations, explicit periods,
  attribution of estimates, and uncertainty when a passage is incomplete.
- Instructions are a mitigation, not proof of future model accuracy. Re-run live
  synthesis after restoring the session key and inspect the resulting claims.
- The October opportunity-estimate text was subsequently found at zero-based
  index 17 (PDF p.18), supporting attribution to management. Its estimate is not
  independent market-size verification. Full-page visual QA remains separate.
- Retrieval now retains the full page when its text is at most 3,200 characters,
  keeping short question/answer pages and their caveats together. Longer pages
  remain chunked. A regression covers a qualification after the old boundary.
- No corpus text, source dates or financial values were changed during this audit.
