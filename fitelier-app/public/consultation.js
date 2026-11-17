/* Square is the single source of booking availability and appointments. */
window.FitelierBooking=(()=>{
  const bookingURL='https://squareup.com/appointments/book/LHG3NM6KJS6B6';
  function html(){
    const params=new URLSearchParams(location.hash.split('?')[1]||'');
    const advisor=params.get('advisor');
    const knownAdvisor=['Muhammad Quraishi','Samuel Alebiosu','Rayyan Khan'].includes(advisor)?advisor:null;
    return `<section class="appointment-page"><div class="appointment-panel"><h1>Find a time that suits you.</h1><p>Choose your service, advisor, and available time in our booking calendar.</p>${knownAdvisor?`<p class="field-help">To meet with ${knownAdvisor}, select their name in the booking calendar.</p>`:''}<p class="field-help" data-consultation-selection hidden></p><a class="button full appointment-book" href="${bookingURL}" target="_blank" rel="noopener noreferrer">View availability &amp; book <span aria-hidden="true">↗</span></a><p class="fineprint">Our Square booking calendar opens in a new tab. Manage your appointment using the details Square provides.</p>${params.get('design')==='1'?`<p><button class="text-button" type="button" id="download-consultation-design">Download your design to share ↓</button></p>`:''}</div><img class="appointment-image" src="/assets/consultation-navy-suits.webp" width="1448" height="1086" alt="Navy wool suits on walnut hangers stamped with the Fitelier monogram"></section>`;
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
  return {html,bind,bookingURL};
})();
