#!/usr/bin/env node
/**
 * Turn a real Hillnote workspace into a template.
 *
 *   npm run snapshot -- <workspaceFolder> <id>          first snapshot
 *   npm run snapshot -- <workspaceFolder> <id> --force  replace templates/<id>/workspace/
 *
 * Copies the workspace through the app's own policy into templates/<id>/workspace/
 * and leaves out everything a template must not carry: machine and sync state
 * (.system/, .hillnote/, plugins/.state.json …), generated files (readme.md,
 * agents.md, CLAUDE.md, topics.md), triggers, tool settings, the personal
 * notepad, and the personal folders (quicknotes, recordings, imports). The
 * dashboard is scrubbed of workspace ids/paths/names and sheet owner markers are
 * dropped. Plugins are never copied: reference them in template.json "plugins".
 *
 * Writes only inside templates/<id>/. Reads the source folder, never changes it.
 */
import fs from 'node:fs'
import path from 'node:path'
import {
  TEMPLATES_DIR, policy, policyLib, syncRules, transforms, walkRegular, isTextFile, privacyFindings,
} from '../lib/templates.mjs'

const args = process.argv.slice(2)
const force = args.includes('--force')
const [srcArg, id] = args.filter((a) => !a.startsWith('--'))
if (!srcArg || !id) {
  console.error('Usage: npm run snapshot -- <workspaceFolder> <id> [--force]')
  process.exit(1)
}
if (!policyLib.TEMPLATE_ID_RE.test(id)) {
  console.error(`✗ id "${id}" must match ${policyLib.TEMPLATE_ID_RE}`)
  process.exit(1)
}
const src = path.resolve(srcArg)
if (!fs.existsSync(src) || !fs.lstatSync(src).isDirectory()) {
  console.error(`✗ ${src} is not a folder`)
  process.exit(1)
}

const templateDir = path.join(TEMPLATES_DIR, id)
const dest = path.join(templateDir, 'workspace')
if (path.dirname(dest) !== templateDir || !templateDir.startsWith(TEMPLATES_DIR + path.sep)) {
  console.error('✗ refusing to write outside templates/<id>/')
  process.exit(1)
}
if (fs.existsSync(dest) && !force) {
  console.error(`✗ templates/${id}/workspace already exists — pass --force to replace it`)
  process.exit(1)
}

const PERSONAL = ['documents/quicknotes/', 'documents/recordings/', 'documents/imports/']
const { files, problems } = walkRegular(src)
const skipped = new Map() // reason → [rel]
const skip = (reason, rel) => { if (!skipped.has(reason)) skipped.set(reason, []); skipped.get(reason).push(rel) }
for (const p of problems) skip(p.reason, p.rel)

const pluginIdsSeen = new Set()
const encrypted = []
const keep = []
for (const f of files) {
  const folded = syncRules.foldPath(f.rel)
  if (f.rel.startsWith('plugins/')) {
    const pid = f.rel.split('/')[1]
    if (policyLib.PLUGIN_ID_RE.test(pid)) pluginIdsSeen.add(pid)
    skip('plugin files (reference plugins in template.json instead)', f.rel)
    continue
  }
  if (PERSONAL.some((p) => folded.startsWith(p))) { skip('personal folder', f.rel); continue }
  const verdict = policy.classify(f.rel, { pluginIds: [] })
  if (!verdict.allow) { skip(verdict.reason, f.rel); continue }
  if (f.size > policyLib.LIMITS.maxFileBytes) { skip('larger than 25 MB', f.rel); continue }
  const data = fs.readFileSync(f.abs)
  if (/\.md$/i.test(f.rel) && policyLib.isEncryptedContent(data)) { encrypted.push(f.rel); continue }
  keep.push({ rel: f.rel, data })
}

if (encrypted.length) {
  console.error('✗ encrypted documents cannot go into a template — decrypt or remove them first:')
  for (const rel of encrypted) console.error(`    ${rel}`)
  process.exit(1)
}

// ---- transforms ----
const copied = new Set(keep.map((f) => f.rel))
const json = (data) => JSON.parse(data.toString('utf8'))
const out = (value) => Buffer.from(`${JSON.stringify(value, null, 2)}\n`, 'utf8')
for (const f of keep) {
  try {
    if (f.rel === 'dashboard.json') {
      f.data = out(transforms.scrubDashboard(json(f.data)))
    } else if (f.rel.endsWith('/sheet.json')) {
      const { value, changed } = transforms.stripSheetOwner(json(f.data))
      if (changed) f.data = out(value)
    } else if (f.rel === 'documents-registry.json') {
      // Keep only the entries for files and folders that made it in.
      const reg = json(f.data)
      if (reg && !Array.isArray(reg) && typeof reg === 'object') {
        const norm = (p) => String(p || '').replace(/\\/g, '/').replace(/\/+$/, '')
        if (Array.isArray(reg.documents)) reg.documents = reg.documents.filter((d) => copied.has(norm(d?.path)))
        if (Array.isArray(reg.folders)) reg.folders = reg.folders.filter((d) => [...copied].some((p) => p.startsWith(`${norm(d?.path)}/`)))
        f.data = out(reg)
      }
    }
  } catch (err) {
    console.error(`⚠ ${f.rel}: left as is (${err.message})`)
  }
}

// ---- privacy (validate fails on these; the author must clean them up) ----
const privacy = []
for (const f of keep) {
  if (!isTextFile(f.rel)) continue
  for (const p of privacyFindings(f.data.toString('utf8'))) privacy.push(`${f.rel}: ${p.kind} (${p.sample})`)
}

// ---- write ----
fs.rmSync(dest, { recursive: true, force: true })
let bytes = 0
for (const f of keep) {
  const abs = path.join(dest, ...f.rel.split('/'))
  if (!abs.startsWith(dest + path.sep)) throw new Error(`refusing to write ${f.rel}`)
  fs.mkdirSync(path.dirname(abs), { recursive: true })
  fs.writeFileSync(abs, f.data)
  bytes += f.data.length
}

const manifestPath = path.join(templateDir, 'template.json')
let wroteStub = false
if (!fs.existsSync(manifestPath)) {
  const guessOpen = copied.has('documents/Start here.md')
    ? 'documents/Start here.md'
    : [...copied].filter((p) => /^documents\/[^/]+\.md$/.test(p) && !/\.(slides|canvas|moodboard)\.md$/.test(p)).sort()[0]
  const stub = {
    formatVersion: 1,
    id,
    version: '1.0.0',
    name: path.basename(src).slice(0, 60),
    tagline: 'TODO: one line about what this workspace is for',
    description: 'TODO: what is inside and how to use it.',
    setups: [],
    tags: [],
    author: { name: 'TODO' },
    license: 'MIT',
    ...(guessOpen ? { open: guessOpen } : {}),
    overview: 'TODO: one or two sentences about this workspace (it becomes the new workspace overview).',
    ...(pluginIdsSeen.size ? { plugins: [] } : {}),
    icon: 'media/icon.webp',
  }
  fs.writeFileSync(manifestPath, `${JSON.stringify(stub, null, 2)}\n`)
  wroteStub = true
}
fs.mkdirSync(path.join(templateDir, 'media'), { recursive: true })

console.log(`✓ templates/${id}/workspace: ${keep.length} files, ${(bytes / 1024).toFixed(0)} KB`)
if (skipped.size) {
  console.log('\nleft out:')
  for (const [reason, list] of [...skipped].sort((a, b) => b[1].length - a[1].length)) {
    console.log(`  ${String(list.length).padStart(4)}  ${reason}  (e.g. ${list.slice(0, 2).join(', ')})`)
  }
}
if (pluginIdsSeen.size) {
  console.log(`\nplugins in the source workspace: ${[...pluginIdsSeen].join(', ')}`)
  console.log('  → to include one, add { "id", "version", "sha256" } from the plugin store registry to template.json "plugins".')
}
if (privacy.length) {
  console.log('\n⚠ private details found — validate will fail until they are removed:')
  for (const p of privacy.slice(0, 20)) console.log(`    ${p}`)
  if (privacy.length > 20) console.log(`    … and ${privacy.length - 20} more`)
}
console.log('\nnext:')
if (wroteStub) console.log(`  - fill in templates/${id}/template.json (every TODO)`)
console.log(`  - add templates/${id}/media/icon.webp (square, transparent background, dark shapes)`)
console.log(`  - npm run validate -- ${id}`)
