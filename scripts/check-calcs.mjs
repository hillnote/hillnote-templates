#!/usr/bin/env node
/**
 * Run a template's numbers through the app's own engines:
 *   - every `${=expr}` in a page, evaluated against the template's variables.md
 *     (src/lib/variableCalc.js), and every `${name}` checked against them;
 *   - every formula column in a database or sheet, compiled and evaluated on
 *     each sample row (src/lib/rowFormula.js).
 *
 *   node scripts/check-calcs.mjs [<id> …]     (default: every template)
 *
 * Authoring helper only (CI never runs it). Reads the engines from a sibling
 * HillnoteApp checkout (HILLNOTE_APP_DIR overrides the path); both are
 * dependency-free leaf modules, copied to a temp folder as .mjs to import.
 */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { ROOT, TEMPLATES_DIR, listTemplateIds, walkRegular, readFrontmatter } from '../lib/templates.mjs'

const appDir = process.env.HILLNOTE_APP_DIR || path.resolve(ROOT, '..', 'hillnote', 'HillnoteApp')
const load = async (rel) => {
  const src = path.join(appDir, rel)
  if (!fs.existsSync(src)) {
    console.error(`✗ no HillnoteApp checkout at ${appDir} — set HILLNOTE_APP_DIR`)
    process.exit(1)
  }
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'hn-calc-'))
  const dest = path.join(tmp, path.basename(rel).replace(/\.js$/, '.mjs'))
  fs.copyFileSync(src, dest)
  return import(pathToFileURL(dest).href)
}
const calc = await load('src/lib/variableCalc.js')
const formula = await load('src/lib/rowFormula.js')

const BUILTINS = new Set(['today', 'now', 'time', 'weekday', 'year', 'month'])
const VARIABLE_HEADING_RE = /^##\s+\$([A-Za-z][A-Za-z0-9_-]*)\s*$/

function readVariables(text) {
  const vars = new Map()
  let current = null
  for (const line of String(text || '').split('\n')) {
    const m = VARIABLE_HEADING_RE.exec(line)
    if (m) { current = m[1]; vars.set(current, []); continue }
    if (current) vars.get(current).push(line)
  }
  return new Map([...vars].map(([k, lines]) => [k, lines.join('\n').trim()]))
}

const proseOnly = (text) => text
  .replace(/^(\s*)(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1\2[ \t]*$/gm, '')
  .replace(/`[^`\n]*`/g, '')

let problems = 0
const report = (msg) => { problems++; console.log(`✗ ${msg}`) }

const ids = process.argv.slice(2).length ? process.argv.slice(2) : listTemplateIds()
for (const id of ids) {
  const ws = path.join(TEMPLATES_DIR, id, 'workspace')
  if (!fs.existsSync(ws)) continue
  const files = walkRegular(ws).files
  const text = (rel) => fs.readFileSync(path.join(ws, rel), 'utf8')
  const vars = fs.existsSync(path.join(ws, 'variables.md')) ? readVariables(text('variables.md')) : new Map()
  const resolve = (name) => (vars.has(name) ? vars.get(name) : undefined)
  let calcs = 0
  let refs = 0
  const used = new Set()

  for (const f of files) {
    if (!/\.md$/i.test(f.rel) || f.rel === 'variables.md') continue
    const body = proseOnly(text(f.rel))
    for (const m of body.matchAll(/\$\{=([^}\n]+)\}/g)) {
      calcs++
      const res = calc.evaluateExpression(m[1].trim(), (n) => { used.add(n); return resolve(n) })
      if (!res.ok) report(`${id}/${f.rel}: \${=${m[1]}} — ${res.error}`)
    }
    for (const m of body.matchAll(/\$\{([A-Za-z][A-Za-z0-9_-]*)\}/g)) {
      refs++
      used.add(m[1])
      if (!vars.has(m[1]) && !BUILTINS.has(m[1])) report(`${id}/${f.rel}: \${${m[1]}} is not defined in variables.md`)
    }
  }
  for (const name of vars.keys()) if (!used.has(name)) console.log(`⚠ ${id}: variable $${name} is never used`)

  let formulas = 0
  for (const f of files) {
    const base = f.rel.split('/').pop()
    if (base !== 'database.json' && base !== 'sheet.json') continue
    const folder = f.rel.slice(0, -(base.length + 1))
    const config = JSON.parse(text(f.rel))
    const columns = Array.isArray(config.columns) ? config.columns : []
    const index = formula.buildRefIndex(columns)
    const rows = base === 'database.json'
      ? files.filter((r) => r.rel.startsWith(`${folder}/`) && !r.rel.slice(folder.length + 1).includes('/') && /\.md$/i.test(r.rel))
        .map((r) => {
          const fm = readFrontmatter(text(r.rel))
          const row = { title: r.rel.split('/').pop().replace(/\.md$/i, '') }
          for (const [k, v] of fm?.fields || []) row[k] = v.list.length ? v.list : v.value.replace(/^(['"])(.*)\1$/, '$2')
          return { name: r.rel, row }
        })
      : []
    for (const col of columns) {
      if (col?.type !== 'formula' || col.formulaMode === 'ai') continue
      formulas++
      const compiled = formula.compileFormula(col.formula, { columns })
      if (!compiled.ok) { report(`${id}/${f.rel}: formula "${col.name}" — ${compiled.error.message}`); continue }
      if (compiled.unknownRefs.length) { report(`${id}/${f.rel}: formula "${col.name}" refers to unknown column(s) ${compiled.unknownRefs.map((r) => `{${r}}`).join(', ')}`); continue }
      for (const { name, row } of rows) {
        const res = formula.evaluateFormula(compiled, (ref) => {
          const c = formula.resolveColumnRef(index, ref)
          if (!c) return undefined
          const v = c.type === 'title' ? row.title : row[c.id]
          return v === undefined || v === '' ? null : v
        })
        if (!res.ok) report(`${id}/${name}: formula "${col.name}" gives ${res.error.code} (${res.error.message})`)
      }
    }
  }
  console.log(`· ${id}: ${calcs} calculation(s), ${refs} variable reference(s), ${formulas} formula column(s) checked`)
}
process.exit(problems ? 1 : 0)
