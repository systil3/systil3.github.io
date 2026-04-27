const http  = require('http');
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const PORT = 5000;
const ROOT = __dirname;

const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg']);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
  '.glb':  'model/gltf-binary',
  '.gltf': 'model/gltf+json',
};

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);

  // OG 이미지 URL 프록시
  if (urlPath === '/api/og') {
    const targetUrl = new URL(req.url, 'http://localhost').searchParams.get('url');
    if (!targetUrl) { res.writeHead(400); return res.end('missing url'); }
    https.get(targetUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (r) => {
      let html = '';
      r.setEncoding('utf8');
      r.on('data', chunk => { if (html.length < 100000) html += chunk; });
      r.on('end', () => {
        const m = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
                || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
        const imgUrl = m ? m[1] : '';
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ url: imgUrl }));
      });
    }).on('error', () => {
      res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify({ url: '' }));
    });
    return;
  }

  // 이미지 목록 API — 서버가 로컬 폴더를 읽어서 파일명 배열 반환
  const apiMatch = urlPath.match(/^\/api\/images\/([^/]+)$/);
  if (apiMatch) {
    const folder = apiMatch[1];
    const folderPath = path.join(ROOT, folder);
    if (!folderPath.startsWith(ROOT)) {
      res.writeHead(403); return res.end('Forbidden');
    }
    fs.readdir(folderPath, (err, files) => {
      if (err) { res.writeHead(404); return res.end('Not Found'); }
      const images = files.filter(f => IMAGE_EXTS.has(path.extname(f).toLowerCase()));
      res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify(images));
    });
    return;
  }

  if (urlPath === '/') urlPath = '/index.html';

  const filePath = path.join(ROOT, urlPath);

  // ROOT 바깥 접근 차단
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end(`404 Not Found: ${urlPath}`);
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Server Error');
      }
      return;
    }

    const ext  = path.extname(filePath).toLowerCase();
    const mime = MIME[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': mime,
      // importmap / ES module 을 위해 CORS 허용
      'Access-Control-Allow-Origin': '*',
    });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
