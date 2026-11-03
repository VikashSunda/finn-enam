/* Uses the same completed-session data as the portfolio; no synthetic series. */
(()=>{
  const host=document.createElement('section');
  host.className='panel trend-panel';
  host.setAttribute('aria-label','Portfolio company history');
  document.querySelector('#portfolio-view').prepend(host);
  let selected='',metric='close';
  function draw(){
    const rows=state.rows.filter(row=>row.price.summary?.history?.length);
    if(!rows.length){host.innerHTML='<div class="trend-empty">History chart will appear when daily source data is available.</div>';return;}
    if(!rows.some(row=>row.ticker===selected))selected=rows[0].ticker;
    const row=rows.find(row=>row.ticker===selected),summary=row.price.summary;
    const bars=summary.history.filter(bar=>Number.isFinite(bar[metric]));
    const values=bars.map(bar=>bar[metric]),low=Math.min(...values),high=Math.max(...values);
    const floor=metric==='volume'?0:low-(high-low||low*.01)*.12;
    const ceiling=high+(high-floor||1)*.12,range=ceiling-floor||1;
    const x=i=>62+i/(bars.length-1||1)*654,y=value=>180-(value-floor)/range*150;
    const points=bars.map((bar,i)=>x(i).toFixed(2)+','+y(bar[metric]).toFixed(2)).join(' ');
    const label=metric==='close'?'Daily closing price':'Daily traded volume';
    const format=value=>metric==='close'?'₹'+number(value):number(value,0);
    const last=bars.at(-1),first=bars[0];
    const series=metric==='close'?'<defs><linearGradient id="price-wash" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#3c79b2" stop-opacity=".18"/><stop offset="1" stop-color="#3c79b2" stop-opacity="0"/></linearGradient></defs><polygon class="trend-area" fill="url(#price-wash)" points="62,180 '+points+' '+x(bars.length-1)+',180"/><polyline class="trend-line" pathLength="1" points="'+points+'"/><circle class="trend-end" cx="'+x(bars.length-1)+'" cy="'+y(last.close)+'" r="4"><title>'+esc(last.date+' · '+format(last.close))+'</title></circle>':bars.map((bar,i)=>'<rect class="trend-bar" x="'+(x(i)-4).toFixed(2)+'" y="'+y(bar.volume).toFixed(2)+'" width="8" height="'+(180-y(bar.volume)).toFixed(2)+'"><title>'+esc(bar.date)+' · '+esc(format(bar.volume))+'</title></rect>').join('');
    host.innerHTML='<div class="trend-header"><div><p class="eyebrow">THE SESSION VIEW</p><h2>Follow the movement</h2><p class="small muted">'+esc(bars.length)+' available completed sessions · '+esc(row.price.mode.replaceAll('_',' '))+'</p></div><label class="trend-select">Company<select aria-label="Chart company">'+rows.map(r=>'<option value="'+esc(r.ticker)+'" '+(r.ticker===selected?'selected':'')+'>'+esc(r.ticker)+'</option>').join('')+'</select></label></div><div class="trend-controls"><div><b>'+esc(format(last[metric]))+'</b><span>'+esc(label)+' · '+esc(last.date)+'</span></div><div class="trend-metrics" role="group" aria-label="Chart metric"><button type="button" data-metric="close" aria-pressed="'+(metric==='close')+'">Price</button><button type="button" data-metric="volume" aria-pressed="'+(metric==='volume')+'">Volume</button></div></div><div class="trend-plot"><svg viewBox="0 0 750 220" role="img" aria-label="'+esc(label+' for '+selected+', '+first.date+' to '+last.date+'. Minimum '+format(low)+', maximum '+format(high))+ '"><title>'+esc(label+' · '+selected)+'</title>'+[0,.5,1].map(t=>{const value=floor+range*t,pos=y(value);return '<line class="trend-grid" x1="62" x2="716" y1="'+pos+'" y2="'+pos+'"/><text x="52" y="'+(pos+4)+'" text-anchor="end">'+esc(metric==='volume'?number(value/1000000,1)+'m':number(value,0))+'</text>';}).join('')+series+'<text x="62" y="210">'+esc(first.date)+'</text><text x="716" y="210" text-anchor="end">'+esc(last.date)+'</text></svg></div><details class="trend-data"><summary>Inspect the session values</summary><div class="table-scroll"><table><caption class="sr-only">'+esc(selected+' '+label)+'</caption><thead><tr><th scope="col">Session</th><th scope="col">'+esc(label)+'</th></tr></thead><tbody>'+bars.map(bar=>'<tr><td>'+esc(bar.date)+'</td><td>'+esc(format(bar[metric]))+'</td></tr>').join('')+'</tbody></table></div></details><p class="trend-source">Completed daily observations, not an intraday feed. '+(row.price.source?'<a class="source-link" target="_blank" rel="noopener noreferrer" href="'+safeURL(row.price.source)+'">Verify price source ↗</a>':'Source link unavailable.')+'</p>';
    host.querySelector('select').addEventListener('change',event=>{selected=event.target.value;draw();});
    host.querySelectorAll('[data-metric]').forEach(button=>button.addEventListener('click',()=>{metric=button.dataset.metric;draw();}));
  }
  new MutationObserver(draw).observe(document.querySelector('#portfolio-table'),{childList:true});
  draw();
})();

/* A short, source-labelled entry point into company charts. */
(()=>{
  const icons={brief:'<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 3v18m4-12h5m-5 4h5"/>',portfolio:'<path d="M4 20V10m5 10V4m6 16v-8m5 8V7"/>',research:'<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>',sources:'<path d="M7 3h8l4 4v14H5V3h2m8 0v5h4M9 12h6m-6 4h6"/>'};
  document.querySelectorAll('[data-view]').forEach(button=>{
    const icon=button.querySelector('.nav-icon')||button.querySelector('span');
    if(icon&&icons[button.dataset.view])icon.innerHTML='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+icons[button.dataset.view]+'</svg>';
  });
  const tape=document.createElement('section');tape.className='session-tape';tape.setAttribute('aria-label','Selected watchlist closes');
  document.querySelector('#brief-view').prepend(tape);
  function update(){
    const rows=state.rows.filter(row=>row.price.summary).slice(0,6);
    tape.innerHTML='<div class="tape-label"><span class="tape-dot"></span><b>Watchlist closes</b><small>Available EOD sessions</small></div><div class="tape-scroll">'+rows.map(row=>{const s=row.price.summary;return '<button type="button" class="tape-company" data-chart="'+esc(row.ticker)+'" aria-label="Open '+esc(row.ticker)+' chart"><span class="tape-symbol">'+esc(row.ticker)+'</span><span class="tape-quote">₹'+number(s.close)+' <small class="'+(s.changePct>=0?'positive':'negative')+'">'+pct(s.changePct)+'</small></span><span class="tape-date">'+esc(s.date)+' · '+esc(row.price.mode.replaceAll('_',' '))+'</span></button>';}).join('')+'</div>';
    tape.querySelectorAll('[data-chart]').forEach(button=>button.addEventListener('click',()=>{
      switchView('portfolio');const select=document.querySelector('.trend-select select');if(select){select.value=button.dataset.chart;select.dispatchEvent(new Event('change'));}
    }));
  }
  new MutationObserver(update).observe(document.querySelector('#portfolio-table'),{childList:true});update();
})();
