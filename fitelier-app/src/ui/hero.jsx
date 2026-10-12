import React,{useEffect,useRef,useState,useId} from 'react';
import {createRoot} from 'react-dom/client';
import {motion,useReducedMotion,useMotionValue,useSpring as useMotionSpring,useTransform} from 'motion/react';
import {useSpring,animated} from '@react-spring/web';
import gsap from 'gsap';
import {useGSAP} from '@gsap/react';
gsap.registerPlugin(useGSAP);

// The supplied raster logo remains intact; SVG framing and colour treatment
// isolate the real primary lockup rather than recreating it with a font.
function BrandMark(){const filter=useId().replaceAll(':','');return <svg className="brand-original" viewBox="615 58 306 247" role="img" aria-label="Fitelier. Dress well. Live well."><defs><filter id={filter} colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 .894 0 0 0 0 .784 0 0 0 0 .604 -2 -2 -2 0 5.72"/></filter></defs><image className="brand-ink" href="/assets/fitelier-brand-board.png" width="1536" height="1024" filter={`url(#${filter})`}/><circle className="brand-trace" cx="768" cy="140" r="77" fill="none" stroke="currentColor" strokeWidth="1.3" pathLength="1"/></svg>}
function Hero({variant='signature'}){
 const scope=useRef(null),reduce=useReducedMotion();
 const mx=useMotionValue(0),my=useMotionValue(0),px=useMotionSpring(mx,{stiffness:45,damping:24}),py=useMotionSpring(my,{stiffness:45,damping:24});
 const tiltX=useTransform(py,[-1,1],[1.4,-1.4]),tiltY=useTransform(px,[-1,1],[-1.8,1.8]);
 const drift=useSpring({from:{opacity:reduce?1:0,y:reduce?0:28},to:{opacity:1,y:0},config:{mass:2,tension:64,friction:27},immediate:!!reduce||variant!=='drift'});
 useGSAP(()=>{
   if(variant!=='signature'||reduce)return;
   const t=gsap.timeline();
   t.fromTo('.brand-trace',{strokeDasharray:1,strokeDashoffset:1,opacity:1},{strokeDashoffset:0,duration:1.65,ease:'power2.inOut'})
    .fromTo('.brand-ink',{opacity:0},{opacity:1,duration:1.2},.8)
    .from('.hero-side-copy',{opacity:0,y:18,duration:1.2},.7)
    .from('.hero-v3-photo',{opacity:.35,x:28,scale:1.04,duration:2,ease:'power3.out'},0)
    .to('.brand-trace',{opacity:0,duration:.4},1.7);
 },{scope,dependencies:[variant,reduce],revertOnUpdate:true});
 useEffect(()=>{if(variant!=='depth'||reduce)return;const element=scope.current;const handle=e=>{const rect=element.getBoundingClientRect();mx.set((e.clientX-rect.left)/rect.width*2-1);my.set((e.clientY-rect.top)/rect.height*2-1)};const leave=()=>{mx.set(0);my.set(0)};element.addEventListener('pointermove',handle);element.addEventListener('pointerleave',leave);return()=>{element.removeEventListener('pointermove',handle);element.removeEventListener('pointerleave',leave)}},[variant,reduce,mx,my]);
 const side=<><div className="hero-brand-wrap"><BrandMark/></div><div className="hero-side-copy"><h1>A wardrobe that<br/><em>grows with you.</em></h1><p className="hero-description">Your garments. Your combinations.<br className="mobile-copy-break"/> A place to return to.</p><div className="hero-v3-actions"><a href="#/collection" className="button">Explore the wardrobe <span aria-hidden="true">↗</span></a><a href="#/consultation" className="text-link">Book a consultation</a></div></div></>;
 const photo=<picture><img src="/assets/fitelier-hero-nocturne.jpg" width="1536" height="1024" fetchPriority="high" alt="Charcoal tailoring emerging from the shadows of a dark stone atelier"/></picture>;
 return <section ref={scope} className={`hero-v3 hero-${variant}`}>
  {variant==='drift'?<animated.div className="hero-v3-side" style={{opacity:drift.opacity,transform:drift.y.to(y=>`translateY(${y}px)`)}}>{side}</animated.div>:<motion.div className="hero-v3-side" initial={variant==='depth'&&!reduce?{opacity:0,y:15}:false} animate={{opacity:1,y:0}} transition={{duration:1.6}}>{side}</motion.div>}
  <motion.div className="hero-v3-photo" style={variant==='depth'&&!reduce?{rotateX:tiltX,rotateY:tiltY}:undefined} initial={variant==='depth'&&!reduce?{opacity:.5,scale:1.035}:false} animate={{opacity:1,scale:1}} transition={{duration:2}}>
    {variant==='drift'?<animated.div className="hero-drift-image" style={{transform:drift.y.to(y=>`translateY(${-y*.4}px) scale(${1+y*.001})`)}}>{photo}</animated.div>:photo}<span className="hero-image-caption">TAILORING & KNITWEAR</span>
  </motion.div>
 </section>
}
const variants=[['signature','01 / Signature','The monogram draws into place. Cloth and lettering settle together.','GSAP'],['drift','02 / Soft arrival','A gentle spring brings the logo and photograph into balance.','React Spring'],['depth','03 / Quiet depth','A slow entrance, followed by a slight response to your cursor.','Motion']];
function Studies(){const [selected,setSelected]=useState('signature'),[replay,setReplay]=useState(0);return <><section className="motion-controls"><div><p className="eyebrow">FITELIER / OPENING STUDIES</p><h1>Three ways to <em>arrive.</em></h1></div><div className="motion-options" role="group" aria-label="Choose an opening animation">{variants.map(([id,title])=><button key={id} aria-pressed={id===selected} onClick={()=>{setSelected(id);setReplay(0)}}>{title}</button>)}<button className="replay-motion" onClick={()=>setReplay(v=>v+1)}>Replay ↻</button></div><p className="motion-description">{variants.find(v=>v[0]===selected)[2]} <span>{variants.find(v=>v[0]===selected)[3]}</span></p></section><Hero key={`${selected}-${replay}`} variant={selected}/><div className="motion-return"><a className="text-link" href="#/">Return to the landing page ↗</a></div></>}
let root;
window.FitelierHero={mount(element,studies=false){root?.unmount();root=createRoot(element);root.render(studies?<Studies/>:<Hero/>);},unmount(){root?.unmount();root=null;}};
