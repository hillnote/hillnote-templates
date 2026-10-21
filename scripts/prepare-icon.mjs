#!/usr/bin/env node
/**
 * Make a template icon from an illustration: pad it onto a transparent square
 * canvas (side = its longer edge; never upscaled) and write lossless WebP.
 *
 *   node scripts/prepare-icon.mjs <source image> <templates/<id>/media/icon.webp>
 *
 * Authoring helper only (CI never runs it). Needs `sharp`: installed here, or
 * from a sibling HillnoteApp checkout (HILLNOTE_APP_DIR overrides the path).
 */
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { ROOT, MEDIA_LIMITS } from '../lib/templates.mjs'

const [srcArg, outArg] = process.argv.slice(2)
if (!srcArg || !outArg) {
  console.error('Usage: node scripts/prepare-icon.mjs <source image> <output .webp>')
  process.exit(1)
}

function loadSharp() {
  const appDir = process.env.HILLNOTE_APP_DIR || path.resolve(ROOT, '..', 'hillnote', 'HillnoteApp')
  for (const base of [path.join(ROOT, 'package.json'), path.join(appDir, 'package.json')]) {
    try { return createRequire(base)('sharp') } catch { /* try the next */ }
  }
  console.error('✗ sharp is not installed — `npm i --no-save sharp` here, or set HILLNOTE_APP_DIR to a HillnoteApp checkout')
  process.exit(1)
}

const sharp = loadSharp()
const src = path.resolve(srcArg)
const out = path.resolve(outArg)
const meta = await sharp(src).metadata()
const side = Math.max(meta.width, meta.height)
const padX = side - meta.width
const padY = side - meta.height
const buf = await sharp(src)
  .ensureAlpha()
  .extend({
    top: Math.floor(padY / 2), bottom: Math.ceil(padY / 2),
    left: Math.floor(padX / 2), right: Math.ceil(padX / 2),
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .webp({ lossless: true, effort: 6 })
  .toBuffer()
fs.mkdirSync(path.dirname(out), { recursive: true })
fs.writeFileSync(out, buf)
const note = side < MEDIA_LIMITS.iconMinPx ? ` — under the ${MEDIA_LIMITS.iconMinPx}px minimum` : ''
console.log(`✓ ${path.relative(process.cwd(), out)} ${side}×${side}, ${Math.round(buf.length / 1024)} KB${note}`)
