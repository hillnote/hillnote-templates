/**
 * The shared core of validate / build / snapshot / serve: reading a template
 * folder through the app's policy, the checks CI runs, and the registry entry
 * a release publishes. docs: README.md; contract: HillnoteApp/docs/WORKSPACE_TEMPLATES.md.
 *
 * The policy and transforms are the APP's own files (vendored byte-identical in
 * lib/*.cjs) — so a template that passes here installs in the app unchanged.
 */
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { buildZip } from './buildZip.mjs'
import { readZip } from './readZip.mjs'
import { entryNameIssue } from './archiveGuards.mjs'

const require = createRequire(import.meta.url)
export const policyLib = require('./templatePolicy.cjs')
export const transforms = require('./templateTransforms.cjs')
export const syncRules = require('./syncRules.cjs')
export const policy = policyLib.createTemplatePolicy(syncRules)

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const TEMPLATES_DIR = path.join(ROOT, 'templates')
export const REGISTRY_PATH = path.join(ROOT, 'registry.json')

export const REPO_SLUG = 'hillnote/hillnote-templates'
export const RAW_BASE = `https://raw.githubusercontent.com/${REPO_SLUG}`
export const RELEASE_BASE = `https://github.com/${REPO_SLUG}/releases/download`
export const PLUGIN_REGISTRY_URL = process.env.HILLNOTE_PLUGIN_REGISTRY_URL
  || 'https://raw.githubusercontent.com/hillnote/hillnote-plugins/main/registry.json'

export const MEDIA_LIMITS = Object.freeze({ iconMaxBytes: 200 * 1024, iconMinPx: 160, otherMaxBytes: 2 * 1024 * 1024 })
const PLUGIN_ARCHIVE_MAX_BYTES = 50 * 1024 * 1024

// OS litter that never reaches git (.gitignore) — ignored so a local run sees
// exactly what CI sees.
const OS_LITTER = new Set(['.DS_Store', 'Thumbs.db', 'desktop.ini', 'Icon\r'])

export const sha256 = (buf) => crypto.createHash('sha256').update(buf).digest('hex')
const byteOrder = (a, b) => Buffer.compare(Buffer.from(a, 'utf8'), Buffer.from(b, 'utf8'))

// ---- reading a template folder -------------------------------------------------

export function listTemplateIds() {
  if (!fs.existsSync(TEMPLATES_DIR)) return []
  return fs.readdirSync(TEMPLATES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('.'))
    .map((d) => d.name)
    .sort(byteOrder)
}

/**
 * Every regular file under `dir` (lstat — symlinks are never followed), with
 * workspace-relative forward-slash names. Anything that is not a regular file
 * or folder is reported, never read.
 */
export function walkRegular(dir) {
  const files = []
  const problems = []
  const walk = (abs, rel) => {
    for (const ent of fs.readdirSync(abs, { withFileTypes: true }).sort((a, b) => byteOrder(a.name, b.name))) {
      if (OS_LITTER.has(ent.name)) continue
      const childAbs = path.join(abs, ent.name)
      const childRel = rel ? `${rel}/${ent.name}` : ent.name
      const st = fs.lstatSync(childAbs)
      if (st.isSymbolicLink()) problems.push({ rel: childRel, reason: 'symlink' })
      else if (st.isDirectory()) walk(childAbs, childRel)
      else if (st.isFile()) files.push({ rel: childRel, abs: childAbs, size: st.size })
      else problems.push({ rel: childRel, reason: 'not a regular file' })
    }
  }
  if (fs.existsSync(dir)) walk(dir, '')
  return { files, problems }
}

export function readJsonFile(abs) {
  return JSON.parse(fs.readFileSync(abs, 'utf8'))
}

/** Committed registry.json → Map(id → entry); empty when there is none yet. */
export function readCommittedRegistry(file = REGISTRY_PATH) {
  if (!fs.existsSync(file)) return new Map()
  const doc = readJsonFile(file)
  const list = Array.isArray(doc?.templates) ? doc.templates : []
  return new Map(list.filter((e) => e && typeof e.id === 'string').map((e) => [e.id, e]))
}

export function compareSemver(a, b) {
  const pa = String(a).split('.').map(Number)
  const pb = String(b).split('.').map(Number)
  for (let i = 0; i < 3; i++) {
    if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) < (pb[i] || 0) ? -1 : 1
  }
  return 0
}

/**
 * sourceHash (contract §2): sha256 over the sorted "<path>\0<sha256(content)>\n"
 * lines of the workspace files plus "plugin:<id>@<version>#<sha256>\n" per
 * plugin reference, plus "dateAnchor:<date>\n" when the template has one (it
 * changes what an install writes). Source bytes, before build-time transforms.
 * @param {{ rel: string, data: Buffer }[]} files
 * @param {{ id: string, version: string, sha256: string }[]} pluginRefs
 * @param {{ dateAnchor?: string|null }} [extra]
 */
export function computeSourceHash(files, pluginRefs = [], extra = {}) {
  const fileLines = [...files].sort((a, b) => byteOrder(a.rel, b.rel)).map((f) => `${f.rel}\0${sha256(f.data)}\n`)
  const pluginLines = [...pluginRefs].sort((a, b) => byteOrder(a.id, b.id)).map((p) => `plugin:${p.id}@${p.version}#${p.sha256}\n`)
  const anchorLine = extra.dateAnchor ? `dateAnchor:${extra.dateAnchor}\n` : ''
  return sha256(Buffer.from(fileLines.join('') + pluginLines.join('') + anchorLine, 'utf8'))
}

/**
 * Build-time transforms: the neutral dashboard form and no sheet owners. Bytes
 * are only rewritten when a transform actually changed something, so an
 * already-scrubbed file ships byte-for-byte.
 */
export function applyBuildTransforms(rel, data) {
  const isDashboard = rel === 'dashboard.json'
  const isSheet = rel === 'sheet.json' || rel.endsWith('/sheet.json')
  if (!isDashboard && !isSheet) return data
  let parsed
  try { parsed = JSON.parse(data.toString('utf8')) } catch { return data }
  if (isDashboard) {
    const scrubbed = transforms.scrubDashboard(parsed)
    return JSON.stringify(scrubbed) === JSON.stringify(parsed) ? data : Buffer.from(`${JSON.stringify(scrubbed, null, 2)}\n`, 'utf8')
  }
  const { value, changed } = transforms.stripSheetOwner(parsed)
  return changed ? Buffer.from(`${JSON.stringify(value, null, 2)}\n`, 'utf8') : data
}

// ---- checks ------------------------------------------------------------------

const TEXT_EXT = /\.(md|markdown|txt|json|csv|tsv|html?|css|js|mjs|cjs|svg|xml|ya?ml|excalidraw)$/i
export const isTextFile = (rel) => TEXT_EXT.test(rel)

const EMAIL_RE = /\b[A-Za-z0-9._%+-]+@([A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,})\b/g
// "logo@2x.png" is a file name, not an address.
const FILE_TLDS = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'avif', 'ico', 'md', 'json', 'html', 'htm', 'css', 'js', 'mjs', 'pdf', 'csv', 'txt', 'mp4', 'webm', 'mov', 'mp3', 'wav', 'zip'])
const PUBLIC_EMAIL_DOMAIN = (domain) => {
  const d = domain.toLowerCase()
  return ['example.com', 'example.org', 'example.net', 'hillnote.com'].includes(d)
    || /\.(example|test|invalid|localhost)$/.test(d)
    || d.endsWith('.hillnote.com')
}
const SECRET_PATTERNS = [
  ['OpenAI/Anthropic-style key', /\bsk-[A-Za-z0-9_-]{20,}/],
  ['GitHub token', /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{20,})/],
  ['Slack token', /\bxox[abprs]-[A-Za-z0-9-]{10,}/],
  ['AWS access key', /\bAKIA[0-9A-Z]{16}\b/],
  ['Google API key', /\bAIza[0-9A-Za-z_-]{35}\b/],
  ['private key', /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
]
const ABS_PATH_PATTERNS = [
  ['absolute macOS/Linux path', /(?:^|[^A-Za-z0-9_.~-])(\/(?:Users|home)\/[^\s"'<>)\\/]+)/],
  ['absolute Windows path', /\b[A-Za-z]:(?:\\\\|\\|\/)(?:Users|Documents and Settings)(?:\\\\|\\|\/)/i],
]

/** Privacy findings in one text file → [{ kind, sample }]. */
export function privacyFindings(text) {
  const out = []
  for (const [kind, re] of ABS_PATH_PATTERNS) {
    const m = re.exec(text)
    if (m) out.push({ kind, sample: (m[1] || m[0]).slice(0, 60) })
  }
  for (const [kind, re] of SECRET_PATTERNS) {
    const m = re.exec(text)
    if (m) out.push({ kind, sample: `${m[0].slice(0, 8)}…` })
  }
  for (const m of text.matchAll(EMAIL_RE)) {
    const domain = m[1]
    const tld = domain.split('.').pop().toLowerCase()
    if (FILE_TLDS.has(tld) || PUBLIC_EMAIL_DOMAIN(domain)) continue
    out.push({ kind: 'email address', sample: m[0].slice(0, 60) })
    break
  }
  return out
}

/** Hosts a tool's code reaches for (advisory — shown to the reviewer and in the gallery). */
export function externalHosts(text) {
  const hosts = new Set()
  for (const m of text.matchAll(/(?:https?:)?\/\/([a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,})(?::\d+)?/gi)) {
    const h = m[1].toLowerCase()
    if (h === 'www.w3.org') continue // XML/SVG namespaces, not requests
    hosts.add(h)
  }
  return [...hosts].sort()
}

/** Width/height of a PNG, WebP or JPEG; null when the format is not recognised. */
export function imageSize(buf) {
  if (buf.length >= 24 && buf.readUInt32BE(0) === 0x89504e47) {
    return { type: 'png', width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) }
  }
  if (buf.length >= 30 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
    const chunk = buf.toString('ascii', 12, 16)
    if (chunk === 'VP8X') return { type: 'webp', width: 1 + buf.readUIntLE(24, 3), height: 1 + buf.readUIntLE(27, 3) }
    if (chunk === 'VP8L') {
      const b = buf.readUInt32LE(21)
      return { type: 'webp', width: 1 + (b & 0x3fff), height: 1 + ((b >> 14) & 0x3fff) }
    }
    if (chunk === 'VP8 ') return { type: 'webp', width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff }
    return null
  }
  if (buf.length >= 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2
    while (i + 9 < buf.length) {
      if (buf[i] !== 0xff) { i++; continue }
      const marker = buf[i + 1]
      const len = buf.readUInt16BE(i + 2)
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
        return { type: 'jpeg', width: buf.readUInt16BE(i + 7), height: buf.readUInt16BE(i + 5) }
      }
      i += 2 + len
    }
  }
  return null
}

/** The documents/… paths a dashboard.json points at. */
function dashboardRefs(dashboard) {
  const files = []
  const folders = []
  if (typeof dashboard?.defaultFile === 'string' && dashboard.defaultFile) files.push(['defaultFile', dashboard.defaultFile])
  for (const w of Array.isArray(dashboard?.widgets) ? dashboard.widgets : []) {
    const c = w?.config || {}
    const where = `widget ${w?.type || '?'}`
    if (typeof c.documentPath === 'string' && c.documentPath) files.push([where, c.documentPath])
    if (typeof c.databasePath === 'string' && c.databasePath) folders.push([where, c.databasePath])
    for (const p of Array.isArray(c.pinnedDocuments) ? c.pinnedDocuments : []) if (typeof p === 'string') files.push([where, p])
    for (const list of [c.selectedDatabases, c.pinnedDatabases]) {
      for (const d of Array.isArray(list) ? list : []) if (typeof d?.path === 'string') folders.push([where, d.path])
    }
  }
  return { files, folders }
}

// ---- content lint --------------------------------------------------------------
//
// What a hand-written template gets wrong: links and embeds to files that are
// not there (errors), and values the app rewrites the first time it opens a
// database or sheet (warnings — the rewrite is harmless but churns sync and
// version history on a brand-new workspace).

// Database option chips (HillnoteApp src/components/database/lib/columnTypes.js
// OPTION_COLORS); other names are rewritten to the nearest of these on open.
export const OPTION_COLORS = new Set([
  'gray', 'red', 'orange', 'amber', 'icing', 'lime', 'emerald', 'teal',
  'cyan', 'blue', 'purple', 'pink', 'rose', 'brown', 'darkGray',
])
// View settings the app reads as fixed names (HillnoteApp src/components/database/
// views/*). A wrong calendarViewMode makes FullCalendar throw on mount and takes
// the editor down in apps before 2026-10-21, so it is an error; the rest fall
// back to defaults and are warnings.
const VIEW_ENUMS = {
  type: { values: ['table', 'kanban', 'gallery', 'calendar', 'chart', 'gantt', 'dashboard', 'map', 'tool'] },
  calendarViewMode: { values: ['dayGridMonth', 'dayGridWeek', 'timeGridWeek', 'timeGridDay'], error: true },
  ganttZoom: { values: ['day', 'week', 'month'] },
  chartType: { values: ['bar', 'hbar', 'line', 'area', 'pie', 'donut', 'scatter'] },
  aggregation: { values: ['count', 'countNonEmpty', 'sum', 'average', 'min', 'max'] },
  dateBucket: { values: ['day', 'week', 'month', 'quarter', 'year'] },
  sortBy: { values: ['value', 'label', 'natural'] },
  sortDir: { values: ['asc', 'desc'] },
}
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}(?:[T ][0-9:.]+(?:Z|[+-]\d{2}:?\d{2})?)?$/
const OPTION_TYPES = new Set(['select', 'multiselect', 'status'])

const decodePath = (p) => {
  try { return decodeURIComponent(p) } catch { return p }
}
const stripFragment = (p) => p.replace(/[#?].*$/, '')
/** Markdown with fenced code, inline code and HTML comments blanked out (examples are not links). */
const proseOnly = (text) => text
  .replace(/^(\s*)(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1\2[ \t]*$/gm, '')
  .replace(/`[^`\n]*`/g, '')
  .replace(/<!--[\s\S]*?-->/g, '')

/** { fields: Map(key → { value, list }), folded: bool } for a leading YAML block; null without one. */
export function readFrontmatter(text) {
  const lines = String(text).replace(/^﻿/, '').split(/\r?\n/)
  if (lines[0] !== '---') return null
  const fields = new Map()
  let folded = false
  let current = null
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (line === '---' || line === '...') break
    const top = /^([^\s:#][^:]*?):[ \t]*(.*?)[ \t]*$/.exec(line)
    if (top) {
      current = { value: top[2], list: [] }
      fields.set(top[1], current)
      if (/^[>|][-+]?$/.test(top[2])) folded = true
      continue
    }
    const item = /^\s+-\s+(.*?)\s*$/.exec(line)
    if (item && current) current.list.push(item[1])
  }
  return { fields, folded }
}
const unquote = (v) => (/^(['"]).*\1$/.test(v) ? v.slice(1, -1) : v)

/** The moodboard JSON inside a .moodboard.md, or null. */
function moodboardData(text) {
  const m = /```moodboard\s*\n([\s\S]*?)\n```/.exec(text)
  if (!m) return null
  try { return JSON.parse(m[1]) } catch { return null }
}

/**
 * @param {{ rel: string, data: Buffer }[]} files
 * @returns {{ errors: string[], warnings: string[] }}
 */
export function contentFindings(files) {
  const errors = []
  const warnings = []
  const byRel = new Map(files.map((f) => [f.rel, f]))
  const text = (rel) => byRel.get(rel)?.data.toString('utf8') ?? null
  const json = (rel) => { try { return JSON.parse(text(rel)) } catch { return null } }
  const hasFile = (p) => byRel.has(p)
  const hasFolder = (p) => { const pre = `${p.replace(/\/+$/, '')}/`; return files.some((f) => f.rel.startsWith(pre)) }
  const hasMarker = (p, marker) => hasFile(`${p.replace(/\/+$/, '')}/${marker}`)

  // ---- links and embeds in markdown ----
  for (const f of files) {
    if (!/\.md$/i.test(f.rel) || /\.moodboard\.md$/i.test(f.rel) || /\.canvas\.md$/i.test(f.rel)) continue
    const body = proseOnly(f.data.toString('utf8'))
    const where = `workspace/${f.rel}`
    for (const m of body.matchAll(/(?:\|\s*|\]\()doc:([^\]\)\s|]+)/g)) {
      const target = stripFragment(decodePath(m[1]))
      if (target && !hasFile(target) && !hasFolder(target)) errors.push(`${where}: link to "${target}", which is not in workspace/`)
    }
    const embeds = [
      ...[...body.matchAll(/\[(database|sheet|html|pdf|file|audio):[^\]\n]*\]\(([^)\s]+)\)/g)].map((m) => [m[1], m[2]]),
      ...[...body.matchAll(/\[\[(database|sheet):[^|\]\n]*\|([^\]\n]+)\]\]/g)].map((m) => [m[1], m[2]]),
    ]
    for (const [kind, rawTarget] of embeds) {
      const target = stripFragment(decodePath(rawTarget.trim()))
      if (/^https?:/i.test(target)) continue
      const ok = kind === 'database' ? hasMarker(target, 'database.json')
        : kind === 'sheet' ? hasMarker(target, 'sheet.json')
          : hasFile(target)
      if (!ok) errors.push(`${where}: ${kind} embed points at "${target}", which is not in workspace/`)
    }
    for (const m of body.matchAll(/!\[[^\]\n]*\]\(((?:resources|documents)\/[^)\s]+)(?:\s+"[^"]*")?\)/g)) {
      const target = decodePath(m[1])
      if (!hasFile(target)) errors.push(`${where}: image "${target}" is not in workspace/`)
    }
    const fm = readFrontmatter(f.data.toString('utf8'))
    if (fm?.folded) warnings.push(`${where}: folded YAML (">-" / "|") in frontmatter — the properties panel cannot read it; use one line`)
    // The editor only recognises a scratch space whose opener is followed by its note line.
    const source = f.data.toString('utf8').replace(/\r\n/g, '\n')
    for (const m of source.matchAll(/^:::scratchspace "[^"\n]*"[^\n]*\n(?!> \*\*Note for AI:\*\* \S)/gm)) {
      errors.push(`${where}: ${m[0].trim()} must be followed by a "> **Note for AI:** …" line, then a blank line — otherwise it shows as plain text`)
    }
    // Table cells are saved by a converter without the page-link rule.
    const tableLinks = body.split('\n').filter((line) => /^\s*\|/.test(line) && /\]\(doc:|\|\s*doc:/.test(line))
    if (tableLinks.length) warnings.push(`${where}: ${tableLinks.length} table row(s) hold page links — they turn into plain text the first time the page is edited; move links out of tables`)
    if (/\.slides\.md$/i.test(f.rel) && /\$\{=?[A-Za-z]/.test(body)) {
      warnings.push(`${where}: slides do not resolve \${variables}; write the values out`)
    }
  }

  // ---- moodboards ----
  for (const f of files) {
    if (!/\.moodboard\.md$/i.test(f.rel)) continue
    const board = moodboardData(f.data.toString('utf8'))
    if (!board) { errors.push(`workspace/${f.rel}: no readable \`\`\`moodboard JSON block`); continue }
    for (const item of Array.isArray(board.items) ? board.items : []) {
      if (item?.type === 'doc' && typeof item.path === 'string' && !hasFile(item.path)) errors.push(`workspace/${f.rel}: card "${item.id}" points at "${item.path}", which is not in workspace/`)
      if (item?.type === 'image' && typeof item.src === 'string' && !/^https:/i.test(item.src) && !hasFile(decodePath(item.src))) {
        errors.push(`workspace/${f.rel}: image "${item.src}" is not in workspace/`)
      }
    }
  }

  // ---- databases and sheets ----
  for (const f of files) {
    const base = f.rel.split('/').pop()
    if (base !== 'database.json' && base !== 'sheet.json') continue
    const folder = f.rel.slice(0, -(base.length + 1))
    const config = json(f.rel)
    if (!config) continue
    const columns = Array.isArray(config.columns) ? config.columns : []
    for (const c of columns) {
      for (const [opt, color] of Object.entries(c?.optionColors || {})) {
        if (!OPTION_COLORS.has(color)) warnings.push(`workspace/${f.rel}: column "${c.id}" option "${opt}" uses colour "${color}" — use one of ${[...OPTION_COLORS].join(', ')}`)
      }
    }
    for (const v of Array.isArray(config.views) ? config.views : []) {
      for (const [key, { values, error }] of Object.entries(VIEW_ENUMS)) {
        if (v?.[key] === undefined || values.includes(v[key])) continue
        ;(error ? errors : warnings).push(`workspace/${f.rel}: view "${v.name || v.id}" has ${key} "${v[key]}" — use one of ${values.join(', ')}`)
      }
      if (v?.type === 'tool' && !(typeof v.toolPath === 'string' && hasFile(v.toolPath))) errors.push(`workspace/${f.rel}: view "${v.name || v.id}" runs "${v.toolPath}", which is not in workspace/`)
      for (const flt of Array.isArray(v?.filters) ? v.filters : []) {
        if (typeof flt?.value === 'string' && ISO_DATE_RE.test(flt.value)) warnings.push(`workspace/${f.rel}: view "${v.name || v.id}" filters on the fixed date ${flt.value} — sample dates move at install, fixed filters do not`)
      }
    }
    if (base === 'database.json') {
      const byId = new Map(columns.filter((c) => c && typeof c.id === 'string').map((c) => [c.id, c]))
      const rows = files.filter((r) => r.rel.startsWith(`${folder}/`) && !r.rel.slice(folder.length + 1).includes('/') && /\.md$/i.test(r.rel))
      for (const row of rows) {
        const fm = readFrontmatter(row.data.toString('utf8'))
        const where = `workspace/${row.rel}`
        if (!fm || !fm.fields.has('_emoji')) warnings.push(`${where}: no _emoji — the app writes a random one into the file on first open`)
        if (!fm) continue
        for (const [key, { value, list }] of fm.fields) {
          const col = byId.get(key)
          if (!col) continue
          if ((col.type === 'date' || col.type === 'datetime') && value && ISO_DATE_RE.test(value)) {
            warnings.push(`${where}: ${key}: ${value} — quote dates ('${value}'); unquoted ones are rewritten as timestamps on first open`)
          }
          if (OPTION_TYPES.has(col.type) && Array.isArray(col.options)) {
            const values = col.type === 'multiselect' ? list.map(unquote) : (value ? [unquote(value)] : [])
            for (const v of values) if (!col.options.includes(v)) warnings.push(`${where}: ${key} "${v}" is not one of the column's options`)
          }
        }
      }
    } else {
      const csv = text(`${folder}/data.csv`)
      if (csv !== null) {
        const header = csv.replace(/^﻿/, '').split(/\r?\n/, 1)[0].split(',').map((h) => unquote(h.trim()))
        if (header[header.length - 1] !== '_hnid') warnings.push(`workspace/${folder}/data.csv: the last column must be _hnid (r_<uuid> per row) — otherwise the file is rewritten on first open`)
        const names = columns.map((c) => c?.name).filter(Boolean)
        const missing = names.filter((n) => !header.includes(n))
        if (missing.length) warnings.push(`workspace/${folder}/data.csv: header has no column named ${missing.map((n) => `"${n}"`).join(', ')} (the header row uses column names)`)
      }
    }
  }

  // ---- tools, recipes, registry ----
  const tools = json('resources/html/tool_registry.json')
  for (const tool of Array.isArray(tools?.tools) ? tools.tools : []) {
    if (typeof tool?.entryPath === 'string' && !hasFile(tool.entryPath)) errors.push(`resources/html/tool_registry.json: "${tool.name}" points at "${tool.entryPath}", which is not in workspace/`)
  }
  const recipes = json('ai_prompt_overrides.json')
  for (const r of Array.isArray(recipes?.overrides) ? recipes.overrides : []) {
    for (const key of ['required_documents', 'optional_documents']) {
      for (const p of Array.isArray(r?.[key]) ? r[key] : []) {
        if (typeof p === 'string' && !hasFile(p) && !hasFolder(p)) errors.push(`ai_prompt_overrides.json: recipe "${r.id}" ${key} "${p}" is not in workspace/`)
      }
    }
  }
  const registry = json('documents-registry.json')
  if (registry && !Array.isArray(registry)) {
    for (const d of Array.isArray(registry.documents) ? registry.documents : []) {
      if (typeof d?.path === 'string' && !hasFile(d.path.replace(/\\/g, '/'))) errors.push(`documents-registry.json: "${d.path}" is not in workspace/`)
    }
    for (const d of Array.isArray(registry.folders) ? registry.folders : []) {
      if (typeof d?.path === 'string' && !hasFolder(d.path.replace(/\\/g, '/'))) errors.push(`documents-registry.json: folder "${d.path}" is not in workspace/`)
    }
  }
  return { errors, warnings }
}

// ---- plugin store ---------------------------------------------------------------

let pluginRegistryPromise = null
/** The hillnote-plugins registry → Map(id → entry). Throws when unreachable. */
export function fetchPluginRegistry() {
  if (!pluginRegistryPromise) {
    pluginRegistryPromise = (async () => {
      let res
      try {
        res = await fetch(PLUGIN_REGISTRY_URL, { signal: AbortSignal.timeout(15000) })
      } catch (err) {
        throw new Error(`the plugin registry (${PLUGIN_REGISTRY_URL}) is unreachable: ${err.message}`)
      }
      if (!res.ok) throw new Error(`the plugin registry (${PLUGIN_REGISTRY_URL}) answered ${res.status}`)
      const data = await res.json()
      const list = Array.isArray(data) ? data : (Array.isArray(data?.plugins) ? data.plugins : [])
      return new Map(list.filter((e) => e && typeof e.id === 'string').map((e) => [e.id, e]))
    })()
  }
  return pluginRegistryPromise
}

const PUBLISH_PLUGINS_FIRST = 'templates that reference plugins need the hillnote-plugins registry published first (see PUBLISH.md)'

/**
 * Download one referenced plugin's release archive, verify it against the
 * template's pin, and return its files as plugins/<id>/… entries.
 */
export async function inlinePlugin(ref, pluginRegistry) {
  const entry = pluginRegistry.get(ref.id)
  if (!entry) throw new Error(`plugin "${ref.id}" is not in the plugin registry`)
  if (entry.version !== ref.version || entry.sha256 !== ref.sha256) {
    throw new Error(`plugin "${ref.id}" is pinned at ${ref.version} (${ref.sha256.slice(0, 12)}…) but the registry lists ${entry.version} (${String(entry.sha256).slice(0, 12)}…)`)
  }
  // https only — except a loopback plugin registry used for local testing,
  // whose archives are served from the same loopback server.
  const localRegistry = /^http:\/\/127\.0\.0\.1(:\d+)?\//.test(PLUGIN_REGISTRY_URL)
  const okUrl = typeof entry.zipUrl === 'string'
    && (entry.zipUrl.startsWith('https://') || (localRegistry && /^http:\/\/127\.0\.0\.1(:\d+)?\//.test(entry.zipUrl)))
  if (!okUrl) throw new Error(`plugin "${ref.id}": zipUrl must be https`)
  const res = await fetch(entry.zipUrl, { signal: AbortSignal.timeout(60000) })
  if (!res.ok) throw new Error(`plugin "${ref.id}": download failed (${res.status})`)
  const declared = Number(res.headers.get('content-length') || 0)
  if (declared > PLUGIN_ARCHIVE_MAX_BYTES) throw new Error(`plugin "${ref.id}": archive larger than 50 MB`)
  const buf = Buffer.from(await res.arrayBuffer())
  if (buf.length > PLUGIN_ARCHIVE_MAX_BYTES) throw new Error(`plugin "${ref.id}": archive larger than 50 MB`)
  if (sha256(buf) !== ref.sha256) throw new Error(`plugin "${ref.id}": the downloaded archive does not match the pinned sha256`)

  const zipEntries = readZip(buf, { maxEntries: 2000, maxFileBytes: policyLib.LIMITS.maxFileBytes, maxTotalBytes: 200 * 1024 * 1024 })
  const files = []
  const skipped = []
  let manifest = null
  for (const z of zipEntries) {
    const issue = entryNameIssue(z.name)
    if (issue) throw new Error(`plugin "${ref.id}": unsafe archive entry ${JSON.stringify(z.name)} (${issue})`)
    if (z.isSymlink) throw new Error(`plugin "${ref.id}": symlink entry ${z.name}`)
    if (z.isDirectory) continue
    if (z.name === 'manifest.json') {
      try { manifest = JSON.parse(z.data.toString('utf8')) } catch { throw new Error(`plugin "${ref.id}": manifest.json is not valid JSON`) }
    }
    const rel = `plugins/${ref.id}/${z.name.replace(/\\/g, '/')}`
    const verdict = policy.classify(rel, { pluginIds: [ref.id] })
    if (!verdict.allow) { skipped.push({ rel, reason: verdict.reason }); continue }
    files.push({ rel, data: z.data })
  }
  if (!manifest) throw new Error(`plugin "${ref.id}": archive has no manifest.json at its root`)
  if (manifest.id !== ref.id) throw new Error(`plugin "${ref.id}": archive manifest id is "${manifest.id}"`)
  if (manifest.version !== ref.version) throw new Error(`plugin "${ref.id}": archive manifest version is "${manifest.version}", pinned ${ref.version}`)
  return {
    files,
    skipped,
    info: {
      id: ref.id,
      name: typeof entry.name === 'string' && entry.name ? entry.name : ref.id,
      version: ref.version,
      sha256: ref.sha256,
      permissions: Array.isArray(entry.permissions) ? entry.permissions.filter((p) => typeof p === 'string') : [],
      networkHosts: Array.isArray(entry.networkHosts) ? entry.networkHosts.filter((h) => typeof h === 'string') : [],
    },
  }
}

// ---- one template, end to end --------------------------------------------------

/**
 * Read and check one template. Never throws for a template problem — every
 * issue lands in `errors` (fail CI), `warnings` (worth fixing) or `advisories`
 * (for the reviewer).
 * @param {string} id
 * @param {{ committed?: Map, pluginRegistry?: Map|null, pluginRegistryError?: string|null }} ctx
 */
export function loadTemplate(id, ctx = {}) {
  const dir = path.join(TEMPLATES_DIR, id)
  const errors = []
  const warnings = []
  const advisories = []
  const t = { id, dir, errors, warnings, advisories, manifest: null, files: [], sourceHash: null }

  const manifestPath = path.join(dir, 'template.json')
  let raw = null
  if (!fs.existsSync(manifestPath)) errors.push('template.json is missing')
  else {
    try { raw = readJsonFile(manifestPath) } catch (err) { errors.push(`template.json is not valid JSON: ${err.message}`) }
  }
  if (raw) {
    const res = policyLib.validateTemplateManifest(raw, { folderId: id })
    if (!res.ok) errors.push(...res.errors.map((e) => `template.json: ${e}`))
    else t.manifest = res.manifest
    // The snapshot stub's placeholders must be replaced before a template ships.
    for (const [field, value] of [['name', raw.name], ['tagline', raw.tagline], ['description', raw.description], ['overview', raw.overview], ['author.name', raw.author?.name]]) {
      if (typeof value === 'string' && /^\s*TODO\b/i.test(value)) errors.push(`template.json: ${field} still has its TODO placeholder`)
    }
  }

  // Unexpected files beside template.json / workspace/ / media/.
  if (fs.existsSync(dir)) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      if (OS_LITTER.has(ent.name)) continue
      if (!['template.json', 'workspace', 'media'].includes(ent.name)) warnings.push(`unexpected ${ent.isDirectory() ? 'folder' : 'file'} templates/${id}/${ent.name} (ignored)`)
    }
  }

  // ---- workspace/ ----
  const wsDir = path.join(dir, 'workspace')
  if (!fs.existsSync(wsDir)) errors.push('workspace/ folder is missing')
  const walked = walkRegular(wsDir)
  for (const p of walked.problems) errors.push(`workspace/${p.rel}: ${p.reason} — only regular files are allowed`)
  let total = 0
  for (const f of walked.files) {
    if (f.rel === 'plugins' || f.rel.startsWith('plugins/')) {
      errors.push(`workspace/${f.rel}: plugins are not authored as files — reference them in template.json "plugins" (plugin store)`)
      continue
    }
    const verdict = policy.classify(f.rel, { pluginIds: [] })
    if (!verdict.allow) { errors.push(`workspace/${f.rel}: not allowed in a template (${verdict.reason})`); continue }
    if (f.size > policyLib.LIMITS.maxFileBytes) { errors.push(`workspace/${f.rel}: larger than ${policyLib.LIMITS.maxFileBytes / 1048576} MB`); continue }
    total += f.size
    t.files.push({ rel: f.rel, data: fs.readFileSync(f.abs) })
  }
  if (!t.files.length && fs.existsSync(wsDir)) errors.push('workspace/ has no files')
  if (t.files.length > policyLib.LIMITS.maxFiles) errors.push(`more than ${policyLib.LIMITS.maxFiles} files`)
  if (total > policyLib.LIMITS.maxTotalBytes) errors.push(`workspace/ is larger than ${policyLib.LIMITS.maxTotalBytes / 1048576} MB`)
  for (const c of policy.findCollisions(t.files.map((f) => f.rel))) {
    errors.push(`workspace/${c.path}: ${c.reason === 'fold-collision' ? 'clashes with another name that differs only in case/Unicode form' : 'is both a file and a folder'}`)
  }

  const byRel = new Map(t.files.map((f) => [f.rel, f]))
  const text = (rel) => byRel.get(rel)?.data.toString('utf8') ?? null

  for (const f of t.files) {
    if (/\.md$/i.test(f.rel) && policyLib.isEncryptedContent(f.data)) errors.push(`workspace/${f.rel}: encrypted documents cannot be shared`)
    if (isTextFile(f.rel)) {
      for (const p of privacyFindings(f.data.toString('utf8'))) errors.push(`workspace/${f.rel}: contains ${p.kind} (${p.sample}) — remove it`)
    }
    if (/\.json$/i.test(f.rel)) {
      try { JSON.parse(f.data.toString('utf8')) } catch (err) { errors.push(`workspace/${f.rel}: invalid JSON (${err.message})`) }
    }
  }

  // ---- cross-references ----
  const hasFile = (p) => byRel.has(p)
  const hasFolderMarker = (p) => ['database.json', 'tasklist.json', 'sheet.json'].some((m) => byRel.has(`${p.replace(/\/+$/, '')}/${m}`))
  if (t.manifest?.open && !hasFile(t.manifest.open)) errors.push(`template.json: open "${t.manifest.open}" is not in workspace/`)
  if (hasFile('dashboard.json')) {
    let dash = null
    try { dash = JSON.parse(text('dashboard.json')) } catch { /* reported above */ }
    if (dash) {
      const refs = dashboardRefs(dash)
      for (const [where, p] of refs.files) if (!hasFile(p)) errors.push(`dashboard.json ${where}: "${p}" is not in workspace/`)
      for (const [where, p] of refs.folders) if (!hasFolderMarker(p)) errors.push(`dashboard.json ${where}: "${p}" is not a database in workspace/`)
    }
  }
  const lint = contentFindings(t.files)
  errors.push(...lint.errors)
  warnings.push(...lint.warnings)
  for (const f of t.files) {
    if (!f.rel.endsWith('/tool.meta.json')) continue
    let meta = null
    try { meta = JSON.parse(f.data.toString('utf8')) } catch { continue }
    for (const [kind, marker] of [['sheets', 'sheet.json'], ['databases', 'database.json']]) {
      for (const s of Array.isArray(meta?.[kind]) ? meta[kind] : []) {
        if (typeof s?.path !== 'string') continue
        const folder = `documents/${s.path.replace(/^\/+|\/+$/g, '')}`
        if (!hasFile(`${folder}/${marker}`)) errors.push(`workspace/${f.rel}: ${kind} "${s.path}" has no ${folder}/${marker}`)
      }
    }
  }
  if (hasFile('ai_prompt_overrides.json')) {
    try {
      const o = JSON.parse(text('ai_prompt_overrides.json'))
      if (o.overrides !== undefined && !Array.isArray(o.overrides)) errors.push('ai_prompt_overrides.json: overrides must be a list')
    } catch { /* reported above */ }
  }

  // ---- media ----
  if (t.manifest) {
    const media = path.join(dir, 'media')
    const checkImage = (rel, maxBytes, label) => {
      const abs = path.join(dir, rel)
      let st
      try { st = fs.lstatSync(abs) } catch { errors.push(`${label} ${rel} is missing`); return null }
      if (!st.isFile()) { errors.push(`${label} ${rel} must be a regular file`); return null }
      if (st.size > maxBytes) errors.push(`${label} ${rel} is ${Math.round(st.size / 1024)} KB — keep it under ${Math.round(maxBytes / 1024)} KB`)
      return fs.readFileSync(abs)
    }
    const icon = checkImage(t.manifest.icon, MEDIA_LIMITS.iconMaxBytes, 'icon')
    if (icon) {
      const size = imageSize(icon)
      if (!size) warnings.push(`icon ${t.manifest.icon}: format not recognised (use WebP or PNG)`)
      else {
        if (Math.min(size.width, size.height) < MEDIA_LIMITS.iconMinPx) errors.push(`icon is ${size.width}×${size.height} — at least ${MEDIA_LIMITS.iconMinPx}×${MEDIA_LIMITS.iconMinPx}`)
        if (size.width !== size.height) warnings.push(`icon is ${size.width}×${size.height} — tiles expect a square icon`)
      }
    }
    if (t.manifest.hero) checkImage(t.manifest.hero, MEDIA_LIMITS.otherMaxBytes, 'hero')
    for (const s of t.manifest.screenshots) checkImage(s, MEDIA_LIMITS.otherMaxBytes, 'screenshot')
    const used = new Set([t.manifest.icon, t.manifest.hero, ...t.manifest.screenshots].filter(Boolean))
    const walkedMedia = walkRegular(media)
    for (const p of walkedMedia.problems) errors.push(`media/${p.rel}: ${p.reason}`)
    for (const f of walkedMedia.files) if (!used.has(`media/${f.rel}`)) warnings.push(`media/${f.rel} is not used by template.json`)
  }

  // ---- plugin references ----
  if (t.manifest?.plugins.length) {
    if (!ctx.pluginRegistry) {
      errors.push(`${PUBLISH_PLUGINS_FIRST}: ${ctx.pluginRegistryError || 'plugin registry not loaded'}`)
    } else {
      for (const ref of t.manifest.plugins) {
        const e = ctx.pluginRegistry.get(ref.id)
        if (!e) errors.push(`plugin "${ref.id}" is not in the plugin registry`)
        else if (e.version !== ref.version || e.sha256 !== ref.sha256) {
          errors.push(`plugin "${ref.id}" is pinned at ${ref.version} but the plugin registry lists ${e.version} — update the pin (version + sha256) to the listed release`)
        }
      }
    }
  }

  // ---- tools (advisory) ----
  t.tools = toolsOf(t.files)
  for (const tool of t.tools) {
    if (tool.externalHosts.length) advisories.push(`tool "${tool.name}" reaches out to: ${tool.externalHosts.join(', ')}`)
  }

  // ---- version discipline ----
  if (t.manifest) {
    t.sourceHash = computeSourceHash(t.files, t.manifest.plugins, { dateAnchor: t.manifest.dateAnchor })
    const prev = ctx.committed?.get(id)
    if (prev) {
      const cmp = compareSemver(t.manifest.version, prev.version)
      if (cmp < 0) errors.push(`version ${t.manifest.version} is lower than the released ${prev.version}`)
      if (cmp === 0 && prev.sourceHash && prev.sourceHash !== t.sourceHash) {
        errors.push(`content changed but version is still ${prev.version} — a released version is immutable: bump "version" in template.json`)
      }
    }
  }
  return t
}

/** The tools in a template and the hosts their code mentions. */
export function toolsOf(files) {
  const byRel = new Map(files.map((f) => [f.rel, f]))
  const paths = files.map((f) => f.rel)
  let registryNames = new Map()
  if (byRel.has('resources/html/tool_registry.json')) {
    try {
      const reg = JSON.parse(byRel.get('resources/html/tool_registry.json').data.toString('utf8'))
      registryNames = new Map((Array.isArray(reg?.tools) ? reg.tools : [])
        .filter((x) => typeof x?.entryPath === 'string' && typeof x?.name === 'string')
        .map((x) => [x.entryPath.replace(/\\/g, '/'), x.name]))
    } catch { /* invalid JSON is reported elsewhere */ }
  }
  return policyLib.listToolEntries(paths).map((entry) => {
    const isFolder = !/\.html?$/i.test(entry)
    const members = isFolder ? files.filter((f) => f.rel.startsWith(`${entry}/`)) : [byRel.get(entry)]
    let name = null
    if (isFolder && byRel.has(`${entry}/tool.meta.json`)) {
      try { name = JSON.parse(byRel.get(`${entry}/tool.meta.json`).data.toString('utf8'))?.name || null } catch { /* ignore */ }
    }
    if (!name) {
      for (const [entryPath, n] of registryNames) if (entryPath === entry || entryPath.startsWith(`${entry}/`)) { name = n; break }
    }
    if (!name) name = entry.split('/').pop().replace(/\.html?$/i, '')
    const hosts = new Set()
    for (const f of members) {
      if (f && /\.(html?|js|mjs|css)$/i.test(f.rel)) for (const h of externalHosts(f.data.toString('utf8'))) hosts.add(h)
    }
    return { name: String(name).slice(0, 80), externalHosts: [...hosts].sort() }
  })
}

// ---- registry entries ------------------------------------------------------------

const enc = (rel) => rel.split('/').map(encodeURIComponent).join('/')
export const mediaUrl = (commit, id, rel) => `${RAW_BASE}/${commit}/templates/${enc(id)}/${enc(rel)}`
export const releaseTag = (id, version) => `${id}-v${version}`
export const zipName = (id, version) => `${id}-${version}.zip`
export const zipUrlFor = (id, version) => `${RELEASE_BASE}/${releaseTag(id, version)}/${zipName(id, version)}`

/**
 * Build one template's zip (workspace files + inlined plugins).
 * @returns {Promise<{ zip: Buffer, sha256: string, plugins: object[], warnings: string[] }>}
 */
export async function buildTemplateZip(t, pluginRegistry) {
  const entries = t.files.map((f) => ({ name: f.rel, data: applyBuildTransforms(f.rel, f.data) }))
  const plugins = []
  const warnings = []
  for (const ref of t.manifest.plugins) {
    const inlined = await inlinePlugin(ref, pluginRegistry)
    entries.push(...inlined.files.map((f) => ({ name: f.rel, data: f.data })))
    for (const s of inlined.skipped) warnings.push(`plugin "${ref.id}": ${s.rel} left out (${s.reason})`)
    plugins.push(inlined.info)
  }
  const allPaths = entries.map((e) => e.name)
  if (allPaths.length > policyLib.LIMITS.maxFiles) throw new Error(`${t.id}: more than ${policyLib.LIMITS.maxFiles} files with plugins inlined`)
  const collisions = policy.findCollisions(allPaths)
  if (collisions.length) throw new Error(`${t.id}: ${collisions[0].path} ${collisions[0].reason}`)
  const zip = buildZip(entries)
  if (zip.length > policyLib.LIMITS.maxZipBytes) throw new Error(`${t.id}: zip is larger than ${policyLib.LIMITS.maxZipBytes / 1048576} MB`)
  return { zip, sha256: sha256(zip), plugins, warnings }
}

/** Plugin listing info without downloading (carried-forward releases). */
export function pluginInfos(t, pluginRegistry) {
  return t.manifest.plugins.map((ref) => {
    const e = pluginRegistry?.get(ref.id) || {}
    return {
      id: ref.id,
      name: typeof e.name === 'string' && e.name ? e.name : ref.id,
      version: ref.version,
      sha256: ref.sha256,
      permissions: Array.isArray(e.permissions) ? e.permissions.filter((p) => typeof p === 'string') : [],
      networkHosts: Array.isArray(e.networkHosts) ? e.networkHosts.filter((h) => typeof h === 'string') : [],
    }
  })
}

/** The registry entry (contract §2), field order fixed. */
export function composeEntry(t, { commit, plugins, release }) {
  const m = t.manifest
  const paths = t.files.map((f) => f.rel)
  const byRel = new Map(t.files.map((f) => [f.rel, f]))
  const readText = (rel) => byRel.get(rel)?.data.toString('utf8') ?? null
  return {
    id: m.id,
    version: m.version,
    name: m.name,
    tagline: m.tagline,
    description: m.description,
    setups: m.setups,
    tags: m.tags,
    featured: m.featured,
    author: m.author,
    license: m.license,
    credits: m.credits,
    minAppVersion: m.minAppVersion,
    open: m.open,
    overview: m.overview,
    color: m.color,
    dateAnchor: m.dateAnchor,
    iconUrl: mediaUrl(commit, m.id, m.icon),
    heroUrl: m.hero ? mediaUrl(commit, m.id, m.hero) : null,
    screenshotUrls: m.screenshots.map((s) => mediaUrl(commit, m.id, s)),
    includes: policyLib.computeIncludes(paths, readText, m.plugins.map((p) => p.id)),
    plugins,
    tools: t.tools,
    sourceHash: t.sourceHash,
    zipUrl: release.zipUrl,
    sha256: release.sha256,
    sizeBytes: release.sizeBytes,
    repoPath: `templates/${m.id}`,
    releasedAt: release.releasedAt,
  }
}

/** Featured first, then by name, then id — the order the app's strip shows. */
export function sortEntries(entries) {
  return [...entries].sort((a, b) => (Number(b.featured) - Number(a.featured))
    || a.name.localeCompare(b.name, 'en')
    || byteOrder(a.id, b.id))
}

export function registryDocument(entries, generatedAt) {
  return { formatVersion: policyLib.FORMAT_VERSION, generatedAt, templates: sortEntries(entries) }
}

export function nowIso() {
  const epoch = process.env.SOURCE_DATE_EPOCH
  return epoch ? new Date(Number(epoch) * 1000).toISOString() : new Date().toISOString()
}

/**
 * Load the plugin registry only when some template references plugins — a
 * repo of plugin-free templates never touches the network.
 */
export async function pluginRegistryFor(ids) {
  const needs = ids.some((id) => {
    try {
      const raw = readJsonFile(path.join(TEMPLATES_DIR, id, 'template.json'))
      return Array.isArray(raw?.plugins) && raw.plugins.length > 0
    } catch { return false }
  })
  if (!needs) return { pluginRegistry: null, pluginRegistryError: null }
  try {
    return { pluginRegistry: await fetchPluginRegistry(), pluginRegistryError: null }
  } catch (err) {
    return { pluginRegistry: null, pluginRegistryError: err.message }
  }
}
