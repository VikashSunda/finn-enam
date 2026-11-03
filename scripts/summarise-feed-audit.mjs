import {readFile,mkdir,writeFile} from 'node:fs/promises';
const audit=JSON.parse(await readFile('.cache/reliability/audit.json','utf8'));
const snapshot=JSON.parse(await readFile('data/snapshot.json','utf8'));
await mkdir('reports',{recursive:true});
await writeFile('reports/reliability-latest.json',JSON.stringify(audit,null,2));
const lines=[
  '# Portfolio and unfamiliar-company reliability audit',
  '', 'Audit started: '+audit.checkedAt+' (UTC). This is a dated local check, not a live counter.',
  '', 'All 18 registered price and filing feeds returned live-mode data without reported source errors. Every price summary used 20 previous sessions and had 30 available completed sessions. Latest price session: 2 November 2026. Intraday prices are not claimed.',
  '', 'Validated replacement snapshot: '+snapshot.generatedAt+'. '+Object.values(snapshot.filings).reduce((n,f)=>n+f.items.length,0)+' indexed filings. The previous snapshot remains in Git history and `.cache/reliability/snapshot-before-refresh.json`. Historical price coverage in this replacement is 30 completed sessions per company.',
  '', 'Fresh fetches do not prove complete exchange coverage, a source calendar, or factual correctness of every filing. Timestamps on each feed are retained separately from session dates.',
  '', '| Company | Latest price session | Prior baseline sessions | Indexed filings | Price / filing state |',
  '| --- | --- | ---: | ---: | --- |',
  ...audit.feeds.map(r=>'| '+[r.ticker,r.session,r.baselineDays,r.filingCount,r.priceMode+' / '+r.filingMode].join(' | ')+' |'),
  '', '## Research outside the preloaded corpus',
  '', 'These tests used the keyless local Worker to verify discovery, PDF parsing and attribution independently of model availability. No company below was added to the preloaded corpus.',
  '', '| Symbol | HTTP | Evidence passages | Coverage and limits |',
  '| --- | ---: | ---: | --- |',
  ...audit.research.map(r=>'| '+[r.ticker,r.status||'error',r.evidenceCount||0,r.status===200?r.documents.map(d=>d.label+': '+d.status+(d.pages?' ('+d.pages+' text-bearing pages)':'')+(d.error?' — '+d.error:'')).join('; '):r.error].join(' | ')+' |'),
  '', 'All returned evidence for successful unfamiliar-company requests had a positive PDF page and a document ID/URL matching the response document list. This is attribution integrity, not manual factual verification of every passage.',
  '', 'AXISBANK and COFORGE returned annual-report evidence; link-only transcript notices were excluded. ASIANPAINT returned transcript evidence; its annual report exceeded the 14 MB parsing limit. Original links and explicit failure reasons remain available.',
  '', 'The synthetic invalid symbol returned a controlled error and no invented evidence. The UI/API message was subsequently improved to distinguish a missing discovery page from proof that a ticker does not exist.',
  '', '## Safeguards and remaining work',
  '', '- The snapshot promotion script validates exact company coverage, source modes, baseline/history lengths, unique sorted sessions, finite positive closes, nonnegative volumes, valid nonfuture filing timestamps and source URLs before writing. Empty filing responses require manual review.',
  '- Research source cards now explicitly describe link-only notices and parser/download failures.',
  '- Hosted-network behaviour and reviewer access remain separate checks. These local results do not prove the deployed site has been updated.',
  '- A separate keyed COFORGE request returned ten passages and correct source statuses, but Gemini returned HTTP 503 high demand and the app disclosed extractive fallback. Successful unfamiliar-company synthesis is not claimed.',
  '- Added and passed regressions for missing discovery pages and empty fresh price responses; empty prices retain a usable prior snapshot with a stale label. Final build, all 24 tests and artifact validation passed.',
  '- Manual content-support checks for these unfamiliar-company passages remain separate from these ingestion checks.',
];
await writeFile('reports/RELIABILITY.md',lines.join('\n')+'\n');
console.log('Wrote dated audit summary to reports/RELIABILITY.md');
