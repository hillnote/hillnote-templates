#!/usr/bin/env node
/**
 * Validate templates — what CI runs on every pull request.
 *
 *   npm run validate                      every template
 *   npm run validate -- hello-hillnote    just these
 *   node scripts/validate.mjs --base origin/main   (CI on PRs: also checks the diff)
 *
 * Errors fail the run; warnings are worth fixing; ℹ lines are for the reviewer
 * (e.g. the hosts a tool's code reaches out to — every tool can use the network).
 */
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import {
  ROOT, TEMPLATES_DIR, listTemplateIds, loadTemplate, readCommittedRegistry, pluginRegistryFor,
} from '../lib/templates.mjs'

const args = process.argv.slice(2)
const baseIdx = args.indexOf('--base')
const base = baseIdx >= 0 ? args[baseIdx + 1] : null
const ids = args.filter((a, i) => !a.startsWith('--') && (baseIdx < 0 || i !== baseIdx + 1))

const git = (...a) => execFileSync('git', a, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
const inGit = (() => { try { return git('rev-parse', '--is-inside-work-tree').trim() === 'true' } catch { return false } })()

let failed = 0
const repoErrors = []

if (inGit) {
  // A committed symlink (mode 120000) is refused even if the working tree has
  // since been fixed — CI checks out what was committed.
  try {
    for (const line of git('ls-files', '-s', '--', 'templates').split('\n')) {
      const m = /^(\d+) [0-9a-f]+ \d+\t(.+)$/.exec(line)
      if (m && m[1] === '120000') repoErrors.push(`${m[2]}: symlinks are not allowed in templates`)
    }
  } catch { /* not committed yet */ }
  if (base) {
    let changed = []
    try { changed = git('diff', '--name-only', `${base}...HEAD`).split('\n').filter(Boolean) } catch (err) {
      repoErrors.push(`could not diff against ${base}: ${err.message}`)
    }
    for (const f of changed) {
      if (f === 'registry.json') repoErrors.push('registry.json is built by CI after a merge — leave it out of pull requests')
      if (f.startsWith('dist/')) repoErrors.push(`${f}: build output does not belong in the repo`)
    }
  }
}
for (const e of repoErrors) { console.log(`✗ ${e}`); failed++ }

const all = listTemplateIds()
const targets = ids.length ? ids : all
for (const id of ids) {
  if (!all.includes(id)) { console.log(`✗ no template folder templates/${id}`); failed++ }
}

const committed = readCommittedRegistry()
const ctx = { committed, ...(await pluginRegistryFor(targets.filter((id) => all.includes(id)))) }

for (const id of targets.filter((x) => all.includes(x))) {
  const t = loadTemplate(id, ctx)
  const bytes = t.files.reduce((n, f) => n + f.data.length, 0)
  const head = t.manifest ? `${id} ${t.manifest.version} — ${t.files.length} files, ${(bytes / 1024).toFixed(0)} KB` : id
  console.log(`${t.errors.length ? '✗' : '✓'} ${head}`)
  for (const e of t.errors) console.log(`    ✗ ${e}`)
  for (const w of t.warnings) console.log(`    ⚠ ${w}`)
  for (const a of t.advisories) console.log(`    ℹ ${a}`)
  if (t.errors.length) failed++
}

// Registry entries whose folder is gone drop out at the next release.
if (!ids.length) {
  for (const id of committed.keys()) {
    if (!fs.existsSync(path.join(TEMPLATES_DIR, id))) console.log(`⚠ registry.json lists "${id}" but templates/${id} is gone — it leaves the registry at the next release`)
  }
}

console.log(failed ? `\n${failed} problem(s) — see ✗ above` : `\nall ${targets.length} template(s) valid`)
process.exit(failed ? 1 : 0)
