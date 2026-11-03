/* Runs before the stylesheet so a saved theme does not flash on navigation. */
(()=>{
  const root=document.documentElement,system=matchMedia('(prefers-color-scheme: dark)');
  let preference=null;
  try{const saved=localStorage.getItem('finn-theme');if(saved==='dark'||saved==='light')preference=saved;}catch{}
  function apply(mode){root.dataset.theme=mode;root.style.colorScheme=mode;document.querySelector('meta[name="theme-color"]')?.setAttribute('content',mode==='dark'?'#101827':'#edf1f7');}
  apply(preference||(system.matches?'dark':'light'));
  addEventListener('DOMContentLoaded',()=>{
    const button=document.createElement('button');button.type='button';button.className='icon-button theme-toggle';
    const sun='<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>';
    const moon='<path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z"/>';
    function label(){const dark=root.dataset.theme==='dark';button.setAttribute('aria-label',dark?'Switch to light mode':'Switch to dark mode');button.title=dark?'Switch to light mode':'Switch to dark mode';button.innerHTML='<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(dark?sun:moon)+'</svg>';}
    button.addEventListener('click',()=>{preference=root.dataset.theme==='dark'?'light':'dark';apply(preference);try{localStorage.setItem('finn-theme',preference);}catch{}label();});
    document.querySelector('.top-actions').append(button);label();
    system.addEventListener('change',()=>{if(!preference){apply(system.matches?'dark':'light');label();}});
    addEventListener('storage',event=>{if(event.key==='finn-theme'){preference=['light','dark'].includes(event.newValue)?event.newValue:null;apply(preference||(system.matches?'dark':'light'));label();}});
    let queued=false;
    function update(){queued=false;const y=window.scrollY;if(y>64)root.classList.add('is-scrolled');else if(y<16)root.classList.remove('is-scrolled');}
    addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(update);}},{passive:true});update();
  });
})();
