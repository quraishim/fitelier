"use strict";

(() => {
  const shirt = {
    slug: 'white-classic',
    name: 'White Cotton Shirt',
    photos: [
      ['front', 'Full shirt'],
      ['fabric', 'Cotton fabric close-up'],
      ['collar', 'Classic collar and Fitelier label']
    ]
  };
  const photo = view => '/assets/shirts/' + shirt.slug + '-' + view + (view === 'fabric' ? '-v2.webp' : '-v4.webp');

  function cataloguePage() {
    return `<section class="section catalogue-store shirt-catalogue">
      <div class="catalogue-store-header">
        <p class="eyebrow">FITELIER / SHIRTING</p>
        <h1>Shirts</h1>
        <p>Classic shirting for tailoring and everyday wear.</p>
      </div>
      <article class="suit-card shirt-card">
        <a class="suit-card-link" href="#/shirt/${shirt.slug}">
          <div class="shirt-card-photo"><img src="${photo('front')}" alt="${shirt.name}, front view" width="1086" height="1448"></div>
          <div class="suit-card-copy"><h2>${shirt.name}</h2><p>White cotton · Classic collar</p></div>
        </a>
      </article>
      <a class="text-link catalogue-back" href="#/collection">← All collections</a>
    </section>`;
  }

  function productPage(slug) {
    if (slug !== shirt.slug) return '<section class="section"><h1>Shirt not found.</h1><a href="#/catalogue/shirts">Back to shirts ↗</a></section>';
    return `<section class="section suit-product-page shirt-product-page">
      <nav class="suit-breadcrumb" aria-label="Breadcrumb"><a href="#/collection">Collections</a> / <a href="#/catalogue/shirts">Shirts</a> / ${shirt.name}</nav>
      <div class="suit-product-layout">
        <div class="suit-gallery" aria-label="Shirt photographs">
          <div class="suit-gallery-stage" tabindex="0" aria-label="Use the left and right arrow keys to view photographs">
            <img data-shirt-stage src="${photo('front')}" alt="${shirt.name}, front view" width="1086" height="1448">
          </div>
          <div class="suit-gallery-thumbnails" role="group" aria-label="Choose photograph">
            ${shirt.photos.map(([view,label],i)=>`<button type="button" data-shirt-photo aria-label="${label}" aria-pressed="${i===0}" class="${i===0?'is-active':''}"><img src="${photo(view)}" alt=""></button>`).join('')}
          </div>
        </div>
        <div class="suit-product-details">
          <p class="eyebrow">SHIRTING / MADE TO ORDER</p>
          <h1>${shirt.name}</h1>
          <p class="suit-product-intro">A crisp white shirt with a classic point collar. Wear it with a tie under a suit or open at the neck with a separate jacket.</p>
          <dl class="suit-facts">
            <div><dt>Cloth</dt><dd>White cotton</dd></div>
            <div><dt>Collar</dt><dd>Classic point</dd></div>
            <div><dt>Cuff</dt><dd>Single-button cuff</dd></div>
          </dl>
          ${window.FitelierOptions.guidance('Shirt')}
        </div>
      </div>
    </section>`;
  }

  function bind() {
    const image = document.querySelector('[data-shirt-stage]');
    if (!image) return;
    const stage = image.parentElement;
    const buttons = [...stage.parentElement.querySelectorAll('[data-shirt-photo]')];
    let current = 0;
    function select(index) {
      current = (index + buttons.length) % buttons.length;
      const [view,label] = shirt.photos[current];
      image.src = photo(view);
      image.alt = shirt.name + ' · ' + label;
      buttons.forEach((button,i)=>{
        button.setAttribute('aria-pressed',String(i===current));
        button.classList.toggle('is-active',i===current);
      });
    }
    buttons.forEach((button,i)=>button.addEventListener('click',()=>select(i)));
    stage.addEventListener('keydown',event=>{
      if (!['ArrowLeft','ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      select(current + (event.key==='ArrowRight'?1:-1));
    });
    let startX, startY;
    stage.addEventListener('touchstart',event=>{
      ({clientX:startX,clientY:startY}=event.changedTouches[0]);
    },{passive:true});
    stage.addEventListener('touchend',event=>{
      const {clientX,clientY}=event.changedTouches[0];
      const dx=clientX-startX;
      if (Math.abs(dx)>40 && Math.abs(dx)>Math.abs(clientY-startY)) select(current+(dx<0?1:-1));
      startX=startY=undefined;
    },{passive:true});
  }

  window.FitelierShirts = {cataloguePage,productPage,bind};
})();
