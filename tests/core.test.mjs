import test from 'node:test';
import assert from 'node:assert/strict';
import {normaliseTicker,classify,timestamp,summariseBars,makeAlerts,retrieve,quarterKey,discoverDocuments,safeSourceURL} from '../worker/core.js';

test('NSE symbols accept ampersands and reject URL/path injection',()=>{
  assert.equal(normaliseTicker(' m&m.NS '),'M&M');
  for(const input of ['../INFY','https://a.com','', '<script>'])assert.throws(()=>normaliseTicker(input));
});
test('priority recognises substantive events before routine announcements',()=>{
  assert.equal(classify({headline:'CFO resignation'}).priority,'high');
  assert.equal(classify({headline:'Quarterly financial results and dividend'}).category,'results');
  assert.equal(classify({headline:'Compliance certificate'}).priority,'routine');
  assert.equal(classify({headline:'Newspaper publication of financial results'}).priority,'routine');
});
test('exchange timestamps without zone are interpreted as India time',()=>{
  assert.equal(timestamp('2026-10-30 18:00:00'),Date.parse('2026-10-30T12:30:00Z'));
  assert.equal(timestamp('not-a-date'),null);
});
test('volume baseline excludes the alert session; incomplete daily bars excluded',()=>{
  const bars=Array.from({length:21},(_,i)=>({date:'2026-10-'+String(i+1).padStart(2,'0'),close:100+i,volume:i===20?300:100}));
  const summary=summariseBars(bars,new Date('2026-10-21T12:00:00Z'));
  assert.equal(summary.volumeRatio,3);
  assert.equal(summary.avgVolume,100);
  assert.equal(summary.baselineDays,20);
  const during=summariseBars(bars,new Date('2026-10-21T07:00:00Z'));
  assert.equal(during.date,'2026-10-20');
  assert.equal(summariseBars([]),null);
});
test('missing and inadequate volume histories do not generate volume alerts',()=>{
  const s=summariseBars([{date:'2026-10-01',close:100,volume:100},{date:'2026-10-02',close:110,volume:999}],new Date('2026-10-30'));
  assert.equal(s.volumeRatio,null);
  assert.equal(makeAlerts({A:{summary:s}},{priceThreshold:4,volumeThreshold:2}).length,1);
});
test('fiscal quarter ordering crosses year boundaries correctly',()=>{
  assert.ok(quarterKey('Q4FY25')<quarterKey('Q1FY26'));
});
test('retrieval preserves source/page attribution and handles absent evidence',()=>{
  const docs=[{id:'doc1',label:'Annual report',url:'https://example.com/a.pdf',type:'annual_report',pages:[{page:27,text:'Cash flow from operations improved. '.repeat(12)}]}];
  const evidence=retrieve(docs,'cash conversion','cash');
  assert.ok(evidence.length>0);
  assert.equal(evidence[0].page,27);
  assert.equal(evidence[0].documentId,'doc1');
  assert.deepEqual(retrieve([],'cash','cash'),[]);
});

test('business overview prioritises an annual-report description over incidental call mentions',()=>{
  const documents=[
    {id:'call',type:'transcript',pages:[{page:10,text:'Our digital services clients discussed consulting and our business opportunities in cyber security. '.repeat(4)}]},
    {id:'annual',type:'annual_report',pages:[{page:75,text:'Business overview. We are a leading provider of technology consulting and digital services to enterprise clients. '.repeat(4)}]},
  ];
  const evidence=retrieve(documents,'','business');
  assert.equal(evidence[0].documentId,'annual');assert.equal(evidence[0].page,75);
});
test('discovery uses raw transcript links and never third-party AI summaries',()=>{
  const html='<h3>Annual reports</h3><ul><li><a href="https://company.com/ar.pdf">Annual Report 2026</a></li></ul><li><div>Oct 2026</div><a href="https://company.com/call.pdf" title="Raw Transcript">Transcript</a><button data-url="/summary/1">AI Summary</button></li>';
  const docs=discoverDocuments(html,'INFY');
  assert.equal(docs.length,2);assert.equal(docs[1].url,'https://company.com/call.pdf');
});
test('source URL validation rejects local network and credentials',()=>{
  for(const u of ['http://example.com/a','https://127.0.0.1/a','https://localhost/a','https://user:secret@example.com/a'])assert.throws(()=>safeSourceURL(u));
});
