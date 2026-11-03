# Covering email draft — final links still required

To: assessment@enam.com
Subject: ENAM - IIT screening - 2027

Hello ENAM team,

I built FINN, a mobile-first investor intelligence prototype with two linked workflows: a prioritised portfolio brief and primary-source company research.

The brief monitors a diversified 18-company mock portfolio using completed daily prices, volume baselines and exchange filings. Users choose their digest window and alert rules, inspect original disclosures, and request analysis of the actual filing PDF. Research retrieves annual reports and earnings-call transcripts for demo and unfamiliar NSE tickers, with source-page evidence and clear coverage limits. Reviewed Infosys examples provide annual financial comparisons and aligned guidance versus delivery, alongside four quarters of outlook history.

I used a small HTML/CSS/JavaScript frontend and one bundled Worker, source adapters, bounded caching and inexpensive Gemini model fallback. Source IDs, supporting quotations and numeric presence are checked before accepting AI claims. Provider or document failures fall back to attributed excerpts. A local monitor supports opt-in Windows notifications with baseline and duplicate suppression.

I prioritised a working investor workflow and honest evidence states over broad unverified financial extraction. Deliberate omissions include OCR, mobile push, brokerage integration and fully automated cross-company financial/guidance scorecards. Generic research remains available beyond the curated guidance example. Earlier projects informed architectural ideas and are attributed in the repository.

Validation includes 79 passing tests, live hosted checks of all 18 portfolio feeds, desktop/mobile walkthroughs, interactive charts, sampled Gemini/source checks and user-confirmed local Windows notifications. A daily GitHub job validates and commits snapshots, redeploys Render and verifies the live commit; its full manual run passed. Hosted testing confirmed real Gemini fallback after 503, forced document rediscovery and refusal to invent unsupported bank EBITDA. These are prototype checks, not a claim that every future answer is correct. Free hosting can take time to wake and schedules may be delayed.

Next I would strengthen source coverage and evaluated structured financial extraction, and add durable per-user hosted alert delivery.

Prototype: https://finn-enam-yid1.onrender.com
GitHub repository: https://github.com/VikashSunda/finn-enam
Actual AI build conversation: [attach/export this Codex conversation; user confirms it is the only build session]
Earlier user-supplied conversation: https://chatgpt.com/share/6ae933fa-b760-83e8-bae7-3feb55f11340

Regards,
Vikash Sunda

---
Not sent. Test all links signed out before sending. The earlier share link has not been verified for completeness or access. Local desktop scheduling is not a hosted/mobile push service. The actual conversation history must accompany the submission; generated decision logs cannot replace it.
