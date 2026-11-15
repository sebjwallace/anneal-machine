// Serves src/ over http so the viewer can load the engine as ES modules (browsers refuse modules from file://).
// node src/view/serve.js   then open http://localhost:8000/view/
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const port = Number(process.env.PORT) || 8000;
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };

createServer(async (request, response) => {
  let path = normalize(join(root, decodeURIComponent(new URL(request.url, 'http://x').pathname)));
  if (!path.startsWith(root)) return response.writeHead(403).end();
  if (path.endsWith(sep)) path = join(path, 'index.html');
  try {
    const body = await readFile(path);
    response.writeHead(200, { 'content-type': types[extname(path)] ?? 'application/octet-stream' }).end(body);
  } catch {
    response.writeHead(404).end('not found');
  }
}).listen(port, () => console.log(`viewer: http://localhost:${port}/view/`));
