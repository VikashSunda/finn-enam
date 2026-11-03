import test from 'node:test';
import assert from 'node:assert/strict';
test('ownership retrieval excludes ordinary business passages',()=>{const docs=[{id:'r',pages:[{page:1,text:'Our business serves customers through digital services and products across many segments. Revenue and earnings grew during this financial year.'},{page:2,text:'The ultimate parent company is Example Holdings Limited. This ownership disclosure describes the controlling shareholder and shareholding structure of this company.'}]}];assert.deepEqual(retrieve(docs,'which is the parent company?','ownership').map(e=>e.page),[2]);assert.equal(retrieve([{id:'r',pages:[docs[0].pages[0]]}],'parent company','ownership').length,0);});
import {normaliseTicker,classify,timestamp,summariseBars,makeAlerts,retrieve,quarterKey,discoverDocuments,safeSourceURL,researchIsCurrent} from '../worker/core.js';
test('growth retrieval excludes a generic business introduction when performance evidence exists',()=>{const docs=[{id:'report',type:'annual_report',label:'Report',url:'https://example.com/report.pdf',pages:[{page:1,text:'Our business overview describes our products and services, customers, segments and global clients. The company operates in retail and energy markets.'},{page:2,text:'Revenue growth for FY2026 was 8% year on year. EBITDA increased 10% in the reported financial year. The annual results show growth across retail and consumer segments.'}]}];const found=retrieve(docs,'TELL ME ABOUT GROWTH OF RELIANCE','financials');assert.equal(found[0].page,2);assert.ok(!found.some(e=>e.page===1));});
test('research snapshots expire after seven days and invalid/future dates never qualify as fresh',()=>{const now=Date.parse('2026-11-10T12:00:00Z');assert.equal(researchIsCurrent({fetchedAt:'2026-11-04T12:00:00Z'},now),true);for(const fetchedAt of ['2026-11-03T12:00:00Z','2026-11-11T12:00:00Z','invalid',undefined])assert.equal(researchIsCurrent({fetchedAt},now),false);});
test('leadership retrieval prioritises primary professional background over pay-table mentions',()=>{const documents=[{id:'annual',type:'annual_report',label:'Company annual report',url:'https://example.com/report.pdf',pages:[{page:10,text:'Director profile. The appointed chief executive has professional experience in enterprise software and previously led international operations. Qualifications include a degree in engineering.'},{page:11,text:'Director attendance and remuneration. The chief executive sitting fees and shareholding pattern appear in this disclosure. This table reports attendance at leadership meetings.'}]}];const found=retrieve(documents,'','management');assert.equal(found[0].page,10);assert.match(found[0].text,/professional experience/);assert.equal(found[0].url,documents[0].url);});

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

test('short transcript pages retain the management qualification after a chunk boundary',()=>{
  const text='Analyst: Does outcome pricing change our business? '+ 'Context without additional query terms. '.repeat(48)+' Management: Interest increased, but adoption is not a large part of activity.';
  assert.ok(text.length>1700&&text.length<3200);
  const evidence=retrieve([{id:'call',type:'transcript',pages:[{page:14,text}]}],'outcome pricing','business');
  assert.ok(evidence.length);assert.equal(evidence[0].page,14);
  assert.match(evidence[0].text,/not a large part of activity/);
});
test('discovery uses raw transcript links and never third-party AI summaries',()=>{
  const html='<h3>Annual reports</h3><ul><li><a href="https://company.com/ar.pdf">Annual Report 2026</a></li></ul><li><div>Oct 2026</div><a href="https://company.com/call.pdf" title="Raw Transcript">Transcript</a><button data-url="/summary/1">AI Summary</button></li>';
  const docs=discoverDocuments(html,'INFY');
  assert.equal(docs.length,2);assert.equal(docs[1].url,'https://company.com/call.pdf');
});
test('source URL validation rejects local network and credentials',()=>{
  for(const u of ['http://example.com/a','https://127.0.0.1/a','https://localhost/a','https://user:secret@example.com/a'])assert.throws(()=>safeSourceURL(u));
});
