import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('.', import.meta.url));
const allowed = /^\/(index\.html|styles\.css|src\/[a-z0-9-]+\.js|vendor\/three\.(module|core)\.js|locales\/(en|zh|ja)\.json)$/;
const mime = {'.js':'text/javascript', '.css':'text/css', '.html':'text/html', '.json':'application/json'};
const server = http.createServer(async (req, res) => {
  const host = req.headers.host;
  if (!/^(127\.0\.0\.1|localhost):\d+$/.test(host || '')) {res.writeHead(403);return res.end();}
  const pathname = new URL(req.url, 'http://localhost').pathname;
  if (pathname.startsWith('/api/asr/')) {
    if ((req.headers.origin && req.headers.origin !== `http://${host}`) || req.headers['sec-fetch-site']==='cross-site') {res.writeHead(403);return res.end();}
    if (!['/api/asr/status','/api/asr/transcribe'].includes(pathname) || !['GET','POST'].includes(req.method)) {res.writeHead(404);return res.end();}
    let size=0;const chunks=[];
    try {
      for await(const chunk of req){size+=chunk.length;if(size>26*1024*1024){res.writeHead(413);return res.end();}chunks.push(chunk);}
      const upstream=await fetch('http://127.0.0.1:8765/'+pathname.split('/').at(-1),{
        method:req.method,headers:{'X-MindClone-Local':'1',...(req.method==='POST'?{'Content-Type':req.headers['content-type']||''}:{})},
        ...(req.method==='POST'?{body:Buffer.concat(chunks)}:{}),signal:AbortSignal.timeout(180000)});
      res.writeHead(upstream.status,{'Content-Type':'application/json','Cache-Control':'no-store'});return res.end(await upstream.text());
    } catch {res.writeHead(pathname.endsWith('/status')?200:503,{'Content-Type':'application/json'});return res.end(JSON.stringify({available:false}));}
  }
  const asset = pathname === '/' ? '/index.html' : pathname;
  if (!allowed.test(asset)) { res.writeHead(404); return res.end('Not found'); }
  try {
    const data = await readFile(path.join(root, asset));
    res.writeHead(200, {
      'Content-Type': `${mime[path.extname(asset)]}; charset=utf-8`,
      'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'self'; style-src 'self'; script-src 'self'; connect-src 'self'; media-src 'self' blob:; img-src 'self' data:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
    });
    res.end(data);
  } catch { res.writeHead(404); res.end('Not found'); }
});
server.listen(Number(process.env.PORT || 4173), '127.0.0.1', () => {
  console.log(`MindClone: http://127.0.0.1:${server.address().port}`);
});
