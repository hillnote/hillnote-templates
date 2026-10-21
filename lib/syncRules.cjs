// Which workspace paths may ever live in a synced manifest — the single source
// of truth shared by the desktop scanner (syncScan.js, incl. its worker), the
// desktop pull (syncManager.js) and, via a verbatim copy, the backend
// (HillnoteWebsite/backend/utils/syncPathPolicy.js — a parity test diffs the two).
//
// Pure CommonJS, no requires: it runs in the renderer, main, the sync-scan
// worker (asarUnpack'd — see electron-builder.yml) and a browser build.
//
// WHY FOLDING: the server stores paths byte-exact, but desktops write them onto
// case-insensitive (APFS/NTFS) filesystems that also ignore trailing dots/spaces
// (Win32) and some code points (HFS+). An exact-match deny-list therefore lets a
// remote key like '.SYSTEM/sync-state.json' or '.GIT/config' land on top of the
// machine-local '.system/' or a real '.git/' (core.fsmonitor → command
// execution). Every check below compares FOLDED segments for the dangerous set.
//
// Junk names (.DS_Store, Thumbs.db, node_modules) stay exact-match in the
// manifest predicate so a legitimately named user folder never flip-flops.

const EXCLUDED_PATTERNS = [
  '.DS_Store',
  '.git',
  'node_modules',
  '.system',
  '.conflicts',
  'Thumbs.db',
  '.sync-state.json',
  // Machine-local UI state (ui-context.json) — syncing it across devices
  // would fight over which machine's "open document" wins.
  '.hillnote'
];

// Exact relative paths that never sync. The notepad is a per-user scratchpad
// — in a shared workspace, syncing it would cross-merge every collaborator's
// personal notes into one file.
const SYNC_IGNORED_PATHS = [
  'documents/Notepad.md',
];

// Machine-local or VCS folders: a remote copy would clobber local state or
// execute code. Compared after folding.
const DANGEROUS_FOLDED_SEGMENTS = new Set([
  '.system', '.hillnote', '.conflicts', '.sync-state.json', '.git',
]);
// Every EXCLUDED_PATTERNS name, folded — used for strict (new-write) checks.
const EXCLUDED_FOLDED_SEGMENTS = new Set(EXCLUDED_PATTERNS.map((s) => foldSegment(s)));
const FOLDED_IGNORED_PATHS = new Set(SYNC_IGNORED_PATHS.map((p) => foldPath(p)));

// NFKC → drop default-ignorable code points (ZWJ/ZWNJ/variation selectors…)
// → lowercase → strip trailing dots/spaces (Win32 drops them on create).
function foldSegment(segment) {
  if (typeof segment !== 'string') return '';
  let s = segment;
  try { s = s.normalize('NFKC'); } catch { /* lone surrogates: keep raw */ }
  s = s.replace(/\p{Default_Ignorable_Code_Point}/gu, '');
  s = s.toLowerCase();
  return s.replace(/[. ]+$/, '');
}

function splitPath(relativePath) {
  return String(relativePath).replace(/\\/g, '/').split('/');
}

function foldPath(relativePath) {
  return splitPath(relativePath).map(foldSegment).join('/');
}

const ASCII_RE = /^[\x00-\x7f]*$/;

// NTFS 8.3 short name of '.git' ('GIT~1') resolves to the same directory.
// Hot path (every scanned file): an ASCII segment folds to itself lowercased,
// and every dangerous fold starts with '.' or 'g' — reject the rest cheaply.
function isDangerousSegment(segment) {
  if (!segment) return false;
  if (ASCII_RE.test(segment)) {
    const c = segment.charCodeAt(0);
    if (c !== 46 && c !== 103 && c !== 71) return false;
  }
  const f = foldSegment(segment);
  return DANGEROUS_FOLDED_SEGMENTS.has(f) || /^git~\d+$/.test(f);
}

// --- Aliases a desktop pull would resolve onto a protected path -------------
// A pull path.resolve()s the key and the OS then resolves aliases, so the
// plain segment checks above are not enough:
//  - non-canonical keys: an empty, '.' or '..' segment ('documents/./Notepad.md',
//    'x/../documents/Notepad.md', 'documents//Notepad.md', a trailing '/').
//  - Windows aliases: NTFS stream syntax ('.git::$INDEX_ALLOCATION/config'
//    opens .git/config — the CVE-2019-1352 class; 'Notepad.md::$DATA' is the
//    file itself) and 8.3 short names ('SYSTEM~1' is .system, 'DOCUME~1' is
//    documents).
// Walkers never emit such names for real files (no empty/'.'/'..' segments,
// Windows lists long names, NTFS names can't hold ':'), so excluding them on
// the scan side too costs nothing and keeps scan and server in lock-step.

// An empty, '.' or '..' segment (either separator), without splitting.
const NON_CANONICAL_SEGMENT = /(?:^|[\\/])\.{0,2}(?:[\\/]|$)/;
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Folded NTFS 8.3 aliases of a long name: leading dots dropped, the first 6
// chars of the base + '~N' (or, past 4 collisions, the first 2 + 4 hex
// digits + '~N'), then '.' + the first 3 chars of the extension.
function shortNameRe(longName) {
  const n = foldSegment(longName).replace(/^\.+/, '');
  const dot = n.lastIndexOf('.');
  const base = (dot > 0 ? n.slice(0, dot) : n).replace(/[. ]/g, '');
  const ext = dot > 0 ? n.slice(dot + 1, dot + 4) : '';
  const stem = `(?:${escapeRe(base.slice(0, 6))}|${escapeRe(base.slice(0, 2))}[0-9a-f]{4})`;
  return new RegExp(`^${stem}~\\d+${ext ? `(?:\\.${escapeRe(ext)})?` : ''}$`);
}

// '.git', '.system', … — derived so a name added to the dangerous set is covered.
const DANGEROUS_SHORT_NAME_RES = EXCLUDED_PATTERNS.filter(isDangerousPath).map(shortNameRe);

// Per segment of each SYNC_IGNORED_PATHS entry: its folded name or an 8.3 alias.
const IGNORED_PATH_MATCHERS = SYNC_IGNORED_PATHS.map((p) => p.split('/').map((seg) => {
  const folded = foldSegment(seg);
  const re = shortNameRe(seg);
  return (f) => f === folded || re.test(f);
}));

// NTFS opens the name before a ':' stream suffix.
const streamBase = (segment) => segment.split(':')[0];

function isDangerousAliasSegment(segment) {
  const name = streamBase(segment);
  if (name !== segment && isDangerousPath(name)) return true;
  if (ASCII_RE.test(name) && !name.includes('~')) return false;
  const f = foldSegment(name);
  return DANGEROUS_SHORT_NAME_RES.some((re) => re.test(f));
}

function isIgnoredPathAlias(parts) {
  const candidates = IGNORED_PATH_MATCHERS.filter((m) => m.length === parts.length);
  if (!candidates.length) return false;
  const folded = parts.map((s) => foldSegment(streamBase(s)));
  return candidates.some((m) => m.every((match, i) => match(folded[i])));
}

function isSyncIgnoredPath(relativePath) {
  if (typeof relativePath !== 'string') return false;
  // Callers normalize separators already (walkers split on path.sep, server
  // paths are always forward-slash) — this keeps a raw Windows path safe too.
  const p = relativePath.replace(/\\/g, '/');
  if (SYNC_IGNORED_PATHS.includes(p)) return true;
  // Every ignored path contains 'notepad'; an ASCII path without it can't fold to one.
  if (ASCII_RE.test(p) && !/notepad/i.test(p) && !p.includes('~')) return false;
  return FOLDED_IGNORED_PATHS.has(foldPath(p)) || isIgnoredPathAlias(p.split('/'));
}

function isDangerousPath(relativePath) {
  if (typeof relativePath !== 'string') return false;
  return splitPath(relativePath).some(isDangerousSegment);
}

// THE manifest predicate: a path matching this is never scanned, pushed,
// accepted by /push, served by /pull or written by a desktop pull. Scan side
// and server side MUST use the same predicate — if the server dropped a path
// the scanner still reports, the desktop would re-push it forever.
function shouldExclude(relativePath) {
  if (typeof relativePath !== 'string') return false;
  if (isSyncIgnoredPath(relativePath)) return true;
  if (NON_CANONICAL_SEGMENT.test(relativePath)) return true;
  const parts = splitPath(relativePath);
  if (parts.some((part) => EXCLUDED_PATTERNS.includes(part))) return true;
  if (parts.some(isDangerousSegment)) return true;
  // Every alias holds '~' or ':' — or a non-ASCII char that folds to one.
  if (ASCII_RE.test(relativePath) && !/[~:]/.test(relativePath)) return false;
  return parts.some(isDangerousAliasSegment);
}

// Stricter check for NEW writes from the web app, MCP and AI tools: also
// rejects case/Unicode variants of the junk names (incl. behind an NTFS
// stream suffix), so a remote writer can never create a path a desktop
// would treat as one of them.
function isStrictDeniedPath(relativePath) {
  if (shouldExclude(relativePath)) return true;
  return splitPath(relativePath).some((part) =>
    EXCLUDED_FOLDED_SEGMENTS.has(foldSegment(part)) ||
    EXCLUDED_FOLDED_SEGMENTS.has(foldSegment(streamBase(part))));
}

module.exports = {
  EXCLUDED_PATTERNS,
  SYNC_IGNORED_PATHS,
  foldSegment,
  foldPath,
  isDangerousPath,
  isSyncIgnoredPath,
  shouldExclude,
  isStrictDeniedPath,
};
