import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('.', import.meta.url));
const allowed = /^\/(index\.html|styles\.css|src\/[a-z0-9-]+\.js|locales\/(en|zh|ja)\.json)$/;
const mime = {'.js':'text/javascript', '.css':'text/css', '.html':'text/html', '.json':'application/json'};
const server = http.createServer(async (req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  const asset = pathname === '/' ? '/index.html' : pathname;
  if (!allowed.test(asset)) { res.writeHead(404); return res.end('Not found'); }
  try {
    const data = await readFile(path.join(root, asset));
    res.writeHead(200, {
      'Content-Type': `${mime[path.extname(asset)]}; charset=utf-8`,
      'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'self'; style-src 'self'; script-src 'self'; connect-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
    });
    res.end(data);
  } catch { res.writeHead(404); res.end('Not found'); }
});
server.listen(Number(process.env.PORT || 4173), '127.0.0.1', () => {
  console.log(`MindClone: http://127.0.0.1:${server.address().port}`);
});
