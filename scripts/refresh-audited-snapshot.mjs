import {readFile,writeFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {timestamp} from '../worker/core.js';
const root='.cache/reliability';
const raw=JSON.parse(await readFile(root+'/portfolio-response.json','utf8'));
const companies=JSON.parse(await readFile('data/companies.json','utf8'));
const original=await readFile('data/snapshot.json','utf8');
const expected=new Set(companies.map(c=>c.ticker));
assert.equal(raw.rows.length,expected.size);
const prices={},filings={};
for(const row of raw.rows){
  assert.ok(expected.delete(row.ticker),'Missing, unexpected or duplicate company');
  const {price:p,filings:f}=row;
  assert.equal(p.mode,'live');assert.ok(!p.error);assert.ok(p.summary?.baselineDays>=20);
  const bars=p.summary.history;assert.ok(bars.length>=21);
  assert.equal(new Set(bars.map(b=>b.date)).size,bars.length);
  for(const [i,b] of bars.entries()){
    assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(b.date));
    assert.ok(Number.isFinite(b.close)&&b.close>0&&Number.isFinite(b.volume)&&b.volume>=0);
    assert.ok(timestamp(b.date)<=Date.now());if(i)assert.ok(bars[i-1].date<b.date);
  }
  assert.equal(f.mode,'live');assert.ok(!f.error);assert.ok(Array.isArray(f.items)&&f.items.length>0,'Empty exchange response requires manual review');
  for(const item of f.items){assert.equal(item.ticker,row.ticker);assert.ok(/^https:\/\//.test(item.url));assert.ok(timestamp(item.date)&&timestamp(item.date)<=Date.now());}
  assert.ok(timestamp(p.fetchedAt)&&timestamp(f.fetchedAt));
  prices[row.ticker]={ticker:row.ticker,bars,source:p.source,fetchedAt:p.fetchedAt};
  filings[row.ticker]={items:f.items.map(({id,ticker,headline,description,date,url})=>({id,ticker,headline,description,date,url})),source:f.source,fetchedAt:f.fetchedAt,coverage:f.coverage};
}
assert.equal(expected.size,0);
const candidate={generatedAt:new Date().toISOString(),collection:{method:'Validated local Worker source refresh',priceWindow:'30 available completed sessions per company',note:'Fetch dates and trading-session dates are separate. Exchange responses may be incomplete.'},prices,filings};
await mkdir(root,{recursive:true});
await writeFile(root+'/snapshot-before-refresh.json',original);
await writeFile(root+'/snapshot-candidate.json',JSON.stringify(candidate,null,2));
await writeFile('data/snapshot.json',JSON.stringify(candidate));
console.log(JSON.stringify({companies:Object.keys(prices).length,filings:Object.values(filings).reduce((n,f)=>n+f.items.length,0),sessions:[...new Set(Object.values(prices).map(p=>p.bars.at(-1).date))],backup:root+'/snapshot-before-refresh.json'}));
