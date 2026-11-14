const FABRICS=new Set(['study-charcoal','study-stone','study-navy','study-brown','study-charcoal-pinstripe','study-stone-hopsack','study-navy-windowpane','study-brown-twill']);
const MAX_BODY=24576;
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const dbFor=env=>{if(!env.DB)throw Error('Consultation database binding unavailable');return env.DB};
function dateInZone(timezone,now){const parts=new Intl.DateTimeFormat('en-CA',{timeZone:timezone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);const p=Object.fromEntries(parts.map(x=>[x.type,x.value]));return `${p.year}-${p.month}-${p.day}`}
export function validateRequest(input,now=new Date()){
  if(!input||typeof input!=='object'||Array.isArray(input))return {error:'Please check your request.'};
  const {name,email,preferredDate,timePreference,timezone,message,fabricIds,design,garment='Suit',preferredTime=null,preferredAdvisor=''}=input;
  if(typeof name!=='string'||!name.trim()||name.length>120)return {error:'Please enter your name.'};
  if(typeof email!=='string'||email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return {error:'Please enter a valid email address.'};
  if(!['Morning','Afternoon','Evening','Flexible'].includes(timePreference))return {error:'Choose a preferred time of day.'};
  if(preferredTime!==null&&(typeof preferredTime!=='string'||!/^([01]\d|2[0-3]):(00|30)$/.test(preferredTime)))return {error:'Choose a valid preferred time.'};
  if(typeof preferredAdvisor!=='string'||preferredAdvisor.length>120)return {error:'Keep the advisor name under 120 characters.'};
  if(typeof timezone!=='string'||timezone.length>100)return {error:'Choose a valid timezone.'};
  try{new Intl.DateTimeFormat('en',{timeZone:timezone}).format(now)}catch{return {error:'Choose a valid timezone.'}}
  if(preferredDate!==null){
    if(typeof preferredDate!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(preferredDate))return {error:'Choose a preferred date or a flexible date.'};
    const date=new Date(preferredDate+'T12:00:00Z');
    if(!Number.isFinite(date.getTime())||date.toISOString().slice(0,10)!==preferredDate)return {error:'Choose a valid date.'};
    const today=dateInZone(timezone,now),limit=new Date(today+'T12:00:00Z');limit.setUTCDate(limit.getUTCDate()+180);
    if(preferredDate<=today||preferredDate>limit.toISOString().slice(0,10))return {error:'Choose a date from tomorrow through the next six months.'};
  }
  if(!['Suit','Jacket','Trousers','Shirt','Waistcoat','Knitwear','Knitted polo','Cardigan','A wardrobe consultation'].includes(garment))return {error:'Please choose a valid garment.'};
  if(typeof message!=='string'||message.length>1500)return {error:'Keep your note under 1,500 characters.'};
  if(!Array.isArray(fabricIds)||fabricIds.length>FABRICS.size||fabricIds.some(x=>!FABRICS.has(x)))return {error:'Please review your fabric selection.'};
  if(design!==null&&(typeof design!=='object'||Array.isArray(design)||design.schemaVersion!==1||JSON.stringify(design).length>18000))return {error:'Please review your attached design.'};
  return {value:{name:name.trim(),email:email.trim(),preferredDate,timePreference,preferredTime,preferredAdvisor:preferredAdvisor.trim(),timezone,message:message.trim(),garment,fabricIds:[...new Set(fabricIds)],design}};
}
async function boundedBody(request){const reader=request.body?.getReader();if(!reader)throw Error('invalid-body');let size=0,text='';const decoder=new TextDecoder();while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>MAX_BODY){await reader.cancel();throw Error('too-large')}text+=decoder.decode(value,{stream:true})}return text+decoder.decode()}
async function consultations(request,env){
  if(request.method!=='POST')return json({error:'Method not allowed.'},405);
  const url=new URL(request.url),origin=request.headers.get('Origin');
  if(origin!==url.origin)return json({error:'Please submit your request from the Fitelier website.'},403);
  if(!request.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'Please submit a valid request.'},415);
  const reference=request.headers.get('Idempotency-Key');
  if(!reference||!/^\b[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b$/i.test(reference))return json({error:'Please reload the page and try again.'},400);
  let input;try{input=JSON.parse(await boundedBody(request))}catch(e){return json({error:e.message==='too-large'?'Your request is too large. Remove the design attachment and try again.':'Your request could not be read. Please try again.'},e.message==='too-large'?413:400)}
  const check=validateRequest(input);if(check.error)return json({error:check.error},400);
  const value=check.value,bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(value))),hash=Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');
  try{
    const db=dbFor(env),createdAt=new Date().toISOString();
    await db.prepare(`INSERT INTO consultation_requests (id,payload_hash,status,created_at,name,email,preferred_date,time_preference,timezone,message,garment,preferred_time,preferred_advisor,fabric_ids,design) VALUES (?,?,'pending',?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING`).bind(reference,hash,createdAt,value.name,value.email,value.preferredDate,value.timePreference,value.timezone,value.message,value.garment,value.preferredTime,value.preferredAdvisor,JSON.stringify(value.fabricIds),value.design?JSON.stringify(value.design):null).run();
    const saved=await db.prepare('SELECT id, payload_hash, status, created_at FROM consultation_requests WHERE id = ?').bind(reference).first();
    if(!saved)throw Error('Request receipt unavailable');
    if(saved.payload_hash!==hash)return json({error:'This request changed after it was sent. Please reload before sending a new request.'},409);
    return json({reference:saved.id,status:saved.status,receivedAt:saved.created_at},201);
  }catch(e){console.error('consultation_save_failed',{name:e.name,message:e.message});return json({error:'Your request could not be saved right now. Your details are still here; please try again.'},503)}
}

/* Square hosted checkout: secrets remain server-side. Prices and item names are
   always determined here, never trusted from the browser. */
const SQUARE_PRODUCTS = {
  suit: {
    'charcoal-wool':'Charcoal Wool Suit',
    'navy-wool':'Navy Wool Suit',
    'brown-wool':'Chocolate Brown Wool Suit',
    'black-wool':'Black Wool Suit'
  },
  trouser: {
    charcoal:'Charcoal Wool Trousers',
    navy:'Navy Wool Trousers',
    'chocolate-brown':'Chocolate Brown Wool Trousers',
    black:'Black Wool Trousers',
    'off-white':'Off-White Pleated Wool Trousers',
    'mid-grey':'Mid-Grey Pleated Wool Trousers'
  },
  waistcoat: {
    charcoal:'Charcoal Wool Waistcoat',
    navy:'Navy Wool Waistcoat',
    brown:'Chocolate Brown Wool Waistcoat',
    black:'Black Wool Waistcoat'
  },
  jacket: {
    'navy-hopsack':'Navy Hopsack Jacket',
    'cerulean-houndstooth':'Cerulean Houndstooth Jacket',
    'taupe-pow':'Taupe Prince of Wales Jacket',
    'denim-wool-silk-linen':'Denim-Effect Double-Breasted Jacket'
  }
};
const SQUARE_FIXED_PRICES = {
  'off-white': 26500,
  'chocolate-brown': 19500,
  'mid-grey': 26500,
  'navy-hopsack': 79500,
  'cerulean-houndstooth': 79500,
  'taupe-pow': 79500,
  'denim-wool-silk-linen': 84500,
};
const SQUARE_CLOTH_PRICES = {
  essentials:{name:'Fitelier Essentials',suit:69500,threePiece:79500,trouser:19500,waistcoat:22500},
  vbc:{name:'VBC Perennial',suit:119500,threePiece:149500,trouser:36500,waistcoat:41500}
};
const SQUARE_SIZES=new Set([44,46,48,50,52,54,56,58,60]);
const squareReady=env=>env.SQUARE_CHECKOUT_ENABLED==='true'
  &&env.SQUARE_TAX_CONFIGURED==='true'
  &&env.SQUARE_SHIPPING_CONFIGURED==='true'
  &&Boolean(env.SQUARE_ACCESS_TOKEN&&env.SQUARE_LOCATION_ID);
function validateSquareCart(body){
  if(!body||typeof body!=='object'||!Array.isArray(body.items)||!body.items.length||body.items.length>8||body.termsAccepted!==true)return null;
  let total=0;
  const items=[];
  for(const row of body.items){
    if (!row || typeof row.slug !== 'string' || !Number.isInteger(row.qty) || row.qty<1 || row.qty>5) return null;
    const kind = row.kind ?? 'suit';
    if (typeof kind !== 'string' || !Object.hasOwn(SQUARE_PRODUCTS,kind) || !Object.hasOwn(SQUARE_PRODUCTS[kind],row.slug)) return null;
    const fixedPrice = Object.hasOwn(SQUARE_FIXED_PRICES,row.slug) ? SQUARE_FIXED_PRICES[row.slug] : null;
    if (kind === 'trouser' && row.slug === 'chocolate-brown' && row.cloth != null) return null;
    if (fixedPrice === null && (kind === 'jacket' || ['off-white','mid-grey'].includes(row.slug))) return null;
    const cloth = row.cloth ?? 'vbc';
    const canvas = row.canvas ?? 'half';
    if (typeof cloth !== 'string' || !Object.hasOwn(SQUARE_CLOTH_PRICES,cloth) || !['half','full'].includes(canvas)) return null;
    if (!['jacket','suit'].includes(kind) && canvas === 'full') return null;
    const details = kind === 'jacket' ? ['Brown Aaron Naples'] : row.slug === 'mid-grey' ? ['Vitale Barberis Canonico'] : fixedPrice === null ? [SQUARE_CLOTH_PRICES[cloth].name] : ['Brown Aaron'];
    if (kind === 'suit' || kind === 'jacket') details.push(canvas === 'full' ? 'Full canvas' : 'Half canvas');
    let priceKey = kind;
    if (kind === 'suit') {
      const ensemble = row.ensemble ?? '2pc';
      if (!['2pc','3pc'].includes(ensemble) || !SQUARE_SIZES.has(row.jacket) || !SQUARE_SIZES.has(row.trousers)) return null;
      details.push('Jacket EU '+row.jacket,'Trousers EU '+row.trousers);
      if (ensemble === '3pc') {
        if (!SQUARE_SIZES.has(row.waistcoat)) return null;
        details.push('Waistcoat EU '+row.waistcoat);
        priceKey = 'threePiece';
      }
    } else {
      if (!SQUARE_SIZES.has(row.size)) return null;
      details.push('EU '+row.size);
    }
    const amount = (fixedPrice ?? SQUARE_CLOTH_PRICES[cloth][priceKey]) + (canvas === 'full' ? 22000 : 0);
    total += row.qty;
    if (total > 20) return null;
    items.push({
      name:SQUARE_PRODUCTS[kind][row.slug],
      quantity:String(row.qty),
      variation_name:details.join(' / '),
      base_price_money:{amount,currency:'CAD'}
    });
  }
  return items;
}
const STATIC_STOREFRONT_ORIGINS=new Set([
  'https://fitelier-1.onrender.com',
  'https://fitelier.ca',
  'https://www.fitelier.ca'
]);

async function squareApi(request,env,path){
  const origin=request.headers.get('Origin');
  const fromStaticStorefront=STATIC_STOREFRONT_ORIGINS.has(origin);
  const isStatus=path==='/api/square-status';
  if(request.method==='OPTIONS'){
    if(!fromStaticStorefront)return json({error:'Origin not allowed.'},403);
    return new Response(null,{status:204,headers:{
      'Access-Control-Allow-Origin':origin,
      'Access-Control-Allow-Methods':isStatus?'GET':'POST',
      'Access-Control-Allow-Headers':'Content-Type, Idempotency-Key',
      'Vary':'Origin'
    }});
  }
  const response=isStatus
    ? (request.method==='GET'?json({ready:squareReady(env)}):json({error:'Method not allowed.'},405))
    : await squareCheckout(request,env);
  response.headers.append('Vary','Origin');
  if(fromStaticStorefront)response.headers.set('Access-Control-Allow-Origin',origin);
  return response;
}

async function squareCheckout(request,env){
  if(request.method!=='POST')return json({error:'Method not allowed.'},405);
  if(!squareReady(env))return json({error:'Secure payment setup is not yet available.'},503);
  const origin=request.headers.get('Origin');
  if(origin!==new URL(request.url).origin&&!STATIC_STOREFRONT_ORIGINS.has(origin))return json({error:'Please begin checkout on the Fitelier website.'},403);
  if(!request.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'Please submit valid checkout details.'},415);
  const key=request.headers.get('Idempotency-Key');
  if(!key||!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(key))return json({error:'Please retry checkout.'},400);
  let body;
  try{body=JSON.parse(await boundedBody(request));}catch{return json({error:'Could not read your bag.'},400)}
  const items=validateSquareCart(body);
  if(!items)return json({error:'Please review your bag and acknowledge the made-to-order terms.'},400);
  const endpoint=env.SQUARE_ENVIRONMENT==='sandbox'?'https://connect.squareupsandbox.com/v2/online-checkout/payment-links':'https://connect.squareup.com/v2/online-checkout/payment-links';
  try{
    const response=await fetch(endpoint,{
      method:'POST',
      headers:{'Square-Version':'2026-09-16','Authorization':'Bearer '+env.SQUARE_ACCESS_TOKEN,'Content-Type':'application/json'},
      body:JSON.stringify({
        idempotency_key:key,
        description:'Fitelier made-to-order garment selection',
        order:{
          location_id:env.SQUARE_LOCATION_ID,
          line_items:items,
          taxes:[{uid:'gst',name:'GST',percentage:'5',type:'ADDITIVE',scope:'ORDER'}],
          pricing_options:{auto_apply_taxes:false}
        },
        checkout_options:{
          ask_for_shipping_address:true,
          allow_tipping:false,
          merchant_support_email:'info@fitelier.ca'
        },
        payment_note:'Complimentary personal delivery within Edmonton, arranged with a Fitelier advisor after inspection. Garment sizes appear in line-item details.'
      })
    });
    if(!response.ok){console.error('square_checkout_failed',{status:response.status});return json({error:'Square checkout is temporarily unavailable. Please try again later.'},502);}
    const body=await response.json(),url=body?.payment_link?.url;
    let destination;try{destination=new URL(url)}catch{}
    if(!destination||destination.protocol!=='https:'||!['square.link','sandbox.square.link','checkout.square.site'].includes(destination.hostname))throw Error('Unexpected Square payment destination');
    return json({url:destination.href},201);
  }catch(e){console.error('square_checkout_unavailable',{message:e.message});return json({error:'Square checkout is temporarily unavailable. Please try again later.'},502);}
}

export default {async fetch(request,env){const path=new URL(request.url).pathname;if(path==='/api/consultations')return consultations(request,env);if(path==='/api/square-status'||path==='/api/square-checkout')return squareApi(request,env,path);if(path.startsWith('/api/'))return json({error:'Not found.'},404);return env.ASSETS.fetch(request)}};
