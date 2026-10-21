#!/usr/bin/env node
/**
 * Give hand-written HTML tools the app's design system: inject Hillnote's
 * baseline stylesheet + error bridge into every templates/<id>/workspace/
 * resources/html/<tool>/*.html, exactly as the app does when a tool is saved
 * in-app or over MCP (same accent colour per tool name). Idempotent; a file
 * holding <!-- hillnote-no-baseline --> is left alone. Also prints the app's
 * static checks (unclosed tags, …) for each tool.
 *
 *   node scripts/inject-tool-baseline.mjs [<id> …]     (default: every template)
 *
 * Authoring helper only (CI never runs it). Reads the baseline from a sibling
 * HillnoteApp checkout (HILLNOTE_APP_DIR overrides the path).
 */
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { ROOT, TEMPLATES_DIR, listTemplateIds, walkRegular } from '../lib/templates.mjs'

const appDir = process.env.HILLNOTE_APP_DIR || path.resolve(ROOT, '..', 'hillnote', 'HillnoteApp')
const baselinePath = path.join(appDir, 'src', 'lib', 'htmlToolBaseline.mjs')
if (!fs.existsSync(baselinePath)) {
  console.error(`✗ no HillnoteApp checkout at ${appDir} — set HILLNOTE_APP_DIR`)
  process.exit(1)
}
const { injectBaseline, hashColor, validateToolHtml, BASELINE_VERSION } = await import(pathToFileURL(baselinePath).href)

const ids = process.argv.slice(2).length ? process.argv.slice(2) : listTemplateIds()
let problems = 0
for (const id of ids) {
  const htmlDir = path.join(TEMPLATES_DIR, id, 'workspace', 'resources', 'html')
  if (!fs.existsSync(htmlDir)) continue
  for (const f of walkRegular(htmlDir).files) {
    if (!/\.html?$/i.test(f.rel)) continue
    // The accent follows the tool's folder name, like the app's own saves.
    const toolName = f.rel.includes('/') ? f.rel.split('/')[0] : f.rel.replace(/\.html?$/i, '')
    const before = fs.readFileSync(f.abs, 'utf8')
    const after = injectBaseline(before, { primaryHex: hashColor(toolName).hex })
    if (after !== before) fs.writeFileSync(f.abs, after)
    const { issues } = validateToolHtml(after)
    const label = `${id}/resources/html/${f.rel}`
    if (issues.length) {
      problems += issues.length
      for (const issue of issues) console.log(`✗ ${label}: ${issue.message}${issue.line ? ` (line ${issue.line})` : ''}`)
    } else {
      console.log(`${after === before ? '·' : '✓'} ${label}`)
    }
  }
}
console.log(`baseline v${BASELINE_VERSION}${problems ? ` — ${problems} issue(s)` : ''}`)
process.exit(problems ? 1 : 0)
