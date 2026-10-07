import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, join, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('../dist/', import.meta.url)))
const port = Number(process.env.PORT ?? 8080)
const providerMode = (process.env.DATA_PROVIDER_MODE ?? 'mock').trim().toLowerCase() || 'mock'
const mimeTypes = { '.css': 'text/css; charset=utf-8', '.html': 'text/html; charset=utf-8', '.ico': 'image/x-icon', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' }

function send(response, statusCode, body, contentType = 'application/json; charset=utf-8') {
  response.writeHead(statusCode, { 'content-type': contentType, 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' })
  response.end(body)
}

createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', 'http://localhost')

  if (url.pathname === '/runtime-config.js') {
    return send(response, 200, `window.__NORDIC_OPS_CONFIG__=${JSON.stringify({ dataProviderMode: providerMode })};`, 'text/javascript; charset=utf-8')
  }

  if (url.pathname === '/api/health') {
    return send(response, 200, JSON.stringify({ status: 'ok', service: 'nordic-ops-web', providerMode, timestamp: new Date().toISOString() }))
  }

  if (url.pathname.startsWith('/api/providers/')) {
    const domain = url.pathname.slice('/api/providers/'.length)
    return send(response, 503, JSON.stringify({ domain, status: 'UNAVAILABLE', freshness: 'OFFLINE', message: 'No server-side provider adapter is configured.' }))
  }

  const pathname = decodeURIComponent(url.pathname)
  const relativePath = normalize(pathname).replace(/^([/\\]|\.\.(?:[/\\]|$))+/, '')
  const filePath = resolve(join(root, relativePath || 'index.html'))
  if (!filePath.startsWith(`${root}/`) && filePath !== join(root, 'index.html')) return send(response, 400, JSON.stringify({ error: 'Invalid path' }))

  try {
    const fileStat = await stat(filePath)
    const resolvedPath = fileStat.isDirectory() ? join(filePath, 'index.html') : filePath
    const content = await readFile(resolvedPath)
    return send(response, 200, content, mimeTypes[extname(resolvedPath)] ?? 'application/octet-stream')
  } catch {
    try {
      const content = await readFile(join(root, 'index.html'))
      return send(response, 200, content, mimeTypes['.html'])
    } catch {
      return send(response, 503, JSON.stringify({ error: 'Web assets are unavailable.' }))
    }
  }
}).listen(port, '0.0.0.0', () => {
  console.log(`Nordic Operations listening on ${port}; provider mode: ${providerMode}`)
})