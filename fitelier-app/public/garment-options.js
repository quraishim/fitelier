"use strict";

(() => {
  const cloths = {
    essentials: { name: "Fitelier Essentials", composition: "100% Super 110s wool", suit: 695, trousers: 195, waistcoat: 225, threePiece: 795 },
    vbc: { name: "VBC Perennial", composition: "100% Super 110s wool", mill: "Vitale Barberis Canonico", suit: 1195, trousers: 365, waistcoat: 415, threePiece: 1495 }
  };
  const fullCanvas = 220;
  const fixedPrices = {
  'off-white': 265,
  'chocolate-brown': 195,
  'mid-grey': 265,
  'navy-hopsack': 795,
  'cerulean-houndstooth': 795,
  'taupe-pow': 795,
  'denim-wool-silk-linen': 845,
};
  const sizes = [44,46,48,50,52,54,56,58,60];
  const sizePicker = (label, attribute) => `<label class="suit-size-select">${label}<select ${attribute}><option value="">Choose EU size</option>${sizes.map(size => `<option value="${size}">EU ${size}</option>`).join('')}</select></label>`;
  const purchase = (kind, slug) => `<button type="button" class="button suit-add-to-bag" data-separate-kind="${kind}" data-separate-slug="${slug}">Add to bag <span aria-hidden="true">↗</span></button><p role="status" data-separate-feedback></p>`;
  function priceFor(item) {
    const cloth = cloths[item.cloth];
    if (['off-white','mid-grey'].includes(item.slug) && !Object.hasOwn(fixedPrices,item.slug)) return null;
    const base = item.kind === 'suit'
      ? cloth[item.ensemble === '3pc' ? 'threePiece' : 'suit']
      : fixedPrices[item.slug] ?? cloth?.[item.kind === 'trouser' ? 'trousers' : item.kind];
    return Number.isFinite(base) ? base + (item.canvas === 'full' ? fullCanvas : 0) : null;
  }
  const money = amount => '$' + amount.toLocaleString('en-CA') + ' CAD';
  const query = () => new URLSearchParams(location.hash.split('?')[1]);
  const selectedCloth = () => query().get('cloth') === 'vbc' ? 'vbc' : 'essentials';
  const canvasName = canvas => canvas === 'full' ? 'Full canvas' : 'Half canvas';
  const suitPrice = (cloth, canvas) => cloths[cloth].suit + (canvas === 'full' ? fullCanvas : 0);

  const clothFacts = '<dl class="suit-facts" data-cloth-facts></dl><p class="fineprint">Photos illustrate colour and styling. Fabric texture may vary by cloth.</p>';
  function canvasPicker(canvas) {
    return `<label class="suit-size-select">Construction<select data-garment-canvas>
      <option value="half"${canvas === 'half' ? ' selected' : ''}>Half canvas</option>
      <option value="full"${canvas === 'full' ? ' selected' : ''}>Full canvas (+$220)</option>
    </select></label>`;
  }

  function options(garment, weight, waistcoat) {
    const jacket = garment === 'jacket';
    const suit = garment === 'suit';
    const cloth = selectedCloth();
    const isThreePiece = query().get('ensemble') === '3pc';
    const canvas = query().get('canvas') === 'full' ? 'full' : 'half';
    return `<div class="garment-options" data-garment-options="${garment}" data-weight="${weight || ''}" data-matching-waistcoat="${waistcoat || ''}">
      ${jacket ? '' : `<p class="suit-product-price" data-garment-price aria-live="polite"></p>`}
      <div class="garment-selects">
      ${suit ? `<label class="suit-size-select">Suit style<select data-suit-ensemble>
        <option value="2pc">Two-piece suit</option>
        <option value="3pc"${isThreePiece ? ' selected' : ''}>Three-piece suit</option>
      </select></label>` : ''}
      ${jacket ? '' : `<label class="suit-size-select">Cloth<select data-garment-cloth>
        ${Object.entries(cloths).map(([key, value]) => `<option value="${key}"${key === cloth ? ' selected' : ''}>${value.name}</option>`).join('')}
      </select></label>`}
      ${jacket ? canvasPicker(canvas) : ''}
      </div>
      ${suit ? `<a class="text-link matching-waistcoat-link" data-matching-waistcoat-link${isThreePiece ? '' : ' hidden style="display:none"'} href="#/waistcoat/${waistcoat}?cloth=${cloth}">View matching waistcoat ↗</a>
      <details class="suit-configuration-details"${canvas === 'full' ? ' open' : ''}>
        <summary>Cloth &amp; construction details <span data-canvas-summary></span></summary>
        <div class="suit-configuration-content">${canvasPicker(canvas)}${clothFacts}</div>
      </details>` : jacket ? '' : clothFacts}
    </div>`;
  }

  function guidance(garment) {
    const labels = {Suit:'this suit', Jacket:'this jacket', Trousers:'these trousers', Waistcoat:'this waistcoat', Shirt:'this shirt'};
    return `<div class="suit-guidance"><h2>Looking for something more?</h2><p>If standard sizing isn’t standard for you, you typically require alterations, or you’d prefer a more personal approach, we’ve got you covered. We can work from your measurements and explore fabrics and details beyond this selection.</p><a class="text-link" href="#/consultation?garment=${garment}">Explore ${labels[garment]} with an advisor ↗</a></div>`;
  }

  function bindGalleryArrows() {
    const gallery = document.querySelector('.suit-product-page .suit-gallery');
    if (!gallery) return;
    const stage = gallery.querySelector('.suit-gallery-stage');
    const photos = [...gallery.querySelectorAll('.suit-gallery-thumbnails button')];
    if (!stage || photos.length < 2) return;
    for (const [direction, label, glyph] of [[-1,'Previous photograph','←'],[1,'Next photograph','→']]) {
      const arrow = document.createElement('button');
      arrow.type = 'button';
      arrow.className = 'product-gallery-arrow '+(direction < 0 ? 'product-gallery-prev' : 'product-gallery-next');
      arrow.setAttribute('aria-label',label);
      arrow.textContent = glyph;
      arrow.addEventListener('click',()=> {
        const current = photos.findIndex(photo=>photo.getAttribute('aria-pressed') === 'true');
        photos[(current + direction + photos.length) % photos.length].click();
      });
      stage.append(arrow);
    }
  }

  function bind() {
    bindGalleryArrows();
    const panel = document.querySelector('[data-garment-options]');
    if (!panel) return;
    const { garmentOptions: garment, weight, matchingWaistcoat } = panel.dataset;
    const clothSelect = panel.querySelector('[data-garment-cloth]');
    const canvasSelect = panel.querySelector('[data-garment-canvas]');
    function update() {
      const canvas = canvasSelect?.value || 'half';
      if (garment === 'jacket') {
        const price = document.querySelector('[data-jacket-price]');
        if (price) price.textContent = money(priceFor({kind:'jacket',slug:panel.closest('section').dataset.jacketSlug,canvas}));
        const link = document.querySelector('.jacket-product-page .suit-guidance a');
        link.href = '#/consultation?' + new URLSearchParams({garment:'Jacket', canvas, product:document.querySelector('.jacket-product-page h1').textContent});
        return;
      }
      const canvasSummary = panel.querySelector('[data-canvas-summary]');
      if (canvasSummary) canvasSummary.textContent = canvasName(canvas);
      const key = clothSelect.value;
      const cloth = cloths[key];
      const ensemble = panel.closest('section').querySelector('[data-suit-ensemble]')?.value;
      const price = garment === 'suit' ? priceFor({kind:'suit',cloth:key,canvas,ensemble}) : cloth[garment];
      panel.querySelector('[data-garment-price]').textContent = money(price);
      const facts = [['Composition', cloth.composition]];
      if (cloth.mill) facts.push(['Mill', cloth.mill]);
      if (key === 'vbc' && weight) facts.push(['Weight', weight]);
      panel.querySelector('[data-cloth-facts]').innerHTML = facts.map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join('');
      const link = document.querySelector('.trouser-product-page .suit-guidance a, .waistcoat-product-page a[href^="#/consultation"]');
      if (link) {
        const garmentName = garment === 'trousers' ? 'Trousers' : 'Waistcoat';
        link.href = '#/consultation?' + new URLSearchParams({garment: garmentName, cloth:key, product:panel.closest('section').querySelector('h1').textContent});
      }
      const matchingWaistcoatLink = panel.closest('section').querySelector('[data-matching-waistcoat-link]');
      if (matchingWaistcoatLink) {
        matchingWaistcoatLink.hidden = ensemble !== '3pc';
        matchingWaistcoatLink.style.display = matchingWaistcoatLink.hidden ? 'none' : '';
        matchingWaistcoatLink.href = '#/waistcoat/' + matchingWaistcoat + '?cloth=' + key;
      }
      const matchingSuit = panel.closest('section').querySelector('[data-matching-suit]');
      if (matchingSuit) matchingSuit.href = '#/suit/' + matchingSuit.dataset.matchingSuit + '?cloth=' + key + '&ensemble=3pc';

    }
    panel.addEventListener('change', update);
    update();
  }

  window.FitelierOptions = {cloths, money, canvasName, suitPrice, options, bind, sizePicker, purchase, priceFor, fixedPrices, guidance};
})();
