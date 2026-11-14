(()=>{
 let logo=null,home=false,frame=0,progress=0,lastTime=0,metrics=null,lastWidth=0;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
 const mix=(a,b,t)=>a+(b-a)*t;
 function measure(){
  const header=document.querySelector('.site-header'),wordmark=header?.querySelector('.wordmark');
  const rect=(wordmark||header)?.getBoundingClientRect();
  const heroHeight=document.querySelector('.hero-v3')?.getBoundingClientRect().height||innerHeight;
  const size=clamp(innerWidth*.07,45,112);
  const finalSize=wordmark?parseFloat(getComputedStyle(wordmark).fontSize):innerWidth<700?17:22;
  metrics={start:heroHeight*.44,end:rect?rect.top+rect.height/2:innerWidth<700?34:39,size,scale:finalSize/size,distance:Math.min(520,heroHeight*.65)};
  logo.style.fontSize=size+'px';
  lastWidth=innerWidth;
 }
 function paint(time){
  frame=0;if(!home||!logo||!metrics)return;
  const y=Math.max(0,window.scrollY);
  document.body.classList.toggle('fitelier-scrolled',y>8);
  const target=reduced.matches?Number(y>140):clamp(y/metrics.distance,0,1);
  const elapsed=lastTime?Math.min(time-lastTime,64):16.67;lastTime=time;
  progress=reduced.matches?target:mix(progress,target,1-Math.exp(-elapsed/65));
  if(Math.abs(target-progress)<.0002)progress=target;
  const position=mix(metrics.start,metrics.end,progress),scale=mix(1,metrics.scale,progress);
  logo.style.transform='translate3d(-50%,'+position.toFixed(3)+'px,0) translateY(-50%) scale('+scale.toFixed(5)+')';
  const fade=clamp((progress-.25)/.55,0,1),blend=fade*fade*(3-2*fade);
  logo.style.color='rgb('+[mix(246,114,blend),mix(232,85,blend),mix(206,47,blend)].map(Math.round).join(',')+')';
  logo.style.textShadow='0 2px 15px rgba(0,0,0,'+(.33*(1-blend)).toFixed(3)+')';
  if(progress!==target)frame=requestAnimationFrame(paint);else lastTime=0;
 }
 function schedule(){if(home&&!frame)frame=requestAnimationFrame(paint)}
 function refresh(){
  home=!!document.querySelector('#hero-root')&&!location.hash.startsWith('#/motion');
  document.body.classList.toggle('fitelier-home',home);
  document.body.classList.toggle('fitelier-scrolled',window.scrollY>8);
  if(!home){if(frame)cancelAnimationFrame(frame);frame=0;logo?.remove();logo=null;metrics=null;lastTime=0;return;}
  if(!logo){
   logo=document.createElement('div');logo.className='fitelier-floating-logo';logo.textContent='FITELIER';logo.setAttribute('aria-hidden','true');
   Object.assign(logo.style,{left:'50%',top:'0px',willChange:'transform',transformOrigin:'center center'});
   document.body.append(logo);measure();
   progress=reduced.matches?Number(window.scrollY>140):clamp(window.scrollY/metrics.distance,0,1);
  }else measure();
  schedule();
 }
 window.FitelierHome={refresh:()=>requestAnimationFrame(refresh)};
 window.addEventListener('scroll',schedule,{passive:true});
 window.addEventListener('resize',()=>{if(home&&(!metrics||Math.abs(innerWidth-lastWidth)>1)){measure();schedule()}});
 window.addEventListener('hashchange',()=>requestAnimationFrame(refresh));
 document.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(refresh));
 document.fonts?.ready.then(()=>{if(home){measure();schedule()}});
 reduced.addEventListener?.('change',schedule);
})();
