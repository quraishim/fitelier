import {bundleUI} from './bundle-ui.mjs';
await bundleUI();
import { createServer } from 'node:http';
import { readFile,mkdir,readdir } from 'node:fs/promises';
import { resolve,extname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import worker from '../src/worker.js';
await mkdir('.local',{recursive:true});
const database=new DatabaseSync('.local/consultations.sqlite');
database.exec('CREATE TABLE IF NOT EXISTS local_migrations (name TEXT PRIMARY KEY)');
for(const name of (await readdir('drizzle')).filter(x=>x.endsWith('.sql')).sort())if(!database.prepare('SELECT name FROM local_migrations WHERE name=?').get(name)){database.exec(await readFile('drizzle/'+name,'utf8'));database.prepare('INSERT INTO local_migrations(name) VALUES (?)').run(name)}
const DB={prepare(sql){let params=[];const query={bind(...p){params=p;return query},async run(){return database.prepare(sql).run(...params)},async first(){return database.prepare(sql).get(...params)||null}};return query}};
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.webp':'image/webp','.jpg':'image/jpeg','.ttf':'font/ttf','.svg':'image/svg+xml'};
const root=resolve('public');
const ASSETS={async fetch(request){const path=decodeURIComponent(new URL(request.url).pathname),file=resolve(root,'.'+(path==='/'?'/index.html':path));if(!file.startsWith(root+'/'))return new Response('Not found',{status:404});try{return new Response(await readFile(file),{headers:{'Content-Type':mime[extname(file)]||'application/octet-stream','Cache-Control':'no-store'}})}catch{return new Response('Not found',{status:404})}}};
createServer(async(req,res)=>{try{const chunks=[];for await(const chunk of req)chunks.push(chunk);const request=new Request('http://'+req.headers.host+req.url,{method:req.method,headers:req.headers,...(!['GET','HEAD'].includes(req.method)?{body:Buffer.concat(chunks)}:{})});const response=await worker.fetch(request,{DB,ASSETS});res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()))}catch(e){console.error(e);res.writeHead(500);res.end('Unavailable')}}).listen(8765,'127.0.0.1',()=>console.log('Fitelier preview: http://127.0.0.1:8765'));
