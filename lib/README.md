# lib/

## Vendored from the Hillnote app: never edit

| file | source (HillnoteApp) |
|---|---|
| `templatePolicy.cjs` | `src/main-process/workspaceTemplates/templatePolicy.js` |
| `templateTransforms.cjs` | `src/main-process/workspaceTemplates/templateTransforms.js` |
| `syncRules.cjs` | `src/lib/syncRules.js` |

These are **byte-identical copies** of the rules the app enforces when it installs a template.
CI runs the exact same policy, so a template that passes here installs in the app unchanged.

- Never edit them here. Change the app's file, then run `node scripts/sync-template-policy.js` in
  HillnoteApp. It copies all three, and `--check` (part of the app's lint) fails when they drift.
- They are pure CommonJS with no requires, which is why ESM scripts can load them through
  `createRequire`.

`archiveGuards.mjs` is copied from `hillnote-plugins/lib/` (the plugin installer's entry-name checks).

## Own code

- `buildZip.mjs`: deterministic STORE-only zip writer (fixed timestamps, byte-order names,
  regular files only).
- `readZip.mjs`: strict zip reader (store/deflate only, size caps before and during inflation,
  CRC and duplicate checks). It reads plugin release archives at build time; no third-party zip
  library.
- `templates.mjs`: the shared core of validate, build, snapshot and serve.
