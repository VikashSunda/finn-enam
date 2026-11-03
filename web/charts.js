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
    const series=metric==='close'?'<polyline class="trend-line" pathLength="1" points="'+points+'"/>':bars.map((bar,i)=>'<rect class="trend-bar" x="'+(x(i)-4).toFixed(2)+'" y="'+y(bar.volume).toFixed(2)+'" width="8" height="'+(180-y(bar.volume)).toFixed(2)+'"><title>'+esc(bar.date)+' · '+esc(format(bar.volume))+'</title></rect>').join('');
    host.innerHTML='<div class="trend-header"><div><p class="eyebrow">THE SESSION VIEW</p><h2>Follow the movement</h2><p class="small muted">'+esc(bars.length)+' available completed sessions · '+esc(row.price.mode.replaceAll('_',' '))+'</p></div><label class="trend-select">Company<select aria-label="Chart company">'+rows.map(r=>'<option value="'+esc(r.ticker)+'" '+(r.ticker===selected?'selected':'')+'>'+esc(r.ticker)+'</option>').join('')+'</select></label></div><div class="trend-controls"><div><b>'+esc(format(last[metric]))+'</b><span>'+esc(label)+' · '+esc(last.date)+'</span></div><div class="trend-metrics" role="group" aria-label="Chart metric"><button type="button" data-metric="close" aria-pressed="'+(metric==='close')+'">Price</button><button type="button" data-metric="volume" aria-pressed="'+(metric==='volume')+'">Volume</button></div></div><div class="trend-plot"><svg viewBox="0 0 750 220" role="img" aria-label="'+esc(label+' for '+selected+', '+first.date+' to '+last.date+'. Minimum '+format(low)+', maximum '+format(high))+ '"><title>'+esc(label+' · '+selected)+'</title>'+[0,.5,1].map(t=>{const value=floor+range*t,pos=y(value);return '<line class="trend-grid" x1="62" x2="716" y1="'+pos+'" y2="'+pos+'"/><text x="52" y="'+(pos+4)+'" text-anchor="end">'+esc(metric==='volume'?number(value/1000000,1)+'m':number(value,0))+'</text>';}).join('')+series+'<text x="62" y="210">'+esc(first.date)+'</text><text x="716" y="210" text-anchor="end">'+esc(last.date)+'</text></svg></div><details class="trend-data"><summary>Inspect the session values</summary><div class="table-scroll"><table><caption class="sr-only">'+esc(selected+' '+label)+'</caption><thead><tr><th scope="col">Session</th><th scope="col">'+esc(label)+'</th></tr></thead><tbody>'+bars.map(bar=>'<tr><td>'+esc(bar.date)+'</td><td>'+esc(format(bar[metric]))+'</td></tr>').join('')+'</tbody></table></div></details><p class="trend-source">Completed daily observations, not an intraday feed. '+(row.price.source?'<a class="source-link" target="_blank" rel="noopener noreferrer" href="'+safeURL(row.price.source)+'">Verify price source ↗</a>':'Source link unavailable.')+'</p>';
    host.querySelector('select').addEventListener('change',event=>{selected=event.target.value;draw();});
    host.querySelectorAll('[data-metric]').forEach(button=>button.addEventListener('click',()=>{metric=button.dataset.metric;draw();}));
  }
  new MutationObserver(draw).observe(document.querySelector('#portfolio-table'),{childList:true});
  draw();
})();
