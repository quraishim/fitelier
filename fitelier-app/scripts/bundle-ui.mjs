import {build} from 'esbuild';
export async function bundleUI(){await build({entryPoints:['src/ui/hero.jsx'],outfile:'public/hero-ui.js',bundle:true,minify:true,format:'iife',jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'},target:['es2020'],legalComments:'eof'});}
if(process.argv[1]?.endsWith('bundle-ui.mjs'))await bundleUI();
