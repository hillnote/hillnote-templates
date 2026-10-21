'use strict';
// Install-time transforms for workspace templates (docs/WORKSPACE_TEMPLATES.md §4):
// point the dashboard at the new workspace, drop sheet-ownership markers, move
// the sample dates to the install week, and merge the shared workspace files
// into what the target already has.
//
// PURE CommonJS, no requires: canonical HERE, vendored byte-identical into
// hillnote-templates/lib/templateTransforms.cjs (scripts/sync-template-policy.js),
// where the snapshot script scrubs a source workspace with the same functions.
//
// Every merge ADDS what is missing and never replaces what the target has, and
// returns { value, changed } so the caller writes only when something moved.

// ---- dashboard.json ----------------------------------------------------------

// The identity fields a widget config can carry anywhere in its tree — the
// same set the cloud-settings codec translates (src/lib/cloudSettings/
// workspaceCodecs.js), plus the display name, plus the compound database ids
// ('<workspaceId>:documents/…') that appear without a workspaceId beside them
// (selectedDatabases in the tasklist-stats widget).
const WS_ID_FIELDS = new Set(['workspaceId', 'selectedWorkspaceId']);
const COMPOUND_ID_RE = /^[A-Za-z0-9_-]{1,64}:(documents\/.+)$/;
const MAX_DEPTH = 8;

function rewriteIdentity(node, target, depth) {
  if (depth > MAX_DEPTH) return node;
  if (Array.isArray(node)) return node.map((item) => rewriteIdentity(item, target, depth + 1));
  if (!node || typeof node !== 'object') return node;
  const out = {};
  for (const [key, value] of Object.entries(node)) {
    if (WS_ID_FIELDS.has(key) && (typeof value === 'string' || typeof value === 'number')) {
      out[key] = String(target.workspaceId);
    } else if (key === 'workspacePath' && typeof value === 'string') {
      out[key] = target.workspacePath;
    } else if (key === 'workspaceName' && typeof value === 'string') {
      out[key] = target.workspaceName;
    } else if (key === 'id' && typeof value === 'string' && COMPOUND_ID_RE.test(value)) {
      out[key] = `${target.workspaceId}:${COMPOUND_ID_RE.exec(value)[1]}`;
    } else {
      out[key] = value && typeof value === 'object' ? rewriteIdentity(value, target, depth + 1) : value;
    }
  }
  return out;
}

/**
 * Point every workspace identity field in a dashboard.json at `target`. A
 * template holds exactly one workspace, so every reference is to it — including
 * one the author's widget made to some other workspace of theirs, which cannot
 * exist on the user's machine anyway.
 * @param {object} dashboard
 * @param {{ workspaceId: string, workspacePath: string, workspaceName: string }} target
 */
function rewriteDashboard(dashboard, target) {
  if (!dashboard || typeof dashboard !== 'object' || Array.isArray(dashboard)) return dashboard;
  return rewriteIdentity(dashboard, {
    workspaceId: String(target.workspaceId ?? ''),
    workspacePath: String(target.workspacePath ?? ''),
    workspaceName: String(target.workspaceName ?? ''),
  }, 0);
}

/** The neutral form a template stores (no author ids, paths or names). */
function scrubDashboard(dashboard) {
  return rewriteDashboard(dashboard, { workspaceId: 'template', workspacePath: '', workspaceName: '' });
}

const hasWidgets = (d) => !!d && Array.isArray(d.widgets) && d.widgets.length > 0;

/** The template's dashboard only lands on a target with no widgets of its own. */
function mergeDashboard(target, incoming) {
  if (!incoming || typeof incoming !== 'object') return { value: target, changed: false };
  if (hasWidgets(target)) return { value: target, changed: false };
  const base = target && typeof target === 'object' && !Array.isArray(target) ? target : {};
  return { value: { ...base, ...incoming }, changed: true };
}

// ---- sheet.json --------------------------------------------------------------

/**
 * Drop `owner` — it lets the tool named there skip the sheet-access prompt
 * (src/lib/toolHost.js), and a template must not grant its own tools access.
 */
function stripSheetOwner(sheet) {
  if (!sheet || typeof sheet !== 'object' || Array.isArray(sheet) || !('owner' in sheet)) {
    return { value: sheet, changed: false };
  }
  const { owner: _owner, ...rest } = sheet;
  return { value: rest, changed: true };
}

// ---- documents-registry.json ------------------------------------------------

const normPath = (p) => (typeof p === 'string' ? p.replace(/\\/g, '/').replace(/\/+$/, '') : '');

/**
 * Add the template's registry entries (emoji, position, …) for documents and
 * folders that are actually on disk after the install. Entries already in the
 * target win. A legacy bare-array registry is left alone (its shape is the
 * user's; the next rescan picks the new files up).
 * @param {object|Array|null} target  parsed target registry (null = absent)
 * @param {object} incoming           parsed template registry
 * @param {{ hasFile: (p: string) => boolean, hasDir: (p: string) => boolean }} present
 */
function mergeDocumentsRegistry(target, incoming, present) {
  if (Array.isArray(target)) return { value: target, changed: false, skipped: 'legacy' };
  if (!incoming || typeof incoming !== 'object' || Array.isArray(incoming)) return { value: target, changed: false };
  const base = target && typeof target === 'object' ? target : { documents: [], folders: [] };
  const value = { ...base };
  let changed = !target;
  for (const [listKey, isThere] of [['documents', present.hasFile], ['folders', present.hasDir]]) {
    const incomingList = Array.isArray(incoming[listKey]) ? incoming[listKey] : [];
    if (!incomingList.length) continue;
    const list = Array.isArray(value[listKey]) ? [...value[listKey]] : [];
    const known = new Set(list.map((e) => normPath(e?.path)));
    for (const entry of incomingList) {
      const p = normPath(entry?.path);
      if (!p || known.has(p) || !isThere(p)) continue;
      known.add(p);
      list.push({ ...entry, path: p });
      changed = true;
    }
    value[listKey] = list;
  }
  return { value, changed };
}

// ---- ai_prompt_overrides.json ------------------------------------------------

const recipeKey = (r) => {
  if (!r || typeof r !== 'object') return null;
  if (r.id !== undefined && r.id !== null && String(r.id)) return `id:${String(r.id)}`;
  if (typeof r.name === 'string' && r.name.trim()) return `name:${r.name.trim().toLowerCase()}`;
  return null;
};

/**
 * Recipes (overrides[]) and custom instructions are added; a workspace system
 * prompt is taken only when the target has none. read-file auto-creates this
 * file as a stub ({ systemPrompt: '', temperature, maxTokens,
 * customInstructions: [] }, main.js), so an "existing" target is usually that.
 */
function mergePromptOverrides(target, incoming) {
  if (!incoming || typeof incoming !== 'object' || Array.isArray(incoming)) return { value: target, changed: false };
  const base = target && typeof target === 'object' && !Array.isArray(target) ? target : {};
  const value = { ...base };
  let changed = !target;

  const incomingRecipes = Array.isArray(incoming.overrides) ? incoming.overrides : [];
  if (incomingRecipes.length) {
    const list = Array.isArray(value.overrides) ? [...value.overrides] : [];
    const keys = new Set(list.map(recipeKey).filter(Boolean));
    for (const r of incomingRecipes) {
      const k = recipeKey(r);
      if (!k || keys.has(k)) continue;
      keys.add(k);
      list.push(r);
      changed = true;
    }
    value.overrides = list;
  }

  const incomingInstr = Array.isArray(incoming.customInstructions) ? incoming.customInstructions : [];
  if (incomingInstr.length) {
    const list = Array.isArray(value.customInstructions) ? [...value.customInstructions] : [];
    const seen = new Set(list.map((x) => JSON.stringify(x)));
    for (const x of incomingInstr) {
      const k = JSON.stringify(x);
      if (seen.has(k)) continue;
      seen.add(k);
      list.push(x);
      changed = true;
    }
    value.customInstructions = list;
  }

  if (typeof incoming.systemPrompt === 'string' && incoming.systemPrompt.trim()
      && !(typeof value.systemPrompt === 'string' && value.systemPrompt.trim())) {
    value.systemPrompt = incoming.systemPrompt;
    changed = true;
  }

  // Any other key the target lacks (a newer app's field) comes along as is.
  for (const [k, v] of Object.entries(incoming)) {
    if (k === 'overrides' || k === 'customInstructions' || k === 'systemPrompt') continue;
    if (!(k in value)) { value[k] = v; changed = true; }
  }
  return { value, changed };
}

// ---- workspace-properties.json -----------------------------------------------

/** Property definitions are added by id; a definition the target has wins. */
function mergeWorkspaceProperties(target, incoming) {
  if (!incoming || typeof incoming !== 'object' || !Array.isArray(incoming.properties)) return { value: target, changed: false };
  const base = target && typeof target === 'object' && !Array.isArray(target) ? target : { version: 1, properties: [] };
  const list = Array.isArray(base.properties) ? [...base.properties] : [];
  const ids = new Set(list.map((p) => p?.id).filter(Boolean));
  let changed = !target;
  for (const def of incoming.properties) {
    if (!def || typeof def.id !== 'string' || ids.has(def.id)) continue;
    ids.add(def.id);
    list.push(def);
    changed = true;
  }
  return { value: { ...base, version: base.version || 1, properties: list }, changed };
}

// ---- resources/html/tool_registry.json -----------------------------------------

/** Tool display metadata is added by entryPath; the target's entry wins. */
function mergeToolRegistry(target, incoming) {
  if (!incoming || typeof incoming !== 'object' || !Array.isArray(incoming.tools)) return { value: target, changed: false };
  const base = target && typeof target === 'object' && !Array.isArray(target) ? target : { tools: [] };
  const list = Array.isArray(base.tools) ? [...base.tools] : [];
  const known = new Set(list.map((t) => normPath(t?.entryPath)).filter(Boolean));
  let changed = !target;
  for (const tool of incoming.tools) {
    const key = normPath(tool?.entryPath);
    if (!key || known.has(key)) continue;
    known.add(key);
    list.push(tool);
    changed = true;
  }
  return { value: { ...base, tools: list }, changed };
}

// ---- variables.md --------------------------------------------------------------

// Same grammar as src/lib/workspaceVariables.js parseVariablesMarkdown: a
// `## $name` heading opens a variable; everything to the next heading is its value.
const VARIABLE_HEADING_RE = /^##\s+\$([A-Za-z][A-Za-z0-9_-]*)\s*$/;

function variableSections(text) {
  const sections = new Map();
  let current = null;
  const flush = () => { if (current) sections.set(current.name, current.lines.join('\n').trim()); current = null; };
  for (const line of String(text || '').split('\n')) {
    const m = line.match(VARIABLE_HEADING_RE);
    if (m) { flush(); current = { name: m[1], lines: [] }; } else if (current) current.lines.push(line);
  }
  flush();
  return sections;
}

/**
 * Variables the target lacks are appended as `## $name` sections; values the
 * target has win. An absent target takes the template's file as is.
 * @param {string|null} targetText
 * @param {string} incomingText
 */
function mergeVariablesMarkdown(targetText, incomingText) {
  if (typeof incomingText !== 'string' || !incomingText.trim()) return { value: targetText, changed: false };
  if (typeof targetText !== 'string' || !targetText.trim()) return { value: incomingText, changed: true };
  const have = variableSections(targetText);
  const add = [...variableSections(incomingText)].filter(([name]) => !have.has(name));
  if (!add.length) return { value: targetText, changed: false };
  const tail = add.map(([name, value]) => `## $${name}\n\n${value}\n`).join('\n');
  return { value: `${targetText.replace(/\s+$/, '')}\n\n${tail}`, changed: true };
}

// ---- sample dates ----------------------------------------------------------------
//
// A template's worked example is written around one week (template.json
// dateAnchor). At install its database-row and sheet dates move by whole weeks
// so that week becomes the current one: weekdays stay put, a calendar opened a
// year later still shows "this week". Only ISO values in date/datetime columns
// (and a recurring column's nextReset) move; everything else is left byte for byte.

const DAY_MS = 86400000;
const ANCHOR_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const ISO_VALUE_RE = /^(\d{4})-(\d{2})-(\d{2})((?:T|\s)\d{2}:\d{2}(?::\d{2}(?:\.\d{1,9})?)?(?:Z|[+-]\d{2}:?\d{2})?)?$/;

const utcDay = (y, m, d) => Math.floor(Date.UTC(y, m - 1, d) / DAY_MS);
// Day 0 (1970-01-01) was a Thursday: three days after its week's Monday.
const mondayOf = (day) => day - (((day + 3) % 7) + 7) % 7;

/**
 * Whole weeks, in days, from the anchor's week to the week of `now` (the user's
 * local calendar date). 0 when the anchor is missing or invalid.
 * @param {string|null|undefined} anchor  'YYYY-MM-DD'
 * @param {Date} [now]
 */
function anchorShiftDays(anchor, now = new Date()) {
  const m = typeof anchor === 'string' ? ANCHOR_RE.exec(anchor) : null;
  if (!m || !(now instanceof Date) || Number.isNaN(now.getTime())) return 0;
  const from = utcDay(Number(m[1]), Number(m[2]), Number(m[3]));
  const to = utcDay(now.getFullYear(), now.getMonth() + 1, now.getDate());
  if (!Number.isFinite(from) || !Number.isFinite(to)) return 0;
  return mondayOf(to) - mondayOf(from);
}

/** 'YYYY-MM-DD[time]' moved by `days`; the time part is kept as written. null when not ISO. */
function shiftIsoValue(value, days) {
  const m = ISO_VALUE_RE.exec(value);
  if (!m) return null;
  const moved = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]) + days));
  if (Number.isNaN(moved.getTime())) return null;
  return moved.toISOString().slice(0, 10) + (m[4] || '');
}

/** A YAML scalar as written (quotes kept) with its date moved, or null to leave it. */
function shiftScalar(raw, days) {
  const q = raw[0];
  if ((q === "'" || q === '"') && raw.length >= 2 && raw[raw.length - 1] === q) {
    const moved = shiftIsoValue(raw.slice(1, -1), days);
    return moved === null ? null : `${q}${moved}${q}`;
  }
  return shiftIsoValue(raw, days);
}

const asSet = (v) => (v instanceof Set ? v : new Set(Array.isArray(v) ? v : []));
const FM_LINE_RE = /^(\s*)([^\s:#][^:]*?):([ \t]*)(.*?)([ \t]*)$/;

/**
 * Move the dates in a database row's frontmatter: the values of `dateKeys`
 * (date/datetime column ids) and `nextReset:` nested under a `recurringKeys`
 * column. The body is never touched.
 * @param {string} text
 * @param {{ dateKeys?: Iterable<string>, recurringKeys?: Iterable<string> }} keys
 * @param {number} days
 */
function shiftRowDates(text, keys, days) {
  const dateKeys = asSet(keys && keys.dateKeys);
  const recurringKeys = asSet(keys && keys.recurringKeys);
  if (typeof text !== 'string' || !days || (!dateKeys.size && !recurringKeys.size)) return { value: text, changed: false };
  const lines = text.split('\n');
  const first = lines[0].replace(/^﻿/, '').replace(/\r$/, '');
  if (first !== '---') return { value: text, changed: false };
  let changed = false;
  let inRecurring = false;
  for (let i = 1; i < lines.length; i++) {
    const cr = lines[i].endsWith('\r') ? '\r' : '';
    const line = cr ? lines[i].slice(0, -1) : lines[i];
    if (line === '---' || line === '...') break;
    const m = FM_LINE_RE.exec(line);
    if (!m) continue;
    const [, indent, key, gap, rawValue, trail] = m;
    let moved = null;
    if (!indent) {
      inRecurring = recurringKeys.has(key);
      if (dateKeys.has(key) && rawValue) moved = shiftScalar(rawValue, days);
    } else if (inRecurring && key === 'nextReset' && rawValue) {
      moved = shiftScalar(rawValue, days);
    }
    if (moved !== null && moved !== rawValue) {
      lines[i] = `${indent}${key}:${gap}${moved}${trail}${cr}`;
      changed = true;
    }
  }
  return changed ? { value: lines.join('\n'), changed } : { value: text, changed: false };
}

/**
 * Move the ISO dates in the named columns of a sheet's data.csv (the header
 * row holds column names). RFC 4180 quoting; every byte outside the moved
 * cells — quotes, CRLF, the _hnid column — is kept.
 * @param {string} text
 * @param {Iterable<string>} columnNames
 * @param {number} days
 */
function shiftCsvDates(text, columnNames, days) {
  const names = asSet(columnNames);
  if (typeof text !== 'string' || !days || !names.size) return { value: text, changed: false };
  const edits = [];
  let targets = null;
  let record = 0;
  let col = 0;
  let i = 0;
  const n = text.length;
  while (i <= n) {
    const start = i;
    let raw;
    if (text[i] === '"') {
      i++;
      while (i < n) {
        if (text[i] === '"') {
          if (text[i + 1] === '"') { i += 2; continue; }
          break;
        }
        i++;
      }
      i++; // closing quote
      while (i < n && text[i] !== ',' && text[i] !== '\n' && text[i] !== '\r') i++;
      raw = text.slice(start, i);
    } else {
      while (i < n && text[i] !== ',' && text[i] !== '\n' && text[i] !== '\r') i++;
      raw = text.slice(start, i);
    }
    if (record === 0) {
      const name = (raw.startsWith('"') ? raw.slice(1, -1).replace(/""/g, '"') : raw).replace(/^﻿/, '').trim();
      if (names.has(name)) (targets || (targets = new Set())).add(col);
    } else if (targets && targets.has(col) && raw) {
      const moved = shiftScalar(raw, days);
      if (moved !== null && moved !== raw) edits.push([start, i, moved]);
    }
    if (i >= n) break;
    if (text[i] === ',') { col++; i++; continue; }
    // End of record: \n, \r\n or a lone \r.
    if (text[i] === '\r' && text[i + 1] === '\n') i++;
    i++;
    record++;
    col = 0;
    if (record === 1 && !targets) return { value: text, changed: false };
  }
  if (!edits.length) return { value: text, changed: false };
  let out = '';
  let last = 0;
  for (const [s, e, v] of edits) { out += text.slice(last, s) + v; last = e; }
  return { value: out + text.slice(last), changed: true };
}

module.exports = {
  anchorShiftDays,
  shiftRowDates,
  shiftCsvDates,
  rewriteDashboard,
  scrubDashboard,
  mergeDashboard,
  stripSheetOwner,
  mergeDocumentsRegistry,
  mergePromptOverrides,
  mergeWorkspaceProperties,
  mergeToolRegistry,
  mergeVariablesMarkdown,
};
