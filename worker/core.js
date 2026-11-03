export function normaliseTicker(value) {
  const ticker = String(value || '').trim().toUpperCase().replace(/\.(NS|BO)$/, '');
  if (!/^[A-Z0-9][A-Z0-9&-]{0,24}$/.test(ticker)) throw new Error('Enter an NSE symbol, for example INFY or M&M.');
  return ticker;
}

export function classify(item) {
  const text = (item.headline + ' ' + (item.description || '')).toLowerCase();
  if(/newspaper|newspaper publication|newspaper advertisement|publication.*(?:results|dividend)|trading window/.test(text))return {...item,category:/results/.test(text)?'results':'unclassified',priority:'routine'};
  const rules = [
    ['litigation', /penalt|litigat|fraud|insolvenc|regulatory order|show cause|tax demand/, 'high'],
    ['management_change', /resign|appoint.*(?:ceo|cfo|chief|managing director)|(?:ceo|cfo|chief executive).*appoint|demise/, 'high'],
    ['M&A', /acquisition|acquire|merger|demerger|joint venture|sale of.*stake/, 'high'],
    ['results', /financial results|quarterly results|audited results|unaudited results/, 'high'],
    ['fund_raise', /fund.?rais|qualified institutional|preferential allot|rights issue|buyback/, 'watch'],
    ['credit_rating', /credit rating|rating.*(?:upgrade|downgrade|reaffirm)/, 'watch'],
    ['capex', /capacity expansion|capital expenditure|new plant|new facility/, 'watch'],
    ['pledging', /pledge|pledging/, 'watch'],
    ['insider_trading', /insider|trading window|disclosure.*(?:29|7\(2\))/, 'routine'],
    ['earnings_call', /transcript|earnings call|conference call|concall/, 'watch'],
    ['dividend', /dividend/, 'watch'],
    ['bonus_split', /bonus issue|stock split|sub.division/, 'watch'],
    ['investor_meetings', /investor meet|analyst meet|schedule.*analyst/, 'routine'],
    ['postal_ballot', /postal ballot/, 'routine'],
    ['agm_egm', /annual general meeting|extraordinary general meeting|voting result/, 'routine'],
    ['press_release', /order win|award.*contract|press release|partnership|new product/, 'watch'],
  ];
  const found = rules.find(([, pattern]) => pattern.test(text));
  return {...item, category: found?.[0] || 'unclassified', priority: found?.[2] || 'routine'};
}

export function timestamp(date) {
  if (!date) return null;
  let d = String(date).trim();
  if (/^\d{4}-\d\d-\d\d[T ]\d\d:\d\d/.test(d) && !/(Z|[+-]\d\d:\d\d)$/.test(d)) d = d.replace(' ', 'T') + '+05:30';
  const value = Date.parse(d);
  return Number.isFinite(value) ? value : null;
}

export function summariseBars(bars, now = new Date()) {
  const ist = new Date(now.getTime() + 330 * 60_000);
  const today = ist.toISOString().slice(0, 10);
  const beforeClose = ist.getUTCHours() * 60 + ist.getUTCMinutes() < 15 * 60 + 40;
  const valid = bars.filter(b => Number.isFinite(b.close) && b.close > 0 && Number.isFinite(b.volume) && b.volume >= 0 && (b.date < today || (b.date === today && !beforeClose))).sort((a,b) => a.date.localeCompare(b.date));
  if (!valid.length) return null;
  const latest = valid.at(-1), previous = valid.at(-2);
  const baseline = valid.slice(-21, -1);
  const average = baseline.length ? baseline.reduce((sum,b) => sum+b.volume,0)/baseline.length : null;
  return {date:latest.date, close:latest.close, changePct:previous ? (latest.close/previous.close-1)*100 : null, volume:latest.volume, avgVolume:average, volumeRatio:baseline.length >= 10 && average > 0 ? latest.volume/average : null, baselineDays:baseline.length, history:valid.slice(-30)};
}

export function makeAlerts(prices, settings = {}) {
  const priceThreshold = Number(settings.priceThreshold) || 4;
  const volumeThreshold = Number(settings.volumeThreshold) || 2;
  return Object.entries(prices).flatMap(([ticker, p]) => {
    if (!p?.summary) return [];
    const s = p.summary, alerts=[];
    if (s.changePct !== null && Math.abs(s.changePct) >= priceThreshold) alerts.push({id:ticker+'-price-'+s.date,ticker,type:'price',date:s.date,value:s.changePct,threshold:priceThreshold});
    if (s.volumeRatio !== null && s.volumeRatio >= volumeThreshold) alerts.push({id:ticker+'-volume-'+s.date,ticker,type:'volume',date:s.date,value:s.volumeRatio,threshold:volumeThreshold});
    return alerts;
  });
}

export const TOPICS = {
  business: ['business overview','our business','our offerings','revenue mix','segments','consulting','digital services','clients'],
  financials: ['revenue','ebitda','profit','margin','earnings','tax'],
  cash: ['cash flow','cash conversion','working capital','receivable','free cash','operating cash'],
  balance: ['debt','borrowings','liabilities','leverage','balance sheet'],
  guidance: ['guidance','expect','outlook','forecast','fiscal','target'],
  risk: ['risk','uncertainty','headwind','challenge','competition','decline'],
};

export function retrieve(documents, question = '', topic = 'business', limit = 10) {
  const query = question.toLowerCase().match(/[a-z]{3,}/g) || [];
  const stop = new Set(['what','does','this','that','with','from','have','their','company','please','tell','about','show','will','which','should','and','the','are','for','its','how']);
  const terms = [...new Set([...query.filter(w=>!stop.has(w)), ...(TOPICS[topic] || [])])];
  const found=[];
  for (const [di,doc] of documents.entries()) for (const page of doc.pages || []) {
    const sections=page.text.match(/.{1,1700}(?:\s|$)/g) || [page.text];
    for (let i=0;i<sections.length;i++) {
      const text=sections[i].trim(), lower=text.toLowerCase();
      const hits=terms.filter(term=>lower.includes(term));
      if (!hits.length || text.length < 100) continue;
      let score=hits.length*3 + (doc.type==='transcript'?Math.max(1,5-di):0) - (/table of contents|forward.looking statements|safe harbour/.test(lower)?10:0);
      if(topic==='business'){
        if(/business overview|our business|segment.{0,35}revenue|revenue.{0,35}segment|our offerings/.test(lower))score+=8;
        if(doc.type==='annual_report' && /leading provider|business overview|our business|our offerings/.test(lower))score+=14;
        if(/awards|manufactured capital|natural capital|share in profit|remuneration|certificate/.test(lower))score-=12;
      }
      if(topic==='guidance' && /guidance|outlook/.test(lower))score+=6;
      if(topic==='cash' && /cash flows? from operat|free cash flow|cash conversion/.test(lower))score+=6;
      if(score<=0)continue;
      // Short transcript pages often separate an analyst question from the
      // management answer. Keep the page context instead of losing its caveat.
      const context=page.text.length<=3200?page.text:text;
      found.push({id:doc.id+'-'+page.page+'-'+i,documentId:doc.id,page:page.page,label:doc.label,url:doc.url,type:doc.type,text:context,score});
    }
  }
  found.sort((a,b)=>b.score-a.score);
  const counts={},docCounts={},chosen=[];
  for (const entry of found) {
    const key=entry.documentId+'-'+entry.page;
    if ((counts[key]||0)>=1)continue;
    if((docCounts[entry.documentId]||0)>=3 && documents.filter(d=>d.pages?.length).length>1)continue;
    counts[key]=(counts[key]||0)+1;
    docCounts[entry.documentId]=(docCounts[entry.documentId]||0)+1;
    chosen.push(entry);
    if(chosen.length===limit)break;
  }
  return chosen;
}

export function quarterKey(label) {
  const match = /Q([1-4])FY(\d{2,4})/.exec(label);
  return match ? (Number(match[2]) % 100) * 4 + Number(match[1]) : null;
}

export function safeSourceURL(raw) {
  const u = new URL(raw);
  const host=u.hostname.toLowerCase();
  if(u.protocol!=='https:' || u.port || u.username || u.password || !/^[a-z0-9.-]+$/.test(host) || /^\d/.test(host) || host==='localhost' || !host.includes('.') || /\.(local|internal|localhost)$/.test(host)) throw new Error('Invalid public source URL');
  return u;
}

export function discoverDocuments(html, ticker) {
  const decode=s=>s.replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"');
  const docs=[];
  const annual=html.split('<h3>Annual reports</h3>')[1]?.split('</ul>')[0] || '';
  for (const match of annual.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)) {
    if(/Annual Report/i.test(match[2])) {docs.push({type:'annual_report',label:match[2].replace(/<[^>]*>/g,'').trim(),url:decode(match[1])});break;}
  }
  for(const match of html.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)) {
    if(!match[1].includes('Raw Transcript'))continue;
    for(const a of match[1].matchAll(/<a\b([^>]+)>([\s\S]*?)<\/a>/g)) {
      if(!a[1].includes('Raw Transcript'))continue;
      const url=/href="([^"]+)"/.exec(a[1])?.[1];
      const date=/>([A-Z][a-z]{2} \d{4})<\/div>/.exec(match[1])?.[1];
      if(url)docs.push({type:'transcript',label:'Earnings call · '+(date||'date unverified'),url:decode(url)});
      break;
    }
    if(docs.filter(d=>d.type==='transcript').length>=4)break;
  }
  return docs.map((d,i)=>({...d,id:ticker+'-'+i}));
}
