(()=>{
 let logo=null,home=false,frame=0,metrics=null;
 const rootSize=new ResizeObserver(()=>{
  if(!home||!logo)return;
  slides();measure();schedule();
 });
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
 const mix=(a,b,t)=>a+(b-a)*t;
 function slides(){
  const photo=document.querySelector('.hero-v3-photo');
  if(!photo||photo.querySelector('.fitelier-slides'))return;
  const original=photo.querySelector('img');if(!original)return;
  const group=document.createElement('div');group.className='fitelier-slides';
  ['fitelier-tailoring-placeholder.webp','fitelier-hero-nocturne.jpg','fitelier-hero-v3.jpg'].forEach((name,i)=>{
   const img=document.createElement('img');img.src='/assets/'+name;img.className='fitelier-slide fitelier-slide-'+i;
   img.alt=['Charcoal wool jacket and fabric swatches on a walnut worktable','Model in dark tailoring','Model in a dark jacket and light trousers'][i];group.append(img);
  });
  photo.append(group);original.style.display='none';
 }
 function measure(){
  const hero=document.querySelector('.hero-v3');
  const wordmark=document.querySelector('.site-header .wordmark');
  if(!hero||!wordmark)return;
  const heroRect=hero.getBoundingClientRect();
  const headerRect=wordmark.getBoundingClientRect();
  const size=clamp(innerWidth*.07,45,112);
  const end=headerRect.top+headerRect.height/2;
  const textTop=Math.min(...Array.from(hero.querySelectorAll('.hero-service-heading, .hero-side-copy'),
   element=>element.getBoundingClientRect().top+window.scrollY));
  const start=Math.max(end,Math.min(heroRect.top+window.scrollY+heroRect.height*(innerWidth<=700?.38:.44),textTop-size/2-12));
  const finalSize=parseFloat(getComputedStyle(wordmark).fontSize);
  const availableScroll=textTop-end-finalSize/2-12;
  metrics={start,end,scale:finalSize/size,distance:clamp(availableScroll,1,185)};
  logo.style.fontSize=size+'px';
 }
 function paint(){
  frame=0;if(!home||!logo)return;
  if(!metrics)measure();
  if(!metrics)return;
  const y=Math.max(0,window.scrollY);
  const fraction=clamp(y/metrics.distance,0,1);
  const position=mix(metrics.start,metrics.end,fraction);
  const scale=mix(1,metrics.scale,fraction);
  const docked=fraction===1||(reduced.matches&&y>0);
  document.body.classList.toggle('fitelier-logo-docked',docked);
  logo.style.transform='translate3d(-50%,'+position+'px,0) translateY(-50%) scale('+scale+')';
 }
 function schedule(){if(home&&!frame)frame=requestAnimationFrame(paint)}
 function refresh(){
  const heroRoot=document.querySelector('#hero-root');
  home=!!heroRoot&&!location.hash.startsWith('#/motion');
  document.body.classList.toggle('fitelier-home',home);
  updateHeader();
  if(!home){rootSize.disconnect();if(frame)cancelAnimationFrame(frame);frame=0;logo?.remove();logo=null;metrics=null;document.body.classList.remove('fitelier-logo-docked');return;}
  slides();
  if(!logo){
   logo=document.createElement('div');logo.className='fitelier-floating-logo';logo.textContent='FITELIER';logo.setAttribute('aria-hidden','true');
   Object.assign(logo.style,{left:'50%',top:'0px',willChange:'transform',transformOrigin:'center center'});
   document.body.append(logo);rootSize.observe(heroRoot);measure();
  }else measure();
  schedule();
 }
 window.FitelierHome={refresh:()=>requestAnimationFrame(refresh)};
 function updateHeader(){
  document.body.classList.toggle('fitelier-scrolled',window.scrollY>0);
  document.body.classList.toggle('back-to-top-visible',window.scrollY>240);
 }
 window.addEventListener('scroll',()=>{updateHeader();schedule()},{passive:true});
 window.addEventListener('resize',()=>{if(home){measure();schedule()}});
 window.addEventListener('hashchange',()=>requestAnimationFrame(refresh));
 document.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(refresh));
 document.fonts?.ready.then(()=>{if(home){measure();schedule()}});
 reduced.addEventListener?.('change',schedule);
})();
