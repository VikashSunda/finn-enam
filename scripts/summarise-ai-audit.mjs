import {readFile,writeFile,mkdir} from 'node:fs/promises';
const run=JSON.parse(await readFile('.cache/ai-audit/summary.json','utf8'));
const report={...run,revision:run.revision||'a55b15c (baseline before quote-validation hardening)',cases:run.cases.map(c=>({...c,citationIdsResolve:c.mode==='ai'?c.citationIdsResolve:null,answerContentVerified:false,outcome:c.mode==='ai'?'requires_manual_review':c.note?.includes('503')?'provider_unavailable':'fallback_or_error'}))};
await mkdir('reports',{recursive:true});
await writeFile('reports/ai-verification-baseline.json',JSON.stringify(report,null,2));
const lines=[
'# AI verification and support controls','',
'Baseline sweep started '+run.startedAt+' (UTC). This report distinguishes provider availability, deterministic validation and semantic review.','',
'## Live baseline sweep','',
'| Case | Company | Result |','| --- | --- | --- |',
...report.cases.map(c=>'| '+[c.id,c.ticker,c.outcome==='provider_unavailable'?'Gemini 503; labelled source-excerpt fallback':c.outcome].join(' | ')+' |'),
'','All seven baseline attempts returned Gemini HTTP 503, so none is counted as a successful AI-answer content check. Empty claim lists do not pass citation verification. Raw requests, answers and retrieved evidence are retained locally under ignored `.cache/ai-audit/`.','',
'## Earlier successful manual samples','',
'See SOURCE_AUDIT.md for the observed INFY pricing-caveat and quarter-separated cash answers. Publisher text at the cited pages supported those sampled statements. The unsupported future-profit test found overbroad commentary, which was subsequently constrained. These samples predate the new support-quote schema.','',
'## Implemented hardening','',
'- Every fact/inference needs a copied supporting quote for each cited source. Quotes must match the retrieved passage after conservative typography/whitespace normalisation.','- Numeric literals in a fact/inference must occur in its cited evidence or source label. Newly calculated values are rejected rather than silently accepted.','- Unknown source IDs, missing support, invented quotations, unsupported numbers and invalid output reject the entire synthesis; the UI retains attributed excerpts.','- Limitation claim bodies and notes use fixed, scoped wording; arbitrary model text cannot bypass support validation by labelling itself a limitation.','- The UI offers expandable matched source quotations alongside existing page/source actions.','',
'The expandable quote UI was not observed with a successful live answer in the final browser pass: Gemini returned 503 and the source-excerpt fallback rendered. Its browser verification remains pending. The same pass found low-contrast dark-mode research buttons; their background and text colours were corrected.','',
'## What these checks do not prove','',
'Matching quotes and numeric presence do not establish entailment, correct metric/unit/period association, completeness, independence, causality, or inference quality. A number may appear in the wrong context. A real quote can be misinterpreted. Claims are not labelled universally or independently fact-checked.','',
'## Acceptance and remaining validation','',
'The new schema is covered by deterministic unit/API tests, including acceptance of valid support and rejection of invented quotes/numbers. The live follow-up below records a separate successful schema probe and its sampled review; the baseline provider failures are not counted as successful content checks. No claim that all future answers are supported is made.','',
];
await writeFile('reports/AI_VERIFICATION.md',lines.join('\n'));
console.log('Wrote reports/AI_VERIFICATION.md and dated baseline results');

const hardened=JSON.parse(await readFile('.cache/ai-audit-hardened/summary.json','utf8'));
const probe=JSON.parse(await readFile('.cache/ai-audit/schema-probe.json','utf8'));
const final=JSON.parse(await readFile('.cache/ai-audit/limitation-final.json','utf8'));
const evidence={schemaProbe:{testedAt:probe.testedAt,request:probe.request,analysis:probe.response.analysis,manualReview:'The single $955 million cash-flow fact and copied quotation match the retrieved July transcript, PDF page 31. Quarter association agrees with the earlier publisher-text audit in SOURCE_AUDIT.md. This is one sampled content review.'},hardenedSweep:{startedAt:hardened.startedAt,baseRevision:hardened.revision,workingTreeChanges:true,results:hardened.cases.map(c=>({id:c.id,mode:c.mode,note:c.note,validation:c.validation})),finding:'Six provider HTTP 503 fallbacks; one limitation answer exposed overbroad claim-body wording. Fixed after the sweep by discarding model-written limitation text.'},finalLimitationProbe:{testedAt:final.testedAt,mode:final.response.analysis.mode,note:final.response.analysis.note},automatedChecks:'32 tests passed, including limitation-label bypass regression; build and artifact validation passed.'};
await writeFile('reports/ai-verification-hardened.json',JSON.stringify(evidence,null,2));
const appendix=['','## Structured-output live follow-up','','The Gemini request now supplies a required JSON Schema including support arrays, following https://ai.google.dev/gemini-api/docs/generate-content/structured-output. A live INFY cash-flow probe passed it: one $955 million Q1 FY27 claim, a matching copied quotation, and source PDF page 31. Manual review of the retrieved passage and the earlier publisher-text audit supports this single sampled fact. This establishes schema compatibility for that response, not all future responses.','','A subsequent seven-case sweep returned six HTTP 503 fallbacks and one future-profit limitation. The latter overgeneralised beyond the retrieved documents in its claim body. After that observation, the server was changed to discard all model-written limitation bodies and use a fixed scoped message, with a regression test. The final live limitation retry returned HTTP 503; its final wording is covered by automated tests, not a successful final live retest.','','All 32 automated tests, build and artifact validation passed. Broader live content review remains incomplete because of provider availability. See ai-verification-hardened.json for dated follow-up metadata.',''];
await writeFile('reports/AI_VERIFICATION.md',lines.join('\n')+appendix.join('\n'));
