/* Apply saved appearance before CSS paints; all preferences stay on this device. */
(()=>{
 const root=document.documentElement,system=matchMedia('(prefers-color-scheme: dark)');
 const valid=value=>['dark','light','system'].includes(value)?value:'system';
 let preference='system';try{preference=valid(localStorage.getItem('finn-theme'));}catch{}
 function apply(){
  const mode=preference==='system'?(system.matches?'dark':'light'):preference;
  root.dataset.theme=mode;root.dataset.themePreference=preference;root.style.colorScheme=mode;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content',mode==='dark'?'#101827':'#f3f5f9');
  document.querySelectorAll('input[name="theme"]').forEach(input=>input.checked=input.value===preference);
 }
 apply();system.addEventListener('change',()=>{if(preference==='system')apply();});
 addEventListener('storage',event=>{if(event.key==='finn-theme'||event.key===null){preference=valid(event.newValue);apply();}});
 addEventListener('DOMContentLoaded',()=>{
  apply();document.querySelectorAll('input[name="theme"]').forEach(input=>input.addEventListener('change',()=>{
   if(!input.checked)return;preference=valid(input.value);apply();
   let saved=true;try{localStorage.setItem('finn-theme',preference);}catch{saved=false;}
   document.querySelector('#appearance-status').textContent=saved?'Saved automatically on this device.':'Storage unavailable. Appearance applies for this visit.';
  }));
  const trigger=document.querySelector('#profile-trigger'),menu=document.querySelector('#profile-menu'),shortcut=document.querySelector('#profile-settings');
  function closeProfile(restore=false){menu.hidden=true;trigger.setAttribute('aria-expanded','false');if(restore)trigger.focus();}
  function openProfile(){menu.hidden=false;trigger.setAttribute('aria-expanded','true');shortcut.focus();}
  trigger.addEventListener('click',()=>{if(menu.hidden)openProfile();else closeProfile(true);});
  trigger.addEventListener('keydown',event=>{if(['ArrowDown','ArrowUp'].includes(event.key)){event.preventDefault();openProfile();}});
  menu.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();closeProfile(true);}else if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)){event.preventDefault();shortcut.focus();}});
  shortcut.addEventListener('click',()=>closeProfile());
  document.addEventListener('pointerdown',event=>{if(!event.target.closest('.profile-control'))closeProfile();});
  document.addEventListener('focusin',event=>{if(!event.target.closest('.profile-control'))closeProfile();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!menu.hidden)closeProfile(true);});
  function greet(){
   if(document.querySelector('#main')?.dataset.currentView!=='brief')return;
   const hour=new Date().getHours();
   const greeting=Number.isFinite(hour)?hour<5?'Welcome back':hour<12?'Good morning':hour<17?'Good afternoon':'Good evening':'Welcome back';
   document.querySelector('#page-title').textContent=greeting+', Vikash';
   document.querySelector('#eyebrow').textContent='DAILY BRIEF';
   document.querySelector('#page-subtitle').textContent='Your portfolio, at a glance.';
  }
  greet();document.addEventListener('finn:viewchange',greet);document.addEventListener('visibilitychange',()=>{if(!document.hidden)greet();});setInterval(greet,60000);
  let queued=false;
  function update(){queued=false;const y=window.scrollY;if(y>64)root.classList.add('is-scrolled');else if(y<16)root.classList.remove('is-scrolled');}
  addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(update);}},{passive:true});update();
 });
})();

/* Custom pointer is limited to precise mouse devices; native editing cursors remain. */
addEventListener('DOMContentLoaded',()=>{
 const precise=matchMedia('(hover: hover) and (pointer: fine)');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const cursor=document.createElement('div');cursor.className='finn-cursor';cursor.setAttribute('aria-hidden','true');cursor.innerHTML='<span></span>';document.body.append(cursor);
 let shown=false;
 function hide(){cursor.classList.remove('visible');document.documentElement.classList.remove('custom-pointer');shown=false;}
 document.addEventListener('pointermove',event=>{
  if(!precise.matches||event.pointerType!=='mouse'||event.target.closest('input,textarea,select,[contenteditable=true],iframe')){hide();return;}
  cursor.style.left=event.clientX+'px';cursor.style.top=event.clientY+'px';
  if(!shown){cursor.classList.add('visible');document.documentElement.classList.add('custom-pointer');shown=true;}
  cursor.classList.toggle('over-control',Boolean(event.target.closest('button,a,summary,[role=button]')));
 });
 document.addEventListener('pointerdown',()=>cursor.classList.add('pressed'));
 document.addEventListener('pointerup',()=>cursor.classList.remove('pressed'));
 document.addEventListener('pointerout',event=>{if(!event.relatedTarget)hide();});
 addEventListener('blur',hide);document.addEventListener('visibilitychange',()=>{if(document.hidden)hide();});precise.addEventListener('change',hide);
});
