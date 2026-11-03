import assert from 'node:assert/strict';
import {timestamp,summariseBars,safeSourceURL} from './core.js';

export function validateHostedSnapshot(raw,companies,now=Date.now()){
 const expected=new Set(companies.map(c=>c.ticker)),prices={},filings={};
 assert.ok(expected.size>0);assert.equal(raw?.rows?.length,expected.size,'Incomplete portfolio response');
 const recent=value=>{const time=timestamp(value);assert.ok(time!==null&&time<=now+300000&&now-time<=1800000,'Feed fetch time is missing, future or older than 30 minutes');};
 for(const row of raw.rows){
  assert.ok(expected.delete(row.ticker),'Unexpected or duplicated company');const p=row.price,f=row.filings;
  assert.equal(p?.mode,'live','Price source is not live');assert.ok(!p.error);assert.equal(f?.mode,'live','Filing source is not live');assert.ok(!f.error);
  recent(p.fetchedAt);recent(f.fetchedAt);safeSourceURL(p.source);safeSourceURL(f.source);
  const bars=p.summary?.history;assert.ok(Array.isArray(bars)&&bars.length>=21,'Insufficient completed price history');
  assert.equal(new Set(bars.map(b=>b.date)).size,bars.length,'Duplicate session');
  for(const [i,b]of bars.entries()){
   assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(b.date)&&Number.isFinite(Date.parse(b.date))&&new Date(b.date).toISOString().slice(0,10)===b.date,'Invalid session date');
   assert.ok(Number.isFinite(b.close)&&b.close>0&&Number.isFinite(b.volume)&&b.volume>=0,'Invalid market value');if(i)assert.ok(bars[i-1].date<b.date,'Unsorted sessions');
  }
  const summary=summariseBars(bars,new Date(now));assert.ok(summary&&summary.baselineDays>=20);
  assert.equal(summary.date,bars.at(-1).date,'An incomplete/future session was supplied');assert.equal(summary.date,p.summary.date);assert.equal(summary.close,p.summary.close);assert.equal(summary.volume,p.summary.volume);
  assert.ok(now-Date.parse(summary.date)<=7*86400_000,'Latest session is older than seven calendar days; review holidays/source coverage');
  assert.ok(Array.isArray(f.items));for(const item of f.items){assert.equal(item.ticker,row.ticker);assert.ok(item.id&&item.headline);safeSourceURL(item.url);const at=timestamp(item.date);assert.ok(at!==null&&at<=now+300000,'Invalid/future filing date');}
  prices[row.ticker]={ticker:row.ticker,bars,source:p.source,fetchedAt:p.fetchedAt};
  filings[row.ticker]={items:f.items.map(({id,ticker,headline,description,date,url})=>({id,ticker,headline,description,date,url})),source:f.source,fetchedAt:f.fetchedAt,coverage:f.coverage};
 }
 assert.equal(expected.size,0);assert.ok(Object.values(filings).some(f=>f.items.length),'All exchange feeds are empty; manual review required');
 return {generatedAt:new Date(now).toISOString(),collection:{method:'Validated hosted Worker source refresh',priceWindow:'30 available completed sessions per company',note:'Fetch times and trading-session dates differ. Exchange coverage may be incomplete.'},prices,filings};
}
