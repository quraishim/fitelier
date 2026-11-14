/* Fitelier bag and checkout; the Square payment redirect is enabled only by a configured server. */
(function () {
  "use strict";
  const KEY="fitelier.shopping.bag.v1",allowedSizes=new Set([44,46,48,50,52,54,56,58,60]);
  let memory=[],lastAttempt=null,checkoutBusy=false;
  const product = item => {
    const groups = {suit:window.FitelierSuits?.products,trouser:window.FitelierTrousers?.products,waistcoat:window.FitelierWaistcoats?.products};
    if (item.kind === 'jacket') {
      const names = {'navy-hopsack':'Navy Hopsack Jacket','cerulean-houndstooth':'Cerulean Houndstooth Jacket','taupe-pow':'Taupe Prince of Wales Jacket','denim-wool-silk-linen':'Denim-Effect Double-Breasted Jacket'};
      return Object.hasOwn(names,item.slug) ? {name:names[item.slug]} : undefined;
    }
    return groups[item.kind]?.find(p=>p.slug===item.slug);
  };
  const money=cents=>new Intl.NumberFormat("en-CA",{style:"currency",currency:"CAD",maximumFractionDigits:2}).format(cents/100);
  const esc=value=>String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const unitCents = item => window.FitelierOptions.priceFor(item) * 100;
  const variant = item => [
    item.ensemble === '3pc' ? 'Three-piece suit' : null,
    item.kind === 'jacket' ? 'Brown Aaron Naples' : null,
    item.kind === 'trouser' && Object.hasOwn(window.FitelierOptions.fixedPrices,item.slug) ? (item.slug === 'mid-grey' ? 'Vitale Barberis Canonico' : 'Brown Aaron') : null,
    window.FitelierOptions.cloths[item.cloth]?.name,
    item.canvas ? window.FitelierOptions.canvasName(item.canvas) : null,
  ].filter(Boolean).join(' · ');
  const sizing = item => item.kind === 'suit'
    ? ['Jacket EU '+item.jacket,'Trousers EU '+item.trousers,item.waistcoat ? 'Waistcoat EU '+item.waistcoat : null].filter(Boolean).join(' · ')
    : 'EU '+item.size;
  const itemKey = item => [item.kind,item.slug,item.ensemble,item.jacket,item.trousers,item.waistcoat,item.size,item.cloth,item.canvas].join("|");
  const productLink = item => '#/'+item.kind+'/'+item.slug+'?'+esc(new URLSearchParams(Object.fromEntries(
    Object.entries({cloth:item.cloth,canvas:item.canvas,ensemble:item.ensemble}).filter(([,value])=>value)
  )));
  function normalizeItem(row) {
    if (!row) return null;
    const kind = row.kind ?? 'suit';
    const qty = Number(row.qty);
    if (!['suit','jacket','trouser','waistcoat'].includes(kind) || !Number.isInteger(qty) || qty<1 || qty>5) return null;
    const item = {kind,slug:row.slug,qty};
    if (!product(item)) return null;
    const isFixed = Object.hasOwn(window.FitelierOptions.fixedPrices,item.slug);
    if (kind === 'trouser' && row.slug === 'chocolate-brown' && row.cloth != null) return null;
    if (!isFixed && kind !== 'jacket') {
      item.cloth = row.cloth ?? 'vbc';
      if (typeof item.cloth !== 'string' || !Object.hasOwn(window.FitelierOptions.cloths,item.cloth)) return null;
    }
    if (kind === 'suit' || kind === 'jacket') {
      item.canvas = row.canvas ?? 'half';
      if (!['half','full'].includes(item.canvas)) return null;
    }
    if (kind === 'suit') {
      item.ensemble = row.ensemble ?? '2pc';
      item.jacket = Number(row.jacket);
      item.trousers = Number(row.trousers);
      if (!['2pc','3pc'].includes(item.ensemble) || !allowedSizes.has(item.jacket) || !allowedSizes.has(item.trousers)) return null;
      if (item.ensemble === '3pc') {
        item.waistcoat = Number(row.waistcoat);
        if (!allowedSizes.has(item.waistcoat)) return null;
      }
    } else {
      item.size = Number(row.size);
      if (!allowedSizes.has(item.size)) return null;
    }
    return window.FitelierOptions.priceFor(item) === null ? null : item;
  }
  function normalize(data){
    if (!Array.isArray(data)) return [];
    const cleaned=[];
    for (const row of data.slice(0,24)) {
      const item = normalizeItem(row);
      if (!item) continue;
      const exists=cleaned.find(existing=>itemKey(existing)===itemKey(item));
      if(exists)exists.qty=Math.min(5,exists.qty+item.qty);
      else cleaned.push(item);
    }
    return cleaned.slice(0,8);
  }
  function read(){try{const raw=localStorage.getItem(KEY);return raw?normalize(JSON.parse(raw)):memory;}catch{return memory;}}
  function save(rows){memory=normalize(rows);lastAttempt=null;try{localStorage.setItem(KEY,JSON.stringify(memory));}catch{}badge();return memory;}
  function quantity(){return read().reduce((sum,x)=>sum+x.qty,0);}
  function badge(){document.querySelectorAll(".fitelier-bag-count").forEach(el=>{const n=quantity();el.textContent=String(n);el.hidden=n===0;});}
  function addItem(selection){
    const item = normalizeItem({...selection,qty:1});
    if (!item || quantity()>=20) return false;
    const bag=read(),found=bag.find(x=>itemKey(x)===itemKey(item));
    if(found && found.qty<5) found.qty++;
    else if(!found && bag.length<8) bag.push(item);
    else return false;
    save(bag);
    return true;
  }
  function add(slug,jacket,trousers,cloth,canvas,ensemble,waistcoat){
    return addItem({kind:'suit',slug,jacket,trousers,cloth,canvas,ensemble,waistcoat});
  }
  function image(item){
    const paths = {
      suit:['suit-products','main.webp'],
      trouser:['trousers','main.png'],
      waistcoat:['waistcoats','front.png'],
      jacket:['assets',item.slug==='denim-wool-silk-linen'?'full-corrected.webp':'full.webp']
    };
    const [folder, suffix] = paths[item.kind];
    return '/assets/'+folder+'/'+item.slug+'-'+suffix;
  }
  function detailLine(item){
    const p=product(item);
    if(!p)return "";
    const key=itemKey(item);
    return '<article class="fitelier-bag-item"><a href="'+productLink(item)+'" class="fitelier-bag-photo"><img src="'+image(item)+'" alt="'+esc(p.name)+'"></a>'
      +'<div class="fitelier-bag-description"><h2><a href="'+productLink(item)+'">'+esc(p.name)+'</a></h2><p>'+esc(variant(item))+'</p>'
      +'<p>'+sizing(item)+'</p><div class="fitelier-bag-controls">'
      +'<label>Quantity <select data-cart-qty="'+esc(key)+'" aria-label="Quantity for '+esc(p.name)+'">'+[1,2,3,4,5].map(n=>'<option value="'+n+'"'+(item.qty===n?' selected':'')+'>'+n+'</option>').join('')+'</select></label>'
      +'<button type="button" data-cart-remove="'+esc(key)+'">Remove</button></div></div>'
      +'<div class="fitelier-bag-item-price">'+money(unitCents(item)*item.qty)+'</div></article>';
  }
  function totals(){
    const n=quantity();
    const subtotal=read().reduce((sum,item)=>sum+unitCents(item)*item.qty,0);
    const gst=Math.round(subtotal*5/100);
    return '<div class="fitelier-bag-totals"><div><span>Subtotal ('+n+' '+(n===1?'item':'items')+')</span><strong>'+money(subtotal)+'</strong></div>'
      +'<div><span>GST (5%)</span><strong>'+money(gst)+'</strong></div>'
      +'<div><span>Total (CAD)</span><strong>'+money(subtotal+gst)+'</strong></div>'
      +'<p>Complimentary personal delivery within Edmonton, arranged with your Fitelier advisor. Please provide an Edmonton delivery address at Square checkout.</p></div>';
  }
  function empty(){
    return '<div class="fitelier-empty-bag"><h2>Your bag is empty.</h2><p>Explore a considered selection of fabrics, then choose your sizes.</p><a href="#/collection" class="button">Explore collections ↗</a></div>';
  }
  function bagPage(){
    const bag=read();
    return '<section class="section fitelier-bag-page"><div class="fitelier-bag-heading"><p class="eyebrow">FITELIER / YOUR SELECTION</p><h1>Your bag.</h1></div>'
      +(bag.length?'<div class="fitelier-bag-layout"><div class="fitelier-bag-items">'+bag.map(detailLine).join('')+'</div><aside class="fitelier-bag-summary"><img class="fitelier-bag-editorial" src="/assets/fitelier-tailoring-placeholder.webp" alt="" width="1536" height="1024"><h2>Order summary</h2>'+totals()+paymentControls()+'<a href="#/collection" class="text-link">Continue browsing</a></aside></div>':empty())
      +'</section>';
  }
  function paymentControls(){
    return '<label class="fitelier-check"><input type="checkbox" data-check-terms><span>I’ve checked my sizes and accept the <a href="#/terms">order terms</a>. Made-to-order garments are final sale except where required by law. Standard sizes may need alterations.</span></label>'
      +'<button type="button" class="button fitelier-square-button" data-checkout-square disabled>Continue to secure payment</button>'
      +'<p class="fitelier-checkout-status" role="status" aria-live="polite" data-checkout-status></p>';
  }
  async function availability(){
    const el=document.querySelector("[data-checkout-status]"),btn=document.querySelector("[data-checkout-square]");
    if(!btn||!el)return;
    try{
      const ctrl=new AbortController(),timeout=setTimeout(()=>ctrl.abort(),6000);
      let response;try{response=await fetch("/api/square-status",{signal:ctrl.signal,cache:"no-store"});}finally{clearTimeout(timeout);}
      if(!response.ok)throw Error("Not configured");
      const data=await response.json();
      if(data.ready===true){btn.disabled=checkoutBusy;btn.textContent="Continue securely with Square ↗";el.textContent="";}
      else{btn.disabled=true;btn.textContent="Square checkout not yet available";el.textContent="Online payment is being connected. Your selections remain saved in this browser. For an order now, please request a consultation.";}
    }catch{
      btn.disabled=true;btn.textContent="Square checkout not yet available";el.textContent="Online payment is being connected. Your selections remain saved in this browser. For an order now, please request a consultation.";
    }
  }
  async function beginCheckout(button){
    if(checkoutBusy)return;
    const notice=document.querySelector("[data-checkout-status]");
    const terms=document.querySelector("[data-check-terms]");
    if(!terms?.checked){
      notice.textContent="Please confirm your sizes and accept the order terms.";terms.focus();return;
    }
    const items=read();
    if(!items.length){notice.textContent="Your bag is empty.";return;}
    checkoutBusy=true;
    const bagControls=[terms,...document.querySelectorAll("[data-cart-qty],[data-cart-remove]")];
    bagControls.forEach(control=>{control.disabled=true;});
    button.disabled=true;button.textContent="Opening secure checkout…";
    if(!lastAttempt)lastAttempt=crypto.randomUUID();
    try{
      const response=await fetch("/api/square-checkout",{method:"POST",headers:{"Content-Type":"application/json","Idempotency-Key":lastAttempt},body:JSON.stringify({items,termsAccepted:true})});
      const result=await response.json().catch(()=>({}));
      if(!response.ok)throw Error(result.error||"Payment setup is unavailable. Please try again.");
      const dest=new URL(result.url);
      if(dest.protocol!=="https:"||!["square.link","sandbox.square.link","checkout.square.site"].includes(dest.hostname))throw Error("Square checkout destination was not verified.");
      notice.textContent="Transferring you securely to Square…";
      window.location.assign(dest.href);
    }catch(e){notice.textContent=e.message||"Square checkout is unavailable.";checkoutBusy=false;bagControls.forEach(control=>{control.disabled=false;});button.disabled=false;button.textContent="Continue securely with Square ↗";}
  }
  function bind(){
    badge();
    const separate = document.querySelector('[data-separate-kind]');
    if (separate) separate.addEventListener('click',()=>{
      const page = separate.closest('section');
      const size = page.querySelector('[data-separate-size]');
      const feedback = page.querySelector('[data-separate-feedback]');
      if (!size.value) {
        feedback.textContent = 'Please choose your size.';
        size.focus();
        return;
      }
      const added = addItem({
        kind:separate.dataset.separateKind,
        slug:separate.dataset.separateSlug,
        size:Number(size.value),
        cloth:page.querySelector('[data-garment-cloth]')?.value,
        canvas:page.querySelector('[data-garment-canvas]')?.value
      });
      feedback.innerHTML = added ? 'Added to your bag. <a href="#/bag">View bag ↗</a>' : 'Your bag could not be updated. Please review your bag.';
    });
    document.querySelectorAll("[data-cart-qty]").forEach(el=>el.addEventListener("change",e=>{
      const key=el.dataset.cartQty;
      const bag=read();const item=bag.find(x=>itemKey(x)===key);
      if(item){item.qty=Math.max(1,Math.min(5,20-quantity()+item.qty,Number(el.value)||1));save(bag);location.hash="#/bag";refresh();}
    }));
    document.querySelectorAll("[data-cart-remove]").forEach(el=>el.addEventListener("click",()=>{
      const key=el.dataset.cartRemove;
      save(read().filter(x=>itemKey(x)!==key));refresh();
    }));
    const checkoutButton=document.querySelector("[data-checkout-square]");
    if(checkoutButton){availability();checkoutButton.addEventListener("click",()=>beginCheckout(checkoutButton));}
  }
  function refresh(){const container=document.querySelector("#main");if(container&&location.hash==="#/bag"){container.innerHTML=bagPage();bind();}}
  window.FitelierShop={add,bagPage,bind,badge,read,unitCents};
})();
