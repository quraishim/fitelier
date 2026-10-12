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
export default {async fetch(request,env){const path=new URL(request.url).pathname;if(path==='/api/consultations')return consultations(request,env);if(path.startsWith('/api/'))return json({error:'Not found.'},404);return env.ASSETS.fetch(request)}};
