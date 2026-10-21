#!/usr/bin/env node
/**
 * A local registry for trying templates in the app before they are released.
 *
 *   npm run build && npm run serve
 *   then, in HillnoteApp (dev builds only — packaged apps ignore http URLs):
 *   HILLNOTE_TEMPLATE_REGISTRY_URL=http://127.0.0.1:8932/registry.json npm run electron-dev
 *
 * Serves dist/registry.json with every zip/media URL pointed at this server,
 * the zips in dist/, and templates/<id>/media/*. Loopback only.
 */
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { ROOT, TEMPLATES_DIR, zipName } from '../lib/templates.mjs'

const HOST = '127.0.0.1'
const PORT = Number(process.env.PORT || 8932)
const BASE = `http://${HOST}:${PORT}`
const DIST = path.join(ROOT, 'dist')

const TYPES = { '.json': 'application/json', '.zip': 'application/zip', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.avif': 'image/avif' }

// …/templates/<id>/media/<file> on raw.githubusercontent.com → this server.
const localMedia = (url) => {
  if (typeof url !== 'string') return url
  const m = /\/templates\/([a-z0-9][a-z0-9-]{1,63})\/(media\/[^?#]+)$/.exec(url)
  return m ? `${BASE}/${m[1]}/${m[2]}` : url
}

function localRegistry() {
  const doc = JSON.parse(fs.readFileSync(path.join(DIST, 'registry.json'), 'utf8'))
  for (const e of doc.templates || []) {
    e.zipUrl = `${BASE}/dist/${zipName(e.id, e.version)}`
    e.iconUrl = localMedia(e.iconUrl)
    e.heroUrl = e.heroUrl ? localMedia(e.heroUrl) : null
    e.screenshotUrls = (e.screenshotUrls || []).map(localMedia)
  }
  return Buffer.from(`${JSON.stringify(doc, null, 2)}\n`)
}

function sendFile(res, abs) {
  let st
  try { st = fs.lstatSync(abs) } catch { return notFound(res) }
  if (!st.isFile()) return notFound(res)
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(abs).toLowerCase()] || 'application/octet-stream', 'Content-Length': st.size })
  fs.createReadStream(abs).pipe(res)
}

function notFound(res) {
  res.writeHead(404, { 'Content-Type': 'text/plain' })
  res.end('not found\n')
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); return res.end() }
  let url
  try { url = decodeURIComponent(new URL(req.url, BASE).pathname) } catch { return notFound(res) }

  if (url === '/registry.json') {
    try {
      const body = localRegistry()
      res.writeHead(200, { 'Content-Type': 'application/json', 'Content-Length': body.length })
      return res.end(req.method === 'HEAD' ? undefined : body)
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' })
      return res.end(`no dist/registry.json — run npm run build first (${err.message})\n`)
    }
  }
  let m = /^\/dist\/([a-z0-9][a-z0-9-]{1,63}-\d+\.\d+\.\d+\.zip)$/.exec(url)
  if (m) return sendFile(res, path.join(DIST, m[1]))
  m = /^\/([a-z0-9][a-z0-9-]{1,63})\/media\/([A-Za-z0-9][A-Za-z0-9._-]{0,80}\.(?:webp|png|jpe?g|avif))$/.exec(url)
  if (m) return sendFile(res, path.join(TEMPLATES_DIR, m[1], 'media', m[2]))
  return notFound(res)
})

server.listen(PORT, HOST, () => {
  console.log(`serving the local template registry at ${BASE}/registry.json`)
  console.log('\nin HillnoteApp (dev builds only):')
  console.log(`  HILLNOTE_TEMPLATE_REGISTRY_URL=${BASE}/registry.json npm run electron-dev`)
})
