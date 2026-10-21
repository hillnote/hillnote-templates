#!/usr/bin/env node
/**
 * Build template zips and registry.json.
 *
 *   npm run build                 every template → dist/<id>-<version>.zip + dist/registry.json
 *   node scripts/build.mjs --check
 *                                 build in memory, write nothing, fail on any problem (CI)
 *   node scripts/build.mjs --only-unreleased --released-tags released.txt --commit <sha>
 *                                 the release workflow: zips only for versions with no
 *                                 <id>-v<version> tag yet; released versions are carried
 *                                 forward from the committed registry.json. Also writes
 *                                 dist/release-plan.json for the workflow.
 *
 * Zips are deterministic (lib/buildZip.mjs): the zip root is the workspace root,
 * plugin-store archives referenced in template.json are inlined under
 * plugins/<id>/ after their sha256 pin is verified.
 */
import fs from 'node:fs'
import path from 'node:path'
import {
  ROOT, listTemplateIds, loadTemplate, readCommittedRegistry, pluginRegistryFor, buildTemplateZip,
  composeEntry, pluginInfos, registryDocument, releaseTag, zipName, zipUrlFor, nowIso,
} from '../lib/templates.mjs'

const args = process.argv.slice(2)
const flag = (name) => args.includes(name)
const opt = (name, fallback) => {
  const i = args.indexOf(name)
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback
}
const check = flag('--check')
const onlyUnreleased = flag('--only-unreleased')
const outDir = path.resolve(ROOT, opt('--out', 'dist'))
const commit = opt('--commit', process.env.GITHUB_SHA || 'main')
if (!/^(main|[0-9a-f]{7,40})$/.test(commit)) {
  console.error(`✗ --commit must be a git sha or "main", got ${commit}`)
  process.exit(1)
}
const releasedTagsFile = opt('--released-tags', null)
const releasedTags = new Set(releasedTagsFile && fs.existsSync(releasedTagsFile)
  ? fs.readFileSync(releasedTagsFile, 'utf8').split('\n').map((s) => s.trim()).filter(Boolean)
  : [])
if (onlyUnreleased && !releasedTagsFile) {
  console.error('✗ --only-unreleased needs --released-tags <file> (one tag per line)')
  process.exit(1)
}

const ids = listTemplateIds()
const committed = readCommittedRegistry()
const ctx = { committed, ...(await pluginRegistryFor(ids)) }
const templates = ids.map((id) => loadTemplate(id, ctx))

let failed = 0
for (const t of templates) {
  if (!t.errors.length) continue
  failed++
  console.log(`✗ ${t.id}`)
  for (const e of t.errors) console.log(`    ✗ ${e}`)
}
if (failed) {
  console.log('\nfix the problems above (npm run validate) before building')
  process.exit(1)
}

const now = nowIso()
const entries = []
const plan = []
const zips = []
for (const t of templates) {
  const { id, version } = t.manifest
  const tag = releaseTag(id, version)
  const prev = committed.get(id)
  try {
    if (onlyUnreleased && releasedTags.has(tag) && prev && prev.version === version) {
      // Released and recorded: the zip on GitHub is immutable — carry its
      // pins forward and refresh only the listing fields.
      if (prev.sourceHash !== t.sourceHash) throw new Error(`content changed after ${tag} was released — bump the version`)
      entries.push(composeEntry(t, {
        commit,
        plugins: pluginInfos(t, ctx.pluginRegistry),
        release: { zipUrl: prev.zipUrl, sha256: prev.sha256, sizeBytes: prev.sizeBytes, releasedAt: prev.releasedAt },
      }))
      console.log(`= ${id} ${version} (released)`)
      continue
    }
    const built = await buildTemplateZip(t, ctx.pluginRegistry)
    for (const w of built.warnings) console.log(`    ⚠ ${w}`)
    const name = zipName(id, version)
    // A tag without a recorded entry means an earlier run released but never
    // committed registry.json: the workflow re-downloads that asset and
    // checks it is byte-identical to this rebuild instead of creating it.
    const action = onlyUnreleased && releasedTags.has(tag) ? 'verify' : 'create'
    entries.push(composeEntry(t, {
      commit,
      plugins: built.plugins,
      release: {
        zipUrl: zipUrlFor(id, version),
        sha256: built.sha256,
        sizeBytes: built.zip.length,
        releasedAt: action === 'verify' && prev?.version === version && prev.releasedAt ? prev.releasedAt : now,
      },
    }))
    zips.push({ name, zip: built.zip })
    plan.push({ action, id, version, tag, zip: `dist/${name}`, sha256: built.sha256, sizeBytes: built.zip.length })
    console.log(`${action === 'verify' ? '~' : '+'} ${id} ${version} → ${name} (${(built.zip.length / 1024).toFixed(0)} KB, sha256 ${built.sha256.slice(0, 12)}…)`)
  } catch (err) {
    failed++
    console.log(`✗ ${id}: ${err.message}`)
  }
}

if (failed) process.exit(1)

if (check) {
  console.log(`\n✓ ${templates.length} template(s) build cleanly (--check: nothing written)`)
  process.exit(0)
}

fs.mkdirSync(outDir, { recursive: true })
for (const { name, zip } of zips) fs.writeFileSync(path.join(outDir, name), zip)
fs.writeFileSync(path.join(outDir, 'registry.json'), `${JSON.stringify(registryDocument(entries, now), null, 2)}\n`)
fs.writeFileSync(path.join(outDir, 'release-plan.json'), `${JSON.stringify(plan, null, 2)}\n`)
console.log(`\n✓ wrote ${zips.length} zip(s), registry.json (${entries.length} template(s)) and release-plan.json to ${path.relative(ROOT, outDir) || '.'}/`)
