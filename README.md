# Hillnote workspace templates

Ready-made [Hillnote](https://hillnote.com) workspaces: documents, databases, sheets, slides,
moodboards, HTML tools, recipes, a dashboard, even plugins. Pick one when you create a workspace
(**Create workspace → From a template**), drop one into an empty workspace from its landing page,
or browse them at [hillnote.com/templates](https://hillnote.com/templates) and click
**Open in Hillnote**.

Everything here is MIT licensed. Hillnote reads [`registry.json`](registry.json) straight from this
repo, so a merged template reaches the app within minutes, with no app update.

## Using templates

You never need this repo to use a template. Two things worth knowing:

- **A template grants nothing.** Plugins inside a template arrive **turned off**: Hillnote shows
  its usual permission dialog when you turn one on. HTML tools run in a sandbox, but they can
  reach the internet, and the gallery tells you which ones do. A template never brings triggers,
  settings, or anything from the author's machine, and it never replaces a file you already have.
- **Templates are verified.** Hillnote downloads the release zip, checks its sha256 against
  `registry.json`, and runs it through the same rules CI applies before writing a single file.

## Making a template

### 1. Build the workspace in Hillnote

Make the workspace you want to share, exactly as someone should find it: a start page, the
databases, the tools, a dashboard if you like. Keep it free of anything personal.

Writing or polishing files by hand? [AUTHORING.md](AUTHORING.md) has the on-disk format of
everything a template can carry, the house style of the official templates, and a checklist.

### 2. Snapshot it

```bash
npm ci
npm run snapshot -- "/path/to/your/workspace" my-template
```

This copies the workspace into `templates/my-template/workspace/` through the same rules the app
enforces, and leaves out:

- machine and sync state: `.system/`, `.hillnote/`, `plugins/.state.json`;
- generated files: `readme.md`, `agents.md`, `CLAUDE.md`, `documents/topics.md`;
- triggers (`local-triggers.json`, which run shell commands) and tool settings (they can hold
  API keys);
- your notepad and your personal folders (quicknotes, recordings, imports).

It also scrubs your workspace ids, paths and name out of `dashboard.json`, and writes a
`template.json` stub. The source folder is only read, never changed. Encrypted pages stop the
snapshot: decrypt or remove them first.

### 3. Fill in `template.json`

| field | required | rule |
|---|---|---|
| `formatVersion` | ✓ | `1` |
| `id` | ✓ | `^[a-z0-9][a-z0-9-]{1,63}$`, the folder name |
| `version` | ✓ | semver `x.y.z`, bumped whenever the content changes |
| `name` | ✓ | 1–60 characters |
| `tagline` | ✓ | one line, 1–140 characters |
| `description` | ✓ | ≤ 2000 characters, plain text, paragraphs separated by a blank line |
| `setups` | | from `solo-builder code design product writing creator marketing research dungeon-master fitness`; the first one places the template on hillnote.com |
| `tags` | | ≤ 8, each ≤ 24 characters |
| `featured` | | maintainers only |
| `author` | ✓ | `{ "name": "…", "url": "https://…" }` (url optional) |
| `license` | ✓ | `"MIT"` |
| `credits` | | ≤ 1000 characters, naming any third-party material |
| `minAppVersion` | | the oldest Hillnote that can open it |
| `open` | | the start document, under `documents/` |
| `overview` | | ≤ 300 characters; becomes the new workspace's overview |
| `color` | | a Hillnote tile colour key, e.g. `"blue"` |
| `dateAnchor` | | `YYYY-MM-DD`, the week your sample dates were written around; install moves them to the current week |
| `plugins` | | plugin-store references (below) |
| `icon` | ✓ | `media/icon.webp` |
| `hero` | | `media/hero.webp`, a wide image for the detail page |
| `screenshots` | | up to 6 images under `media/` |

### 4. Add the art

`media/icon.webp` is the tile everyone sees. Match the setup icons on
[hillnote.com/connect](https://hillnote.com/connect): a square illustration on a **transparent
background in dark shapes**, at least 160×160 (512×512 is ideal), under 200 KB. Tiles sit on a
light surface in light and dark mode alike. A hero image and screenshots are optional, ≤ 2 MB each.
`node scripts/prepare-icon.mjs <image> templates/<id>/media/icon.webp` pads an illustration
to a transparent square.

### 5. Plugins

Plugins are never copied as files. Reference a plugin from the
[plugin store](https://github.com/hillnote/hillnote-plugins) by its exact release:

```json
"plugins": [{ "id": "momentum", "version": "1.0.0", "sha256": "<from the plugin registry entry>" }]
```

The build downloads that release, checks its sha256 and puts it in the template. A plugin that
isn't in the store yet has to be submitted there first.

### 6. Check it, try it, open a pull request

```bash
npm run validate -- my-template                  # every rule CI applies
node scripts/inject-tool-baseline.mjs my-template  # HTML tools get the app's design system
node scripts/check-calcs.mjs my-template           # variables and formulas through the app's engines
npm run build                                    # dist/<id>-<version>.zip + dist/registry.json
npm run serve                                    # a local registry on http://127.0.0.1:8932
```

The two middle helpers read a sibling HillnoteApp checkout (`HILLNOTE_APP_DIR` to point elsewhere).

Then, in a development build of Hillnote (HillnoteApp):

```bash
HILLNOTE_TEMPLATE_REGISTRY_URL=http://127.0.0.1:8932/registry.json npm run electron-dev
```

Create a workspace from your template and walk through it. When it's right, open a pull request
with `templates/my-template/`. Leave out `registry.json` and `dist/`: CI builds both after the merge.

## Rules CI enforces

- **Only workspace content.** `documents/`, `resources/`, and the shared workspace files
  (`dashboard.json`, `documents-registry.json`, `ai_prompt_overrides.json`,
  `workspace-properties.json`, `variables.md`, `cover.*`). Nothing hidden, no generated files, no
  triggers, no tool settings, no plugin files.
- **Portable names.** No names that differ only in case, no Windows-reserved names, NFC Unicode
  only, no symlinks.
- **Nothing private.** Absolute paths (`/Users/…`, `C:\Users\…`), email addresses and API tokens
  fail the check.
- **Everything it points at exists.** The start document, dashboard widgets, and the sheets and
  databases tools are bound to.
- **Size.** ≤ 5000 files, ≤ 100 MB, ≤ 25 MB per file.
- **Versions are immutable.** Once `id@version` is released its zip never changes. Changing the
  content means bumping `version`.
- **MIT, all the way down.** Everything in a template must be yours to license under MIT, or public
  domain / CC0, with sources named in `credits`. Copyrighted books, PDFs and images don't belong
  here, however useful they'd be.

Every tool's outbound hosts are listed in the CI output for the reviewer.

## Repo layout

```
templates/<id>/template.json   the listing
templates/<id>/workspace/      the workspace files
templates/<id>/media/          icon (required), hero + screenshots (optional)
registry.json                  built by CI after each merge; never edit by hand
lib/                           vendored app rules (templatePolicy, templateTransforms, syncRules),
                               zip writer + strict reader
scripts/                       validate, build, snapshot, serve, test; authoring helpers
                               prepare-icon, inject-tool-baseline, check-calcs
AUTHORING.md                   file formats, house style, pre-PR checklist
```

How releases work, and the one-time setup, are in [PUBLISH.md](PUBLISH.md).
