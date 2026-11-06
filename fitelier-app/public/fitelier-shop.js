/* Fitelier bag and checkout; the Square payment redirect is enabled only by a configured server. */
(function () {
  "use strict";
  const KEY="fitelier.shopping.bag.v1",unitCents=89500,allowedSizes=new Set([44,46,48,50,52,54,56,58,60]);
  let memory=[],lastAttempt=null,checkoutBusy=false;
  const products=()=>window.FitelierSuits?.products||[];
  const money=cents=>new Intl.NumberFormat("en-CA",{style:"currency",currency:"CAD",maximumFractionDigits:2}).format(cents/100);
  const esc=value=>String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  function normalize(data){
    if(!Array.isArray(data))return [];
    const cleaned=[];
    for(const row of data.slice(0,24)){
      if(!row||!products().some(p=>p.slug===row.slug))continue;
      const jacket=Number(row.jacket),trousers=Number(row.trousers),qty=Number(row.qty);
      if(!allowedSizes.has(jacket)||!allowedSizes.has(trousers)||!Number.isInteger(qty)||qty<1||qty>5)continue;
      const exists=cleaned.find(item=>item.slug===row.slug&&item.jacket===jacket&&item.trousers===trousers);
      if(exists)exists.qty=Math.min(5,exists.qty+qty);
      else cleaned.push({slug:row.slug,jacket,trousers,qty});
    }
    return cleaned.slice(0,8);
  }
  function read(){try{const raw=localStorage.getItem(KEY);return raw?normalize(JSON.parse(raw)):memory;}catch{return memory;}}
  function save(rows){memory=normalize(rows);lastAttempt=null;try{localStorage.setItem(KEY,JSON.stringify(memory));}catch{}badge();return memory;}
  function quantity(){return read().reduce((sum,x)=>sum+x.qty,0);}
  function badge(){document.querySelectorAll(".fitelier-bag-count").forEach(el=>{const n=quantity();el.textContent=String(n);el.hidden=n===0;});}
  function add(slug,jacket,trousers){
    if(!products().some(x=>x.slug===slug)||!allowedSizes.has(jacket)||!allowedSizes.has(trousers))return false;
    const bag=read(),found=bag.find(x=>x.slug===slug&&x.jacket===jacket&&x.trousers===trousers);
    if(found)found.qty=Math.min(5,found.qty+1);else if(bag.length<8)bag.push({slug,jacket,trousers,qty:1});else return false;
    save(bag);return true;
  }
  function image(item){return "/assets/suit-products/"+item.slug+"-main.webp";}
  function detailLine(item){
    const p=products().find(p=>p.slug===item.slug);
    if(!p)return "";
    const key=item.slug+"|"+item.jacket+"|"+item.trousers;
    return '<article class="fitelier-bag-item"><a href="#/suit/'+p.slug+'" class="fitelier-bag-photo"><img src="'+image(item)+'" alt="'+esc(p.name)+'"></a>'
      +'<div class="fitelier-bag-description"><h2><a href="#/suit/'+p.slug+'">'+esc(p.name)+'</a></h2><p>Made to order · Four Seasons · 100% Wool</p>'
      +'<p>Jacket EU '+item.jacket+' · Trousers EU '+item.trousers+'</p><div class="fitelier-bag-controls">'
      +'<label>Quantity <select data-cart-qty="'+esc(key)+'" aria-label="Quantity for '+esc(p.name)+'">'+[1,2,3,4,5].map(n=>'<option value="'+n+'"'+(item.qty===n?' selected':'')+'>'+n+'</option>').join('')+'</select></label>'
      +'<button type="button" data-cart-remove="'+esc(key)+'">Remove</button></div></div>'
      +'<div class="fitelier-bag-item-price">'+money(unitCents*item.qty)+'</div></article>';
  }
  function totals(){
    const n=quantity();
    return '<div class="fitelier-bag-totals"><div><span>Subtotal ('+n+' '+(n===1?'suit':'suits')+')</span><strong>'+money(n*unitCents)+'</strong></div>'
      +'<p>CAD · Taxes and any applicable delivery charges are calculated during secure checkout. Order details and your final total will be displayed before payment.</p></div>';
  }
  function empty(){
    return '<div class="fitelier-empty-bag"><h2>Your bag is empty.</h2><p>Explore a considered selection of fabrics, then choose your jacket and trouser sizes.</p><a href="#/collection" class="button">Explore collections ↗</a></div>';
  }
  function bagPage(){
    const bag=read();
    return '<section class="section fitelier-bag-page"><div class="fitelier-bag-heading"><p class="eyebrow">FITELIER / YOUR SELECTION</p><h1>Your bag.</h1></div>'
      +(bag.length?'<div class="fitelier-bag-layout"><div class="fitelier-bag-items">'+bag.map(detailLine).join('')+'</div><aside class="fitelier-bag-summary"><h2>Order summary</h2>'+totals()+'<a href="#/checkout" class="button">Continue to checkout ↗</a><a href="#/catalogue/suits" class="text-link">Continue browsing</a></aside></div>':empty())
      +'</section>';
  }
  function checkoutPage(){
    const bag=read();
    return '<section class="section fitelier-checkout-page"><p class="eyebrow">FITELIER / CHECKOUT</p><h1>Review your order.</h1>'
      +(bag.length?'<div class="fitelier-checkout-layout"><div class="fitelier-checkout-terms"><h2>Made to order, for you.</h2>'
      +'<p>These garments are made only after you place your order, not drawn from existing stock. Please review your sizes and the terms below before proceeding to Square.</p>'
      +'<label class="fitelier-check"><input type="checkbox" data-check-final> <span>I understand that made-to-order purchases cannot be returned or exchanged for a change of mind, personal preference or incorrect size selection, except where required by law.</span></label>'
      +'<label class="fitelier-check"><input type="checkbox" data-check-size> <span>I have reviewed the size guide, selected my jacket and trouser sizes, and understand that standard sizing may require alterations. Complimentary fit alterations are available locally in Edmonton, within Fitelier’s alterations policy.</span></label>'
      +'<p class="fitelier-checkout-note">We would love to help make this easier. If you are unsure about fit, <a href="#/consultation">ask one of us</a> before placing your order.</p>'
      +'<h3>Secure payment</h3><p>Once enabled, your payment will be processed on Square’s secure checkout page. Fitelier does not collect card details on this website.</p>'
      +'<button type="button" class="button fitelier-square-button" data-checkout-square disabled>Connecting Square checkout…</button>'
      +'<p class="fitelier-checkout-status" role="status" aria-live="polite" data-checkout-status>Checking payment availability.</p>'
      +'</div><aside class="fitelier-bag-summary"><h2>Order summary</h2><div class="fitelier-checkout-lines">'
      +bag.map(item=>{const p=products().find(x=>x.slug===item.slug);return '<div><span>'+esc(p?.name||"Suit")+' × '+item.qty+'<small>EU '+item.jacket+' jacket / EU '+item.trousers+' trousers</small></span><b>'+money(unitCents*item.qty)+'</b></div>';}).join('')
      +'</div>'+totals()+'<a href="#/bag" class="text-link">Edit your bag</a></aside></div>':empty())+'</section>';
  }
  function parseKey(key){const p=String(key).split("|");if(p.length!==3)return null;return {slug:p[0],jacket:Number(p[1]),trousers:Number(p[2])};}
  async function availability(){
    const el=document.querySelector("[data-checkout-status]"),btn=document.querySelector("[data-checkout-square]");
    if(!btn||!el)return;
    try{
      const ctrl=new AbortController(),timeout=setTimeout(()=>ctrl.abort(),6000);
      let response;try{response=await fetch("/api/square-status",{signal:ctrl.signal,cache:"no-store"});}finally{clearTimeout(timeout);}
      if(!response.ok)throw Error("Not configured");
      const data=await response.json();
      if(data.ready===true){btn.disabled=false;btn.textContent="Continue securely with Square ↗";el.textContent="Secure checkout is available. Review and accept both terms before continuing.";}
      else{btn.disabled=true;btn.textContent="Square checkout not yet available";el.textContent="Online payment is being connected. Your selections remain saved in this browser. For an order now, please request a consultation.";}
    }catch{
      btn.disabled=true;btn.textContent="Square checkout not yet available";el.textContent="Online payment is being connected. Your selections remain saved in this browser. For an order now, please request a consultation.";
    }
  }
  async function beginCheckout(button){
    if(checkoutBusy)return;
    const notice=document.querySelector("[data-checkout-status]");
    if(!document.querySelector("[data-check-final]")?.checked||!document.querySelector("[data-check-size]")?.checked){
      notice.textContent="Please review and acknowledge both made-to-order and sizing statements.";return;
    }
    const items=read();
    if(!items.length){notice.textContent="Your bag is empty.";return;}
    checkoutBusy=true;button.disabled=true;button.textContent="Opening secure checkout…";
    if(!lastAttempt)lastAttempt=crypto.randomUUID();
    try{
      const response=await fetch("/api/square-checkout",{method:"POST",headers:{"Content-Type":"application/json","Idempotency-Key":lastAttempt},body:JSON.stringify({items,termsAccepted:true})});
      const result=await response.json().catch(()=>({}));
      if(!response.ok)throw Error(result.error||"Payment setup is unavailable. Please try again.");
      const dest=new URL(result.url);
      if(dest.protocol!=="https:"||!["square.link","sandbox.square.link","checkout.square.site"].includes(dest.hostname))throw Error("Square checkout destination was not verified.");
      notice.textContent="Transferring you securely to Square…";
      window.location.assign(dest.href);
    }catch(e){notice.textContent=e.message||"Square checkout is unavailable.";checkoutBusy=false;button.disabled=false;button.textContent="Continue securely with Square ↗";}
  }
  function bind(){
    badge();
    document.querySelectorAll("[data-cart-qty]").forEach(el=>el.addEventListener("change",e=>{
      const key=parseKey(el.dataset.cartQty);if(!key)return;
      const bag=read();const item=bag.find(x=>x.slug===key.slug&&x.jacket===key.jacket&&x.trousers===key.trousers);
      if(item){item.qty=Math.max(1,Math.min(5,Number(el.value)||1));save(bag);location.hash="#/bag";refresh();}
    }));
    document.querySelectorAll("[data-cart-remove]").forEach(el=>el.addEventListener("click",()=>{
      const key=parseKey(el.dataset.cartRemove);if(!key)return;
      save(read().filter(x=>!(x.slug===key.slug&&x.jacket===key.jacket&&x.trousers===key.trousers)));refresh();
    }));
    const checkoutButton=document.querySelector("[data-checkout-square]");
    if(checkoutButton){availability();checkoutButton.addEventListener("click",()=>beginCheckout(checkoutButton));}
  }
  function refresh(){const container=document.querySelector("#main");if(container&&location.hash==="#/bag"){container.innerHTML=bagPage();bind();}}
  window.FitelierShop={add,bagPage,checkoutPage,bind,badge,read,unitCents};
})();
