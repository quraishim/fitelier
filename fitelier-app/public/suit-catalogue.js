/* Fitelier suit catalogue: editorial digital renders, not finished-garment photographs. */
(function () {
  "use strict";
  const base = "/assets/suit-products/";
  const products = [
    {slug:"charcoal-wool",name:"Charcoal Wool Suit",season:"Four Seasons",ref:"227704",weight:"260–270 g/m",composition:"100% Wool",description:"A versatile charcoal worsted wool, intended for year-round wear."},
    {slug:"navy-wool",name:"Navy Wool Suit",season:"Four Seasons",ref:"227730",weight:"260–270 g/m",composition:"100% Wool",description:"A deep navy worsted wool for a considered everyday wardrobe."},
    {slug:"brown-wool",name:"Chocolate Brown Wool Suit",season:"Four Seasons",ref:"227748",weight:"260–270 g/m",composition:"100% Wool",description:"A deep chocolate brown wool with a restrained, clean finish."},
    {slug:"black-wool",name:"Black Wool Suit",season:"Four Seasons",ref:"227796",weight:"370 g/m",composition:"100% Wool",description:"A classic black wool suit with a clean, minimal presentation."},

  ];
  const sizes=[44,46,48,50,52,54,56,58,60];
  const jacketSpecs=[
    ["Centre back",[74.1,75,76,77,78,79,80,81,82]],
    ["Sleeve length",[62.3,63.3,64.3,65.3,66.3,67.3,68.3,69.3,70.3]],
    ["½ chest",[48.1,50.1,52,54,56,57.9,60.4,62.8,65.3]],
    ["½ waist (closed)",[43.1,45,47,49,51,53,55.4,57.9,60.4]],
    ["½ hip",[48.3,50.3,52.3,54.3,56.2,58.2,60.7,63.2,65.6]],
    ["Shoulder to shoulder",[42.1,43.1,44.1,45,46,47,48,49,50]]
  ];
  const trouserSpecs=[
    ["½ waist",[40,42,44,46,48,50,52.5,55,57.5]],
    ["½ seat",[48.1,50,51.8,53.7,55.6,57.4,59.8,62.1,64.5]],
    ["½ thigh",[30.5,31.6,32.6,33.7,34.8,35.9,37.2,38.5,39.8]],
    ["½ knee",[20.4,21.2,22,22.8,23.6,24.4,25.1,25.9,26.7]],
    ["½ hem",[19.5,20,20.5,21,21.5,22,22.5,23,23.5]],
    ["Inside leg",[81,83,85,86,87,88,89,90,91]],
    ["Outside leg",[98.4,100.9,103.3,104.8,106.3,107.9,109.4,110.9,112.4]]
  ];
  function esc(v){return String(v).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
  function image(p,kind){return base+p.slug+"-"+kind+".webp";}
  function card(p){
    return '<article class="suit-card" data-season="'+esc(p.season)+'">'
      +'<a class="suit-card-link" href="#/suit/'+p.slug+'" aria-label="Explore '+esc(p.name)+'">'
      +'<div class="suit-card-visual" data-suit-hover>'
      +'<img class="suit-card-photo" src="'+image(p,"main")+'" alt="'+esc(p.name)+' jacket with folded matching trousers" loading="lazy" data-main="'+image(p,"main")+'" data-fabric="'+image(p,"fabric")+'" data-lapel="'+image(p,"lapel")+'">'
      +'</div>'
      +'<div class="suit-card-copy"><h3>'+esc(p.name)+'</h3><p>'+esc(p.season)+' · '+esc(p.composition)+'</p><p class="suit-card-price">$895 CAD</p></div>'
      +'</a></article>';
  }
  function cataloguePage(){
    return '<section class="catalogue-store section suit-catalogue">'
      +'<div class="catalogue-store-header"><p class="eyebrow">FITELIER / MADE TO ORDER</p><h1>Suits</h1><p>Your complete silhouette.</p></div>'
      +'<div class="catalogue-store-layout"><aside class="catalogue-filter suit-filter" aria-label="Suit filters">'
      +'<p class="eyebrow">THE COLLECTION</p>'
      +'<button type="button" class="suit-filter-all is-selected" data-suit-filter="All" aria-pressed="true">All Suits <span>4</span></button>'
      +'<details class="suit-season-details" open><summary>By season</summary><div class="suit-season-options">'
      +'<button type="button" data-suit-filter="Four Seasons" aria-pressed="false">Four Seasons <span>4</span></button>'
      +'<button type="button" disabled title="Seasonal collection coming later">Fall / Winter <span>Soon</span></button>'
      +'<button type="button" disabled title="Seasonal collection coming later">Spring / Summer <span>Soon</span></button>'
      +'</div></details></aside><div class="catalogue-products suit-products">'
      +products.map(card).join('')
      +'<div class="suit-catalogue-note"><p>A starting point, not the whole collection. Our fabric selection and customization options go far beyond what is shown here.</p><a class="text-link" href="#/consultation">Explore the possibilities with an advisor ↗</a></div>'
      +'</div></div><a class="text-link catalogue-back" href="#/collection">← All collections</a></section>';
  }
  function guideTable(rows,title){
    return '<div class="suit-guide-table-wrap"><table class="suit-guide-table"><caption>'+title+' · finished garment, cm</caption><thead><tr><th scope="col">Measurement</th>'
      +sizes.map(function(s){return '<th scope="col">'+s+'</th>';}).join('')
      +'</tr></thead><tbody>'+rows.map(function(row){return '<tr><th scope="row">'+esc(row[0])+'</th>'
      +row[1].map(function(v){return '<td>'+v+'</td>';}).join('')+'</tr>';}).join('')+'</tbody></table></div>';
  }
  function sizeGuide(){
    return '<dialog class="suit-size-dialog" id="suit-size-dialog" aria-labelledby="suit-size-title">'
      +'<div class="suit-dialog-head"><div><p class="eyebrow">FITELIER / SIZE GUIDE</p><h2 id="suit-size-title">Find your fit.</h2></div><button type="button" data-suit-close aria-label="Close size guide">×</button></div>'
      +'<p>Our online sizes run from EU 44–60. Select a sizing system below to view approximate equivalents. The EU size and the finished garment measurements are authoritative.</p>'
      +'<div class="suit-size-switch" role="group" aria-label="Sizing system"><button type="button" data-sizing="EU" aria-pressed="true">European</button><button type="button" data-sizing="US" aria-pressed="false">American</button><button type="button" data-sizing="Letter" aria-pressed="false">XS–XXXL</button></div>'
      +'<div class="suit-size-equivalents" data-suit-equivalents></div>'
      +guideTable(jacketSpecs,"Jacket")+guideTable(trouserSpecs,"Trousers")
      +'<p class="suit-guide-disclaimer">These figures are finished garment measurements, not body measurements. ½ measurements are measured flat. US and letter equivalents vary between makers; if sizing is uncertain, we recommend a personal fitting.</p>'
      +'<a class="text-link" href="#/consultation">Unsure? Ask one of us ↗</a></dialog>';
  }
  function selectSizes(label,type){
    return '<label class="suit-size-select">'+label+'<select aria-label="'+type+' EU size"><option value="">Choose EU size</option>'
       +sizes.map(function(s){return '<option value="'+s+'">EU '+s+'</option>';}).join('')+'</select></label>';
  }
  function productPage(slug){
    const p=products.find(function(item){return item.slug===slug;});
    if(!p)return '<section class="section suit-product-missing"><h1>Suit not found.</h1><a class="text-link" href="#/catalogue/suits">Back to suits</a></section>';
    const pics=[["main","Full suit"],["fabric","Fabric close-up"],["lapel","Lapel detail"]];
    return '<section class="section suit-product-page"><nav class="suit-breadcrumb" aria-label="Breadcrumb"><a href="#/collection">Collections</a> / <a href="#/catalogue/suits">Suits</a> / '+esc(p.name)+'</nav>'
      +'<div class="suit-product-layout"><div class="suit-gallery" aria-label="Product photographs">'
      +'<div class="suit-gallery-stage" tabindex="0" aria-label="Use left and right arrow keys to explore images"><img src="'+image(p,"main")+'" alt="'+esc(p.name)+': full suit view" data-suit-gallery-stage></div>'
      +'<div class="suit-gallery-thumbnails" role="group" aria-label="Choose photograph">'+pics.map(function(x,i){return '<button type="button" aria-label="'+x[1]+'" data-suit-photo="'+i+'" class="'+(i===0?'is-active':'')+'" aria-pressed="'+(i===0?'true':'false')+'"><img src="'+image(p,x[0])+'" alt=""></button>';}).join('')+'</div></div>'
      +'<div class="suit-product-details"><p class="eyebrow">'+esc(p.season)+' / MADE TO ORDER</p><h1>'+esc(p.name)+'</h1><p class="suit-product-price">$895 CAD</p><p class="suit-product-intro">'+esc(p.description)+'</p>'
      +'<dl class="suit-facts"><div><dt>Mill</dt><dd>Vitale Barberis Canonico</dd></div><div><dt>Fabric origin</dt><dd>Italy</dd></div><div><dt>Composition</dt><dd>'+esc(p.composition)+'</dd></div><div><dt>Weight</dt><dd>'+esc(p.weight)+'</dd></div></dl>'
      +'<div class="suit-sizing"><p class="eyebrow">STANDARD SIZING / EU 44–60</p><div class="suit-size-separates">'+selectSizes("Jacket","Jacket")+selectSizes("Trousers","Trouser")+'</div>'
      +'<button type="button" class="suit-sizeguide-trigger" data-suit-open>Unsure about your size? ↗</button><p>Jacket and trouser sizes may be selected separately. Standard sizing may require alterations.</p></div>'
      +'<div class="suit-order-note"><p><strong>Made specifically for your order.</strong> Every suit is produced after the order is placed. Orders are final sale for changes of mind or size selection, except where required by applicable law. Standard sizes may require alterations.</p><p>For clients local to Edmonton, Fitelier provides complimentary fit alterations within the scope of our alterations policy.</p></div>'
      +'<button type="button" class="button suit-add-to-bag" data-suit-add="'+esc(p.slug)+'">Add to bag <span aria-hidden="true">↗</span></button><p class="suit-add-feedback" role="status" aria-live="polite" data-suit-add-feedback></p>'
      +'<a class="text-link suit-consult-cta" href="#/consultation">Explore this suit with an advisor ↗</a>'
      +'<div class="suit-guidance"><h2>Looking for something more?</h2><p>If &quot;standard&quot; sizing isn&#39;t standard for you, you typically require alterations, or you would simply prefer a more personal approach, we got you covered. Fitelier will work from your measurements and consider cloths/details beyond this selection.</p><a class="text-link" href="#/consultation">Unsure? Ask one of us ↗</a></div>'
      +'</div></div>'+sizeGuide()+'</section>';
  }
  function bind(){
    const cards=document.querySelectorAll(".suit-card-visual");
    cards.forEach(function(visual){
      const img=visual.querySelector("img");
      let last="main";
      function swap(kind){
        if(kind===last)return;
        last=kind;
        img.classList.add("changing");
        img.src=img.dataset[kind];
        requestAnimationFrame(function(){requestAnimationFrame(function(){img.classList.remove("changing");});});
      }
      visual.addEventListener("pointermove",function(e){
        if(e.pointerType!=="mouse"&&e.pointerType!=="pen")return;
        const r=visual.getBoundingClientRect();
        swap(e.clientX-r.left<r.width/2?"fabric":"lapel");
      });
      visual.addEventListener("pointerleave",function(){swap("main");});
      visual.addEventListener("pointercancel",function(){swap("main");});
      img.addEventListener("error",function(){if(!img.dataset.failed){img.dataset.failed="1";img.src="/assets/suits.webp";}});
    });
    const buttons=document.querySelectorAll("[data-suit-filter]");
    buttons.forEach(function(b){b.addEventListener("click",function(){
      const mode=b.dataset.suitFilter;
      document.querySelectorAll(".suit-card").forEach(function(card){card.hidden=mode!=="All"&&card.dataset.season!==mode;});
      buttons.forEach(function(other){const active=other===b;other.setAttribute("aria-pressed",String(active));other.classList.toggle("is-selected",active);});
    });});
    const gallery=document.querySelector(".suit-gallery");
    if(gallery){
      const p=products.find(function(item){return location.hash.indexOf("#/suit/"+item.slug)===0;});
      if(p){
        const stage=gallery.querySelector("[data-suit-gallery-stage]");
        const thumbs=Array.from(gallery.querySelectorAll("[data-suit-photo]"));
        const types=["main","fabric","lapel"];
        let active=0;
        function show(i){
          active=(i+types.length)%types.length;
          stage.src=image(p,types[active]);
          stage.alt=p.name+": "+["full suit view","fabric close-up","lapel stitching detail"][active];
          thumbs.forEach(function(b,j){b.classList.toggle("is-active",active===j);b.setAttribute("aria-pressed",String(active===j));});
        }
        thumbs.forEach(function(b,i){b.addEventListener("click",function(){show(i);});});
        gallery.querySelector(".suit-gallery-stage").addEventListener("keydown",function(e){if(e.key==="ArrowRight"||e.key==="ArrowLeft"){e.preventDefault();show(active+(e.key==="ArrowRight"?1:-1));}});
        let startX=null;
        gallery.querySelector(".suit-gallery-stage").addEventListener("touchstart",function(e){startX=e.changedTouches[0].screenX;},{passive:true});
        gallery.querySelector(".suit-gallery-stage").addEventListener("touchend",function(e){if(startX===null)return;const d=e.changedTouches[0].screenX-startX;if(Math.abs(d)>45)show(active+(d<0?1:-1));startX=null;},{passive:true});
        stage.addEventListener("error",function(){if(!stage.dataset.failed){stage.dataset.failed="1";stage.src="/assets/suits.webp";}});
      }
    }
    const addButton=document.querySelector('[data-suit-add]');
    if(addButton){addButton.addEventListener('click',function(){
      const select=Array.from(document.querySelectorAll('.suit-size-separates select'));
      const feedback=document.querySelector('[data-suit-add-feedback]');
      if(select.some(function(el){return !el.value;})){feedback.textContent='Please choose both jacket and trouser sizes.';select.find(function(el){return !el.value;})?.focus();return;}
      const ok=window.FitelierShop?.add(addButton.dataset.suitAdd,Number(select[0].value),Number(select[1].value));
      feedback.innerHTML=ok?'Added to your bag. <a href="#/bag">View bag ↗</a>':'Your bag could not be updated. Please try again.';
    });}
    const dialog=document.getElementById("suit-size-dialog");
    if(dialog){
      const out=dialog.querySelector("[data-suit-equivalents]");
      const refs={EU:sizes.map(String),US:sizes.map(function(s){return String(s-10);}),Letter:["XS","S","S/M","M","L","L/XL","XL","XXL","XXXL"]};
      function setSystem(type){
        out.innerHTML=sizes.map(function(s,i){return '<span><b>'+refs[type][i]+'</b><small>EU '+s+'</small></span>';}).join("");
        dialog.querySelectorAll("[data-sizing]").forEach(function(b){b.setAttribute("aria-pressed",String(b.dataset.sizing===type));});
      }
      setSystem("EU");
      dialog.querySelectorAll("[data-sizing]").forEach(function(b){b.addEventListener("click",function(){setSystem(b.dataset.sizing);});});
      document.querySelector("[data-suit-open]")?.addEventListener("click",function(){dialog.showModal();});
      dialog.querySelector("[data-suit-close]").addEventListener("click",function(){dialog.close();});
      dialog.addEventListener("click",function(e){if(e.target===dialog)dialog.close();});
    }
  }
  window.FitelierSuits={products:products,cataloguePage:cataloguePage,productPage:productPage,bind:bind};
})();
