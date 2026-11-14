/* Square is the single source of booking availability and appointments. */
window.FitelierBooking=(()=>{
  const bookingURL='https://squareup.com/appointments/book/LHG3NM6KJS6B6';
  function html(){
    const params=new URLSearchParams(location.hash.split('?')[1]||'');
    const advisor=params.get('advisor');
    const knownAdvisor=['Muhammad Quraishi','Samuel Alebiosu','Rayyan Khan'].includes(advisor)?advisor:null;
    return `<section class="appointment-page"><div class="appointment-intro"><p class="eyebrow">YOUR PERSONAL CONSULTATION</p><h1>Let’s find<br><em>your fit.</em></h1><p>A wardrobe that feels like you.</p><div class="appointment-photo" role="img" aria-label="Charcoal wool jacket and fabric swatches on a walnut worktable"></div></div><div class="appointment-panel"><p class="eyebrow">LET’S MEET</p><h2>Find a time that suits you.</h2><p>Choose your service, advisor, and available time in our booking calendar.</p>${knownAdvisor?`<p class="field-help">To meet with ${knownAdvisor}, select their name in the booking calendar.</p>`:''}<p class="field-help" data-consultation-selection hidden></p><a class="button full" href="${bookingURL}" target="_blank" rel="noopener noreferrer">View availability &amp; book <span aria-hidden="true">↗</span></a><p class="fineprint">Our Square booking calendar opens in a new tab. Manage your appointment using the details Square provides.</p><div class="suit-guidance"><h2>Something in mind?</h2><p>For fabric questions, styling ideas or a design you’d like to share, email us before your appointment.</p><a class="text-link" href="mailto:info@fitelier.ca">info@fitelier.ca ↗</a>${params.get('design')==='1'?`<p><button class="text-button" type="button" id="download-consultation-design">Download your design to share ↓</button></p>`:''}</div></div></section>`;
  }
  function bind(){
    const selection = document.querySelector('[data-consultation-selection]');
    const params = new URLSearchParams(location.hash.split('?')[1]);
    const product = params.get('product');
    if (selection && product) {
      const cloth = params.get('cloth');
      const canvas = params.get('canvas');
      const details = [product.slice(0, 100)];
      if (Object.hasOwn(window.FitelierOptions.cloths, cloth)) details.push(window.FitelierOptions.cloths[cloth].name);
      if (['half','full'].includes(canvas)) details.push(window.FitelierOptions.canvasName(canvas));
      if (params.get('ensemble') === '3pc') details.push('Three-piece ensemble');
      selection.textContent = 'Your selection · ' + details.join(' · ');
      selection.hidden = false;
    }
    document.querySelector('#download-consultation-design')?.addEventListener('click',()=>{
      downloadFile(JSON.stringify(payload(),null,2),'fitelier-design.json','application/json');
    });
  }
  return {html,bind};
})();
