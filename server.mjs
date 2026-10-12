import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('.',import.meta.url));
const allowed=/^\/(index\.html|styles\.css|src\/[a-z-]+\.js)$/;
http.createServer(async(req,res)=>{const url=new URL(req.url,'http://localhost'); const p=url.pathname==='/'?'/index.html':url.pathname;if(!allowed.test(p)){res.writeHead(404);return res.end('Not found');}try{const data=await readFile(path.join(root,p));res.writeHead(200,{'Content-Type':p.endsWith('.js')?'text/javascript; charset=utf-8':p.endsWith('.css')?'text/css; charset=utf-8':'text/html; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self'; style-src 'self'; script-src 'self'; connect-src 'none'; img-src 'self' data:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'"});res.end(data);}catch{res.writeHead(404);res.end('Not found');}}).listen(4173,'127.0.0.1',()=>console.log('MindClone: http://127.0.0.1:4173'));
