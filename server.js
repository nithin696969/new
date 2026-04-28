const http = require('http');
const fs = require('fs');
const path = require('path');

const port = Number.parseInt(process.env.PORT || '3000', 10);
const rootDir = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp'
};

function resolvePath(urlPath) {
 codex/fix-issues-for-railway-deployment-chjywf
  let decodedPath = urlPath;
  try {
    decodedPath = decodeURIComponent(urlPath);
  } catch (error) {
    return null;
  }

  const safePath = path.normalize(decodedPath).replace(/^([.][.][\/\\])+/, '');

  const safePath = path.normalize(decodeURIComponent(urlPath)).replace(/^([.][.][\/\\])+/, '');
 main
  return path.join(rootDir, safePath);
}

function sendFile(filePath, res) {
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        fs.readFile(path.join(rootDir, 'index.html'), (indexError, indexContent) => {
          if (indexError) {
            res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('Internal Server Error');
            return;
          }

          res.writeHead(200, { 'Content-Type': MIME_TYPES['.html'] });
          res.end(indexContent);
        });
        return;
      }

      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Internal Server Error');
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[extension] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
}

const server = http.createServer((req, res) => {
 codex/fix-issues-for-railway-deployment-chjywf
  const requestPathname = (req.url || '/').split('?')[0];

  if (requestPathname === '/health') {

  const requestUrl = new URL(req.url, `http://${req.headers.host}`);

  if (requestUrl.pathname === '/health') {
 main
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

 codex/fix-issues-for-railway-deployment-chjywf
  const requestPath = requestPathname === '/' ? '/index.html' : requestPathname;
  const filePath = resolvePath(requestPath);

  if (!filePath) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Bad Request');
    return;
  }


  const requestPath = requestUrl.pathname === '/' ? '/index.html' : requestUrl.pathname;
  const filePath = resolvePath(requestPath);

 main
  if (!filePath.startsWith(rootDir)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  sendFile(filePath, res);
});

server.listen(port, () => {
  console.log(`AMFI tracker listening on port ${port}`);
});
