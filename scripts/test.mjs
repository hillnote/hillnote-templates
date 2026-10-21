/**
 * `npm test` — the policy against hostile names, the zip writer's determinism,
 * the strict reader against hand-crafted hostile archives, sourceHash, the
 * dashboard scrub, and the privacy scan.
 *
 * Hostile archives are crafted byte by byte: a normal zip writer sanitizes the
 * names and fields that matter, so only raw bytes prove the read side.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import zlib from 'node:zlib'
import { buildZip, crc32 } from '../lib/buildZip.mjs'
import { readZip } from '../lib/readZip.mjs'
import { entryNameIssue } from '../lib/archiveGuards.mjs'
import {
  policy, policyLib, transforms, computeSourceHash, applyBuildTransforms, privacyFindings, externalHosts, imageSize,
  contentFindings,
} from '../lib/templates.mjs'

// ---- policy ------------------------------------------------------------------

const denied = [
  ['documents/NOTEPAD.md', 'sync-denied'], // the notepad never syncs either
  ['documents/topics.md', 'generated'],
  ['documents/Notepad.md.', 'trailing-dot-space'],
  ['documents/Plan.md ', 'trailing-dot-space'],
  ['.GIT/config', 'dot-segment'],
  ['documents/.git/config', 'dot-segment'],
  ['documents/GIT~1/config', 'sync-denied'],
  ['documents/a.md::$DATA', 'bad-char'],
  ['documents/a.md:Zone.Identifier', 'bad-char'],
  ['documents/CON.md', 'reserved-name'],
  ['documents/lpt1', 'reserved-name'],
  ['documents/Cafe\u0301.md', 'not-nfc'],
  ['plugins/.state.json', 'dot-segment'],
  ['plugins/foo/manifest.json', 'plugin-not-listed'],
  ['plugins/Foo/manifest.json', 'plugin-not-listed'],
  ['resources/html/timer/tool.settings.json', 'tool-settings'],
  ['resources/html/timer/TOOL.SETTINGS.JSON', 'tool-settings'],
  ['resources/html/timer.settings.json', 'tool-settings'],
  ['local-triggers.json', 'not-allowed'],
  ['.auto-organise.json', 'dot-segment'],
  ['readme.md', 'not-allowed'],
  ['agents.md', 'not-allowed'],
  ['CLAUDE.md', 'not-allowed'],
  ['Documents/x.md', 'not-allowed'],
  ['DASHBOARD.JSON', 'not-allowed'],
  ['cover.bmp', 'not-allowed'],
  ['../evil.md', 'traversal'],
  ['documents/../../evil.md', 'traversal'],
  ['documents//x.md', 'traversal'],
  ['/etc/passwd', 'absolute'],
  ['C:/Users/x.md', 'absolute'],
  ['C:\\Users\\x.md', 'bad-char'],
  ['documents/a\u0000b.md', 'bad-char'],
  ['documents/a<b>.md', 'bad-char'],
  ['.system/versions/x', 'dot-segment'],
  ['.hillnote/ui-context.json', 'dot-segment'],
  ['', 'empty'],
]

for (const [rel, reason] of denied) {
  test(`policy denies ${JSON.stringify(rel)} (${reason})`, () => {
    const v = policy.classify(rel, { pluginIds: [] })
    assert.equal(v.allow, false)
    assert.equal(v.reason, reason)
  })
}

test('plugin state is denied even for a listed plugin', () => {
  assert.equal(policy.classify('plugins/foo/storage/data.json', { pluginIds: ['foo'] }).reason, 'plugin-state')
  assert.equal(policy.classify('plugins/foo/config.json', { pluginIds: ['foo'] }).reason, 'plugin-state')
  assert.equal(policy.classify('plugins/foo/.state.json', { pluginIds: ['foo'] }).reason, 'dot-segment')
})

test('policy allows ordinary workspace content', () => {
  const allowed = [
    ['documents/Plan.md', 'file'],
    ['documents/Caf\u00e9.md', 'file'],
    ['documents/Roadmap/database.json', 'file'],
    ['documents/Tools/Expenses/data.csv', 'file'],
    ['resources/images/a.webp', 'file'],
    ['resources/html/timer/index.html', 'file'],
    ['resources/html/tool_registry.json', 'merge'],
    ['dashboard.json', 'merge'],
    ['documents-registry.json', 'merge'],
    ['ai_prompt_overrides.json', 'merge'],
    ['workspace-properties.json', 'merge'],
    ['variables.md', 'merge'],
    ['cover.webp', 'file'],
  ]
  for (const [rel, kind] of allowed) {
    const v = policy.classify(rel, { pluginIds: [] })
    assert.deepEqual(v, { allow: true, kind }, rel)
  }
  assert.deepEqual(policy.classify('plugins/foo/manifest.json', { pluginIds: ['foo'] }), { allow: true, kind: 'file' })
})

test('fold collisions and file/folder clashes are caught', () => {
  const issues = policy.findCollisions(['documents/A.md', 'documents/a.md', 'documents/x', 'documents/x/y.md', 'documents/ok.md'])
  const byPath = Object.fromEntries(issues.map((i) => [i.path, i.reason]))
  assert.equal(byPath['documents/A.md'], 'fold-collision')
  assert.equal(byPath['documents/a.md'], 'fold-collision')
  assert.equal(byPath['documents/x/y.md'], 'file-folder-clash')
  assert.equal(byPath['documents/ok.md'], undefined)
})

test('template.json validation', () => {
  const good = {
    formatVersion: 1, id: 'demo', version: '1.0.0', name: 'Demo', tagline: 'A demo.', description: 'Demo.',
    author: { name: 'Hillnote' }, license: 'MIT', icon: 'media/icon.webp',
  }
  assert.equal(policyLib.validateTemplateManifest(good, { folderId: 'demo' }).ok, true)
  assert.equal(policyLib.validateTemplateManifest({ ...good, license: 'GPL' }).ok, false)
  assert.equal(policyLib.validateTemplateManifest({ ...good, id: 'Demo' }).ok, false)
  assert.equal(policyLib.validateTemplateManifest(good, { folderId: 'other' }).ok, false)
  assert.equal(policyLib.validateTemplateManifest({ ...good, open: '../x.md' }).ok, false)
  assert.equal(policyLib.validateTemplateManifest({ ...good, plugins: [{ id: 'p', version: '1.0.0', sha256: 'x' }] }).ok, false)
})

// ---- deterministic zips --------------------------------------------------------

test('buildZip is deterministic and sorts by byte order', () => {
  const files = [
    { name: 'documents/b.md', data: Buffer.from('# b\n') },
    { name: 'documents/Z.md', data: Buffer.from('# Z\n') },
    { name: 'dashboard.json', data: Buffer.from('{}\n') },
  ]
  const a = buildZip(files)
  const b = buildZip([...files].reverse())
  assert.ok(a.equals(b))
  const read = readZip(a)
  assert.deepEqual(read.map((e) => e.name), ['dashboard.json', 'documents/Z.md', 'documents/b.md'])
  assert.equal(read[2].data.toString(), '# b\n')
  assert.ok(read.every((e) => !e.isSymlink && !e.isDirectory))
})

test('buildZip refuses duplicates and directory entries', () => {
  assert.throws(() => buildZip([{ name: 'a.md', data: Buffer.from('1') }, { name: 'a.md', data: Buffer.from('2') }]), /duplicate/)
  assert.throws(() => buildZip([{ name: 'documents/', data: Buffer.alloc(0) }]), /invalid entry name/)
})

// ---- hostile archives ------------------------------------------------------------

/**
 * Raw zip bytes with full control over every field.
 * entries: [{ name, data, method?, flags?, externalAttr?, declaredSize?, crc? }]
 */
function craftZip(entries) {
  const locals = []
  const centrals = []
  let offset = 0
  for (const e of entries) {
    const name = Buffer.from(e.name, 'utf8')
    const raw = Buffer.from(e.data)
    const method = e.method ?? 0
    const stored = method === 8 ? zlib.deflateRawSync(raw) : raw
    const crc = e.crc ?? crc32(raw)
    const size = e.declaredSize ?? raw.length
    const lh = Buffer.alloc(30)
    lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt16LE(e.flags ?? 0, 6)
    lh.writeUInt16LE(method, 8); lh.writeUInt32LE(crc, 14); lh.writeUInt32LE(stored.length, 18)
    lh.writeUInt32LE(size, 22); lh.writeUInt16LE(name.length, 26)
    const ch = Buffer.alloc(46)
    ch.writeUInt32LE(0x02014b50, 0); ch.writeUInt16LE(0x031e, 4); ch.writeUInt16LE(20, 6)
    ch.writeUInt16LE(e.flags ?? 0, 8); ch.writeUInt16LE(method, 10); ch.writeUInt32LE(crc, 16)
    ch.writeUInt32LE(stored.length, 20); ch.writeUInt32LE(size, 24); ch.writeUInt16LE(name.length, 28)
    ch.writeUInt32LE((e.externalAttr ?? 0) >>> 0, 38); ch.writeUInt32LE(offset, 42)
    const local = Buffer.concat([lh, name, stored])
    locals.push(local)
    centrals.push(Buffer.concat([ch, name]))
    offset += local.length
  }
  const cd = Buffer.concat(centrals)
  const eocd = Buffer.alloc(22)
  eocd.writeUInt32LE(0x06054b50, 0); eocd.writeUInt16LE(entries.length, 8); eocd.writeUInt16LE(entries.length, 10)
  eocd.writeUInt32LE(cd.length, 12); eocd.writeUInt32LE(offset, 16)
  return Buffer.concat([...locals, cd, eocd])
}

test('traversal and absolute names are returned for the caller to refuse', () => {
  for (const name of ['../evil.txt', 'a/../../evil.txt', '..\\evil.txt', '/etc/passwd']) {
    const [entry] = readZip(craftZip([{ name, data: 'x' }]))
    assert.notEqual(entryNameIssue(entry.name), null, name)
  }
  assert.equal(entryNameIssue(readZip(craftZip([{ name: 'nested/ok.txt', data: 'x' }]))[0].name), null)
})

test('symlink entries are flagged', () => {
  const [entry] = readZip(craftZip([{ name: 'link', data: '/etc/passwd', externalAttr: 0xa1ff0000 }]))
  assert.equal(entry.isSymlink, true)
})

test('the reader refuses malformed and hostile archives', () => {
  assert.throws(() => readZip(craftZip([{ name: 'a', data: 'x' }, { name: 'a', data: 'y' }])), /duplicate/)
  assert.throws(() => readZip(craftZip([{ name: 'a', data: 'x', flags: 1 }])), /encrypted/)
  assert.throws(() => readZip(craftZip([{ name: 'a', data: 'hello', crc: 1234 }])), /CRC/)
  assert.throws(() => readZip(craftZip([{ name: 'a', data: 'hello', method: 12 }])), /method/)
  // A deflate bomb that understates its size: inflation is cut off.
  assert.throws(() => readZip(craftZip([{ name: 'bomb', data: Buffer.alloc(4 * 1024 * 1024), method: 8, declaredSize: 100 }])), /inflate|size/)
  // A declared size over the cap is refused before inflating.
  assert.throws(() => readZip(craftZip([{ name: 'big', data: 'x', declaredSize: 50 * 1024 * 1024 }]), { maxFileBytes: 1024 }), /larger/)
  assert.throws(() => readZip(Buffer.from('not a zip at all, definitely not')), /Invalid zip/)
  // A well-formed deflated entry reads back.
  const [ok] = readZip(craftZip([{ name: 'ok.txt', data: 'deflated text '.repeat(50), method: 8 }]))
  assert.equal(ok.data.toString(), 'deflated text '.repeat(50))
})

// ---- sourceHash -------------------------------------------------------------------

test('sourceHash is order-independent and covers content and plugin pins', () => {
  const f = (rel, s) => ({ rel, data: Buffer.from(s) })
  const files = [f('documents/a.md', 'A'), f('documents/b.md', 'B')]
  const h1 = computeSourceHash(files)
  assert.equal(h1, computeSourceHash([...files].reverse()))
  assert.notEqual(h1, computeSourceHash([f('documents/a.md', 'A!'), f('documents/b.md', 'B')]))
  const pins = [{ id: 'p1', version: '1.0.0', sha256: 'a'.repeat(64) }, { id: 'p2', version: '2.0.0', sha256: 'b'.repeat(64) }]
  const h2 = computeSourceHash(files, pins)
  assert.notEqual(h1, h2)
  assert.equal(h2, computeSourceHash(files, [...pins].reverse()))
  assert.notEqual(h2, computeSourceHash(files, [{ ...pins[0], version: '1.0.1' }, pins[1]]))
  assert.equal(computeSourceHash(files, [], { dateAnchor: null }), h1, 'no anchor keeps the old hash')
  assert.notEqual(computeSourceHash(files, [], { dateAnchor: '2026-11-02' }), h1, 'the anchor changes what an install writes')
})

// ---- transforms ------------------------------------------------------------------

const SAMPLE_DASHBOARD = {
  widgets: [
    { id: 1, type: 'document-view', config: { documentPath: 'documents/Start here.md', workspaceName: 'Hello from Hillnote' } },
    { id: 2, type: 'tasklist-stats', config: { selectedDatabases: [{ id: '1780891828679:documents/Exploring Hillnote', path: 'documents/Exploring Hillnote' }] } },
    { id: 3, type: 'pinned-tasklist', config: { workspaceId: '1780891828679', workspacePath: '/Users/someone/Documents/Hello', pinnedDatabases: [{ workspaceId: '1780891828679', id: '1780891828679:documents/Tasks' }] } },
  ],
  defaultView: 'dashboard',
}

test('scrubDashboard leaves no author identity behind; the app rewrite fills the new one in', () => {
  const scrubbed = transforms.scrubDashboard(SAMPLE_DASHBOARD)
  const text = JSON.stringify(scrubbed)
  assert.ok(!text.includes('1780891828679'))
  assert.ok(!text.includes('/Users/'))
  assert.ok(!text.includes('Hello from Hillnote'))
  assert.equal(scrubbed.widgets[1].config.selectedDatabases[0].id, 'template:documents/Exploring Hillnote')
  const installed = transforms.rewriteDashboard(scrubbed, { workspaceId: '42', workspacePath: '/x/New', workspaceName: 'New' })
  assert.equal(installed.widgets[1].config.selectedDatabases[0].id, '42:documents/Exploring Hillnote')
  assert.equal(installed.widgets[2].config.workspacePath, '/x/New')
  assert.equal(installed.widgets[0].config.workspaceName, 'New')
  assert.equal(installed.defaultView, 'dashboard')
})

test('build transforms are idempotent on already-clean files', () => {
  const clean = Buffer.from(`${JSON.stringify(transforms.scrubDashboard(SAMPLE_DASHBOARD), null, 2)}\n`)
  assert.ok(applyBuildTransforms('dashboard.json', clean).equals(clean))
  const sheet = Buffer.from('{"name":"Expenses","owner":{"tool":"budget"}}')
  assert.deepEqual(JSON.parse(applyBuildTransforms('documents/Tools/Expenses/sheet.json', sheet).toString()), { name: 'Expenses' })
  const plain = Buffer.from('{"name":"Plain"}')
  assert.ok(applyBuildTransforms('documents/Tools/Plain/sheet.json', plain).equals(plain))
})

test('computeIncludes counts by the contract', () => {
  const paths = [
    'documents/Start here.md', 'documents/Deck.slides.md', 'documents/Board.moodboard.md', 'documents/Sketch.canvas.md',
    'documents/Tasks/database.json', 'documents/Tasks/Row one.md', 'documents/Tools/Budget/sheet.json', 'documents/Tools/Budget/data.csv',
    'resources/html/timer/index.html', 'resources/html/loose.html', 'ai_prompt_overrides.json',
  ]
  const inc = policyLib.computeIncludes(paths, () => '{"overrides":[{"id":"r1"},{"id":"r2"}]}', ['p'])
  assert.deepEqual(inc, { documents: 1, databases: 1, sheets: 1, slides: 1, canvases: 1, moodboards: 1, tools: 2, plugins: 1, libraries: 0, recipes: 2 })
})

// ---- privacy + advisory scans -------------------------------------------------------

test('privacy scan catches paths, secrets and addresses, not look-alikes', () => {
  const kinds = (s) => privacyFindings(s).map((p) => p.kind)
  assert.ok(kinds('see /Users/docbrown/Documents/flux-capacitor.md').includes('absolute macOS/Linux path'))
  assert.ok(kinds('file:///home/alice/notes.md').includes('absolute macOS/Linux path'))
  assert.ok(kinds('"C:\\\\Users\\\\Bob\\\\x"').includes('absolute Windows path'))
  assert.ok(kinds('key sk-abcdefghijklmnopqrstuvwx1234').includes('OpenAI/Anthropic-style key'))
  assert.ok(kinds('ghp_abcdefghijklmnopqrstuvwxyz0123456789').includes('GitHub token'))
  assert.ok(kinds('mail jane.doe@gmail.com').includes('email address'))
  assert.deepEqual(kinds('logo@2x.png hello@hillnote.com name@example.com task-list /docs/Users'), [])
})

test('external hosts ignore XML namespaces', () => {
  assert.deepEqual(externalHosts('<svg xmlns="http://www.w3.org/2000/svg"></svg><script src="https://cdn.jsdelivr.net/x.js"></script>fetch("https://api.example.com/v1")'),
    ['api.example.com', 'cdn.jsdelivr.net'])
})

test('imageSize reads PNG and WebP headers', () => {
  const png = Buffer.alloc(24)
  png.writeUInt32BE(0x89504e47, 0); png.writeUInt32BE(256, 16); png.writeUInt32BE(256, 20)
  assert.deepEqual(imageSize(png), { type: 'png', width: 256, height: 256 })
  assert.equal(imageSize(Buffer.from('nope')), null)
})

// ---- content lint ------------------------------------------------------------------

const ws = (entries) => Object.entries(entries).map(([rel, text]) => ({ rel, data: Buffer.from(typeof text === 'string' ? text : JSON.stringify(text)) }))

test('content lint: links, embeds and references must resolve', () => {
  const { errors } = contentFindings(ws({
    'documents/Start here.md': [
      'See [[Plan|doc:documents/My%20Plan.md#goals]] and [[Gone|doc:documents/Gone.md]].',
      '[Rows](doc:documents/Tasks) [database:Tasks](documents/Tasks) [[sheet:Money|documents/Nope]]',
      '[html:Timer](resources/html/timer/index.html) ![shot](resources/images/a%20b.webp) ![x](resources/images/missing.png)',
      '```md\n[[Example|doc:documents/Example.md]]\n```',
      'Inline `[[Also|doc:documents/Also.md]]` is an example too.',
    ].join('\n'),
    'documents/My Plan.md': '# Plan',
    'documents/Tasks/database.json': { columns: [], views: [{ id: 'v', type: 'tool', toolPath: 'resources/html/nope/index.html' }] },
    'documents/Map.moodboard.md': '---\ntype: moodboard\n---\n\n```moodboard\n{"items":[{"id":"m1","type":"doc","path":"documents/My Plan.md"},{"id":"m2","type":"doc","path":"documents/Lost.md"}]}\n```\n',
    'resources/images/a b.webp': 'x',
    'resources/html/tool_registry.json': { tools: [{ name: 'Timer', entryPath: 'resources/html/timer/index.html' }] },
    'ai_prompt_overrides.json': { overrides: [{ id: 'r', required_documents: ['documents/My Plan.md', 'documents/Nope.md'] }] },
    'documents-registry.json': { documents: [{ path: 'documents/My Plan.md' }, { path: 'documents/Ghost.md' }], folders: [{ path: 'documents/Tasks' }, { path: 'documents/Empty' }] },
  }))
  const has = (re) => assert.ok(errors.some((e) => re.test(e)), `expected ${re} in:\n${errors.join('\n')}`)
  has(/link to "documents\/Gone\.md"/)
  has(/sheet embed points at "documents\/Nope"/)
  has(/html embed points at "resources\/html\/timer\/index\.html"/)
  has(/image "resources\/images\/missing\.png"/)
  has(/card "m2" points at "documents\/Lost\.md"/)
  has(/runs "resources\/html\/nope\/index\.html"/)
  has(/"Timer" points at "resources\/html\/timer\/index\.html"/)
  has(/recipe "r" required_documents "documents\/Nope\.md"/)
  has(/"documents\/Ghost\.md" is not in workspace/)
  has(/folder "documents\/Empty" is not in workspace/)
  assert.ok(!errors.some((e) => /My Plan|Example|Also|a b\.webp|Tasks"/.test(e)), errors.join('\n'))
  assert.equal(errors.length, 10, errors.join('\n'))
})

test('content lint: values the app would rewrite on first open are warned about', () => {
  const { errors, warnings } = contentFindings(ws({
    'documents/Tasks/database.json': {
      columns: [
        { id: 'title', type: 'title' },
        { id: 'status', type: 'status', options: ['Todo', 'Done'], optionColors: { Todo: 'gray', Done: 'green' } },
        { id: 'tags', type: 'multiselect', options: ['a', 'b'] },
        { id: 'due', type: 'date' },
      ],
      views: [{ id: 'soon', name: 'Soon', type: 'table', filters: [{ column: 'due', operator: 'dateBefore', value: '2026-11-09' }] }],
    },
    'documents/Tasks/Good.md': "---\nstatus: Done\ntags:\n  - a\ndue: '2026-11-03'\n_emoji: 🚀\n---\n",
    'documents/Tasks/Bad.md': '---\nstatus: Doing\ntags:\n  - c\ndue: 2026-11-03\n---\n',
    'documents/Note.md': '---\ndescription: >-\n  folded\n---\n',
    'documents/Money/sheet.json': { columns: [{ id: 'item', name: 'Item', type: 'title' }, { id: 'amt', name: 'Amount', type: 'number' }] },
    'documents/Money/data.csv': 'Item,Cost\nTea,2\n',
  }))
  assert.deepEqual(errors, [])
  const has = (re) => assert.ok(warnings.some((w) => re.test(w)), `expected ${re} in:\n${warnings.join('\n')}`)
  has(/option "Done" uses colour "green"/)
  has(/fixed date 2026-11-09/)
  has(/Bad\.md: no _emoji/)
  has(/Bad\.md: due: 2026-11-03 — quote dates/)
  has(/Bad\.md: status "Doing" is not one of/)
  has(/Bad\.md: tags "c" is not one of/)
  has(/Note\.md: folded YAML/)
  has(/last column must be _hnid/)
  has(/no column named "Amount"/)
  assert.ok(!warnings.some((w) => /Good\.md/.test(w)), warnings.join('\n'))
})

test('content lint: scratch spaces need their note line; table links and slide variables are flagged', () => {
  const { errors, warnings } = contentFindings(ws({
    'documents/Good.md': ':::scratchspace "Notes"\n> **Note for AI:** draft space\n\nText\n\n:::\n',
    'documents/Bad.md': ':::scratchspace "Notes"\n\nText\n\n:::\n',
    'documents/Table.md': '| Page | Note |\n|---|---|\n| [[Good|doc:documents/Good.md]] | ${x} |\n\n**Pages:** [[Good|doc:documents/Good.md]]\n',
    'documents/Deck.slides.md': '---\ntype: slides\n---\n\n# ${product}\n',
  }))
  assert.equal(errors.length, 1, errors.join('\n'))
  assert.match(errors[0], /Bad\.md: :::scratchspace "Notes" must be followed/)
  assert.ok(warnings.some((w) => /Table\.md: 1 table row\(s\) hold page links/.test(w)), warnings.join('\n'))
  assert.ok(warnings.some((w) => /Deck\.slides\.md: slides do not resolve/.test(w)), warnings.join('\n'))
  assert.ok(!warnings.some((w) => /Good\.md/.test(w)), warnings.join('\n'))
})

test('content lint: view settings the app reads as fixed names', () => {
  const { errors, warnings } = contentFindings(ws({
    'documents/Plan/database.json': { columns: [], views: [
      { id: 'cal', name: 'Calendar', type: 'calendar', calendarViewMode: 'month', filters: [], sorts: [] },
      { id: 'ok', name: 'Month', type: 'calendar', calendarViewMode: 'dayGridMonth', filters: [], sorts: [] },
      { id: 'chart', name: 'Chart', type: 'chart', chartType: 'column', aggregation: 'sum', filters: [], sorts: [] },
    ] },
  }))
  assert.equal(errors.length, 1, errors.join('\n'))
  assert.match(errors[0], /view "Calendar" has calendarViewMode "month"/)
  assert.ok(warnings.some((w) => /view "Chart" has chartType "column"/.test(w)), warnings.join('\n'))
  assert.ok(!warnings.some((w) => /"Month"|aggregation/.test(w)), warnings.join('\n'))
})
