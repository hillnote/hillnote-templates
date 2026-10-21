# Authoring a workspace template

A template is a folder of ordinary Hillnote workspace files. This guide is the
on-disk format of everything a template can carry, the house style the
official templates follow, and a checklist to run before opening a PR.

The binding contract (template.json, the registry, the policy, what install
does) is `HillnoteApp/docs/WORKSPACE_TEMPLATES.md`; the README covers the
workflow. The easiest way to start is still to build the workspace in Hillnote
and `npm run snapshot` it. This guide is for writing or polishing files by hand.

```
templates/<id>/
  template.json        the listing (README → template.json)
  media/icon.webp      square, transparent, dark shapes (scripts/prepare-icon.mjs)
  media/hero.webp      optional wide image for the website detail page
  workspace/           the workspace files below
```

---

## 1. File rules (CI enforces these)

- Only `documents/**`, `resources/**`, and the root files `dashboard.json`,
  `documents-registry.json`, `ai_prompt_overrides.json`,
  `workspace-properties.json`, `variables.md`, `cover.(png|jpg|webp|…)`.
- Never `documents/Notepad.md`, `documents/topics.md`, `readme.md`, `agents.md`,
  `CLAUDE.md` (generated for every new workspace), any dot-folder, triggers,
  `tool.settings.json`, or `plugins/` files.
- Names: no `< > : " | ? *`, no trailing dot or space, NFC Unicode, no two
  names differing only in case. `Q1 plan.md`, not `Q1: plan.md`.
- No real people's data: email addresses only `@example.com` (or `.test`),
  no `/Users/…` or `/home/…` paths, nothing that looks like an API key.
- All content is yours to license under MIT. Name any CC0/public-domain
  sources in `credits`.
- Avoid folders named `quicknotes`, `recordings`, `imports` (special in the app).

## 2. Documents and the sidebar

Every `documents/**/*.md` is a page; every folder is a sidebar folder. Suffixes
make special pages: `.slides.md`, `.moodboard.md`, `.canvas.md`.

### documents-registry.json — emoji and order

```json
{
  "documents": [
    { "name": "Start here", "path": "documents/Start here.md", "type": "document", "emoji": "👋", "position": 0, "pinned": true },
    { "name": "Vision", "path": "documents/Strategy/Vision.md", "type": "document", "emoji": "🔭", "position": 0 }
  ],
  "folders": [
    { "name": "Strategy", "path": "documents/Strategy", "type": "folder", "position": 1, "pinned": false }
  ]
}
```

- `position` orders siblings inside one folder (documents and folders share
  the same sequence). Give every top-level item and every document a position.
- The sidebar takes a page's emoji ONLY from here. Database rows use `_emoji`
  in their own frontmatter instead (no registry entry needed).
- Every path listed must exist (CI error). `referencedIn`/`lastModified` are
  regenerated — leave them out.
- Do not put emoji characters in other frontmatter values: a registry rebuild
  takes the first emoji it finds in frontmatter.

### Sections (coloured groups)

A top-level `documents/<Name>/` folder with a `section.json` renders as a
collapsible, coloured section. Only top level; nested `section.json` is ignored.

```json
{ "version": 1, "name": "Strategy", "color": "blue", "shape": "Shape 12", "created": "2026-11-02T09:00:00.000Z" }
```

`color` is any TAG_COLORS key (HillnoteApp `src/lib/colors.js`); `shape` is
`"Shape 1"` … `"Shape 72"`. Sections can hold pages, folders and databases.

### Frontmatter

```yaml
---
owner: Priya
stage: Draft
reviewed: '2026-11-04'
---
```

Single-line scalars and block lists only (`tags:` then `  - a` lines). No
`>-` / `|` folded strings, no inline `[a, b]` lists. Keys starting with `_` are
hidden. To give plain pages typed properties, declare them in
`workspace-properties.json`:

```json
{ "version": 1, "properties": [
  { "id": "stage", "name": "Stage", "type": "status", "options": ["Draft", "In review", "Final"],
    "optionColors": { "Draft": "gray", "In review": "amber", "Final": "emerald" },
    "optionStates": { "Final": "done" } },
  { "id": "reviewed", "name": "Reviewed", "type": "date" }
] }
```

Ids: `^[a-z][a-z0-9_]{0,63}$` (snake_case — `dueDate` is dropped). Types:
`text number select multiselect date datetime checkbox url email person status`.

### Inline syntax

| What | Write |
|---|---|
| Page link | `[[Vision\|doc:documents/Strategy/Vision.md]]` — URL-encode each path segment (`My%20Plan.md`) |
| Link to a heading | `[[Pricing\|doc:documents/Plan.md#pricing]]` (heading slug) |
| Anchor on a phrase | `the [new tier]{#new-tier} ships in week 3` → link with `#new-tier` |
| Topic | `#roadmap` in body text (not in headings or code) |
| Variable | `${company}`; calculation `${=price*seats}`, `${=round(a/b*100)}`; built-ins `${today}` `${weekday}` `${year}` |
| Tasks | `- [ ] open` / `- [x] done`, nest with 4 spaces |
| Highlight | `==important==` |
| Table of contents | `:::toc "On this page"` then `:::` |
| Tabs | `:::tabs` / `:::tab "One"` … `:::endtab` / `:::endtabs` |
| Scratch space | `:::scratchspace "Notes"` / `> **Note for AI:** what this space is for` / blank / text / blank / `:::` (the note line is required, or it shows as plain text) |
| Mermaid | a ` ```mermaid ` fence |
| Database embed | `[database:Roadmap](documents/Planning/Roadmap)` |
| Sheet embed | `[sheet:Budget](documents/Operations/Budget)` |
| Tool embed | `[html:RICE matrix](resources/html/rice-matrix/index.html)` |
| Image | `![alt](resources/images/<Doc name>/<file>.webp)` |

Inside `:::tab` and `:::scratchspace` bodies only basic markdown renders — keep
links, topics and variables outside them. Keep page links out of **table
cells** too: they display, but the first edit of the page saves them as plain
text. Put a `**Pages:** [[A|…]] · [[B|…]]` line under the table instead
(variables and `{#anchors}` in cells are fine). There are no callouts, toggles,
columns or LaTeX in documents; use headings, `>` quotes, tables and tabs.
CI checks every `doc:` link, embed and image target exists (examples inside
code fences and inline code are skipped).

### variables.md

```markdown
# Workspace Variables

<!-- hillnote:variables -->

## $product

Lumen

## $seats

40
```

Names may contain `-`, so subtraction needs spaces: `${=target - current}`
(`target-current` is read as one name). Use `_` in names. Calculations strip
`$ € £ ₹` and commas, `5%` is 0.05, and results print without thousands
separators — scale big numbers yourself: `${=round(arr / 1000000, 2)}M`.
Functions: `sum avg min max round(x, places) floor ceil abs`.

## 3. Databases

A database is a folder with `database.json` plus one `.md` file per row. The
file name is the row title; frontmatter keys are column **ids**.

```json
{
  "name": "Roadmap",
  "folderKind": "task-database",
  "columns": [
    { "id": "title", "name": "Initiative", "type": "title", "width": 280 },
    { "id": "status", "name": "Status", "type": "status",
      "options": ["Later", "Next", "Now", "Shipped"],
      "optionColors": { "Later": "gray", "Next": "blue", "Now": "amber", "Shipped": "emerald" },
      "optionStates": { "Later": "normal", "Next": "normal", "Now": "normal", "Shipped": "done" },
      "defaultValue": "Later" },
    { "id": "team", "name": "Team", "type": "select", "options": ["Core", "Growth"], "optionColors": { "Core": "purple", "Growth": "teal" } },
    { "id": "reach", "name": "Reach", "type": "number" },
    { "id": "rice", "name": "RICE", "type": "formula", "formulaMode": "formula", "formula": "ROUND({Reach} * {Impact} * {Confidence} / {Effort}, 0)", "resultType": "number" },
    { "id": "start", "name": "Start", "type": "date", "dateRole": "start" },
    { "id": "end", "name": "End", "type": "date", "dateRole": "end" }
  ],
  "views": [
    { "id": "default", "name": "Board", "type": "kanban", "groupBy": "status", "filters": [], "sorts": [] },
    { "id": "timeline", "name": "Timeline", "type": "gantt", "ganttZoom": "week", "colorByColumn": "team", "filters": [], "sorts": [] },
    { "id": "ranked", "name": "By RICE", "type": "table", "filters": [], "sorts": [{ "column": "rice", "direction": "desc" }] }
  ],
  "defaultView": "default"
}
```

Row `documents/Planning/Roadmap/Saved dashboards.md`:

```markdown
---
status: Now
team: Core
reach: 1200
start: '2026-11-02'
end: '2026-11-27'
_emoji: 📊
---

Customers rebuild the same view every Monday. Let them save it.

- [x] Interviews (6)
- [ ] Spec review
```

**Columns.** `title text number select multiselect status date datetime
checkbox url email person recurring location image formula`. No relation type
— link rows with `[[…|doc:…]]` in a text column or the body.

- Option colours MUST be one of: `gray red orange amber icing lime emerald teal
  cyan blue purple pink rose brown darkGray` (others are rewritten on open).
- Every select/status value in a row must be one of the column's `options`.
- Quote every date: `'2026-11-04'`. Unquoted dates are rewritten on open.
- Every row needs `_emoji` (otherwise the app writes a random one on open).
- `status` + `optionStates` (`normal`/`done`/`archive`) drives progress widgets.
- `formula`: Excel-style, refs by column name in braces — `{Price} * {Qty}`,
  `IF({Status} = "Shipped", 1, 0)`, `ROUND(…, 1)`, `DAYS({End}, {Start})`,
  `TODAY()`, `SUM/AVERAGE/MIN/MAX/CONCAT/TEXT`. Never stored in rows.
  `resultType`: `number` | `text` | `date` | `checkbox`.
- `date` columns: `dateRole: "start"` / `"end"` feed the gantt view.
- `recurring` needs a status column; row value:
  ```yaml
  repeat:
    frequency: weekly
    resetStatus: Planned
    nextReset: '2026-11-09'
  ```
  (`daily|weekly|monthly|yearly`, optional `interval`, `byDays: [1, 3]` for daily.)
- Multiselect rows: `tags:` then `  - Value` lines.
- Number cells: plain numbers (`1200`, `4.5`), no units.
- Never write `_dependsOn` (its ids carry the author's workspace id).

**Views.** Every view: `id`, `name`, `type`, `filters: [{column, operator, value}]`, `sorts: [{column, direction}]`.

| type | extra keys |
|---|---|
| `table` | `hiddenColumns: [ids]` |
| `kanban` | `groupBy` (status/select id), `cardImageColumn` |
| `gallery` | `cardImageColumn` |
| `calendar` | `dateColumn`, `colorByColumn`, `calendarViewMode` (`dayGridMonth` `dayGridWeek` `timeGridWeek` `timeGridDay` — exactly these) |
| `gantt` | `ganttZoom` (`day`/`week`/`month`), `ganttGroupBy`, `colorByColumn`, `ganttShowProgress` |
| `chart` | `chartType` (`bar hbar line area pie donut scatter`), `labelColumn`, `valueColumn`, `aggregation` (`count countNonEmpty sum average min max`), `splitColumn`, `dateBucket` (`day week month quarter year`), `sortBy`, `sortDir`, `limit` |
| `tool` | `toolPath: "resources/html/<tool>/index.html"` — the tool renders the view's rows |

Filter operators: `contains notContains equals notEquals isAnyOf isNoneOf
greaterThan lessThan isEmpty isNotEmpty …`. Never filter on a literal date —
sample dates move at install (see §9); filter on status or select instead.

`folderKind` picks the sidebar mark: `task-database calendar-database
blog-database map-database database kanban reading media music photos shopping
people money fitness recipes travel work goals ideas inbox tags science favorites`.

## 4. Sheets

A sheet is a folder with `sheet.json` + `data.csv` — for numeric tables and
logs (budgets, metrics, sets). The search index is built from the CSV on
first open.

```json
{ "version": 1, "name": "Money",
  "columns": [
    { "id": "title", "name": "Month", "type": "title" },
    { "id": "revenue", "name": "Revenue", "type": "number" },
    { "id": "costs", "name": "Costs", "type": "number" },
    { "id": "month_start", "name": "Month start", "type": "date" }
  ],
  "views": [ { "id": "default", "name": "Table", "type": "table", "filters": [], "sorts": [] } ],
  "defaultView": "default" }
```

```csv
Month,Revenue,Costs,Month start,_hnid
September,1200,850,2026-09-01,r_8f3c2a10-5b7e-4d21-9c3e-0a1b2c3d4e01
```

- Header row = column **names**, title column first, `_hnid` LAST.
- Every row has an `_hnid` of `r_` + a UUID (`crypto.randomUUID()`).
- Multiselect cells join values with `; `. Dates `YYYY-MM-DD`, unquoted.
- Never ship `owner` in sheet.json (install strips it anyway).

## 5. Slides (`.slides.md`)

```markdown
---
type: slides
theme: sand
paginate: true
---

# Quarterly roadmap review

~

Product team · quarterly review

***

## What we shipped

- Saved dashboards
- Alert digests
```

- Slides are separated by `***` on its own line.
- Themes: `default` (follows light/dark), `light`, `dark`, `mono`, `sand`, `ink`.
- Directives (own line): `~` (push the rest to the bottom), `~inline`, `~split`,
  `~banner`, `~column1-2/3`, `~bg-1a1a2e`, `~text-ffffff`, `~text-h1-ffcc00`,
  `~bg-column-…`, `~text-column-…`, `~line-horizontal`, `~line-vertical`.
- `~bar` / `~line` / `~pie` / `~area` right before a numeric table charts it.
- Mermaid fences render. Each image becomes its own column.
- Slides do not resolve `${variables}` — write values out, and say on Start
  here which decks need updating by hand.
- One idea per slide; if it needs a scrollbar it is two slides.

## 6. Moodboards (`.moodboard.md`)

The visual board — use it for brand boards, maps, concept maps. (Canvases are
Excalidraw JSON and too fragile to write by hand.)

````markdown
---
type: moodboard
---

```moodboard
{"type":"moodboard","version":1,"board":{"bg":"paper","texture":"dots","grid":{"size":20,"snap":false},"locked":false},"viewport":{"x":0,"y":0,"zoom":1},"items":[
{"id":"m_frame001","type":"frame","x":0,"y":0,"w":760,"h":320,"title":"Palette","color":"sand"},
{"id":"m_swatch01","type":"swatch","x":40,"y":60,"hex":"#0f3d5e","label":"Deep sea"},
{"id":"m_sticky01","type":"sticky","x":200,"y":60,"text":"Calm, never clinical","color":"peach"},
{"id":"m_doccard1","type":"doc","x":440,"y":60,"path":"documents/Brief.md","color":"mint"}
],"connectors":[{"from":"m_sticky01","to":"m_doccard1","label":"see brief"}],"strokes":[]}
```
````

- Items: `frame` (title, color), `sticky` (text, color), `text` (text,
  fontSize 14/16/20/28), `swatch` (hex, label), `doc` (path), `shape`
  (kind rect/ellipse, fill, stroke, radius), `link` (https url, title — the app
  fetches a preview, so avoid), `image` (src `resources/images/…`).
- Tints: `coral peach sand mint sage fog dusk blossom`. Board `bg`: `default
  paper sand mint fog dusk blossom slate cork`.
- Frames first in `items` (they render underneath). Positive coordinates from
  (0,0), 40 px gaps, columns at x = 0, 360, 720 …
- ids `m_` + 8 lowercase letters/digits, unique. One item per line.
- `doc` paths must exist (CI error).

## 7. HTML tools

A tool is a small web app in `resources/html/<tool>/`:

```
resources/html/rice-matrix/index.html
resources/html/rice-matrix/tool.meta.json
resources/html/tool_registry.json
```

`tool.meta.json` (paths relative to `documents/`; CI checks they exist):

```json
{ "name": "rice-matrix", "description": "Impact vs effort for the roadmap", "glyph": "🎯",
  "entryPoint": "index.html", "files": ["index.html"], "sheets": [],
  "databases": [ { "name": "Roadmap", "path": "Planning/Roadmap", "primary": true } ] }
```

`tool_registry.json` (merged into the user's at install):

```json
{ "tools": [ { "name": "rice-matrix", "description": "Impact vs effort for the roadmap",
  "glyph": "🎯", "color": "indigo", "entryPath": "resources/html/rice-matrix/index.html" } ] }
```

Show it as a database view: `{ "id": "matrix", "name": "Matrix", "type": "tool",
"toolPath": "resources/html/rice-matrix/index.html", "filters": [], "sorts": [] }`,
or embed it in a page: `[html:RICE matrix](resources/html/rice-matrix/index.html)`.

**Runtime** (injected by the app — never include it yourself):

```js
await hillnote.ready()
const src = await hillnote.data()          // the view's database (or the "primary" source)
const rows = await src.rows({ limit: 500 }) // [{ id, title, <columnId>: value, … }]
await src.update(rows[0].id, { status: 'Now' })
src.onChange(() => render())               // re-read when rows change
hillnote.settings.get('history', [])       // ≤ 64 KB of JSON per tool, saved beside it
hillnote.settings.set('history', list)
hillnote.context.theme                     // 'light' | 'dark'
```

Rules for template tools:
- Fully self-contained: no CDNs, fonts, images or `fetch` to other hosts (CI
  lists every host a tool mentions for the reviewer). `localStorage` does not
  persist — use `hillnote.settings`.
- Write semantic HTML + tool-specific CSS only, then run
  `node scripts/inject-tool-baseline.mjs <id>`: it adds the app's design system
  (tokens `--background --foreground --card --muted --muted-foreground --primary
  --success --warning --info --destructive --border --radius`, classes `.btn
  .btn-primary .btn-ghost .btn-sm .card .toolbar .row .stack .field .list
  .list-item .badge .badge-success|warning|info|danger .muted .empty-state`,
  styled `h1–h4 p button input select textarea table`). Never hardcode colours;
  light and dark both work through the tokens.
- Must work with zero rows and when opened outside a database view (show an
  `.empty-state` explaining where to use it).
- Never ship `tool.settings.json`.

## 8. Recipes (`ai_prompt_overrides.json`)

Recipes become slash commands (`/weekly_review`) in the editor and chat.

```json
{ "overrides": [
  { "id": "status_digest",
    "when_user_asks_about": "a weekly status update for the roadmap",
    "override_instructions": "Read the roadmap and last week's review. Write a status digest: shipped, in flight (with risk), slipping (why), decisions needed. Plain language, no hype.",
    "required_documents": ["documents/Rituals/Weekly product review.md"],
    "optional_documents": [],
    "output_format": "Four short sections with bullet points" } ] }
```

`id` is lowercase snake_case. Document paths must exist (CI error).

## 9. Dashboard and sample dates

`dashboard.json` is the workspace home (applied only to a workspace with no
widgets of its own). Use `template:` as the workspace id in compound ids —
install points everything at the new workspace.

```json
{ "defaultView": "dashboard", "widgets": [
  { "id": 1, "type": "document-view", "config": { "documentPath": "documents/Start here.md", "documentName": "Start here" }, "size": "double", "height": 3, "position": 0 },
  { "id": 2, "type": "tasklist-stats", "config": { "displayMode": "bar", "selectedDatabases": [ { "id": "template:documents/Planning/Roadmap", "path": "documents/Planning/Roadmap", "name": "Roadmap" } ] }, "size": "single", "height": 1, "position": 1 },
  { "id": 3, "type": "pinned-documents", "config": { "pinnedDocuments": ["documents/Specs/PRD.md"] }, "size": "single", "height": 2, "position": 2 },
  { "id": 4, "type": "database", "config": { "databasePath": "documents/Planning/Roadmap", "databaseName": "Roadmap" }, "size": "full", "height": 3, "position": 3 }
] }
```

Widgets: `document-view`, `database`, `sheet` (`sheetPath`), `pinned-documents`,
`tasklist-stats`, `pinned-tasklists`, `clock`, `text` (`draftContent`),
`recent-documents`, `document-count`. Sizes `single|double|full`, height 1–3,
on a 3-column grid. Avoid `photos`, `rss`, `unsplash`, `youtube-embed` (network
or machine paths).

**Sample dates.** Set `"dateAnchor": "YYYY-MM-DD"` in template.json to the
Monday of the week your sample data is written around. At install every
`date`/`datetime` value in database rows (and `nextReset`), and every date
cell in sheet date columns, moves by whole weeks so that week is the user's
current week. So: keep sample dates within a few weeks of the anchor, never put
literal dates in prose or view filters (write "week 3", "next Friday", or
`${today}`), and don't date things in plain-page frontmatter.

## 10. House style (the official templates)

- **A worked example, not placeholders.** A believable fictional project,
  filled in, so every view has something to show. Fictional companies and
  people only.
- **`documents/Start here.md`** is `open`, pinned, position 0, with:
  what this workspace is for and a map of it (links); "Your first 15 minutes"
  as tasks; how the pieces connect; "Make it yours" (which parts are the
  sample story; deleting rows keeps views and columns); "Use with AI" (each
  recipe as `/command`, and "point Claude Code or Cursor at this folder over
  MCP"); "Suggested routines" (the schedule and the recipe to run — routines
  themselves can't ship).
- **3–4 sections** (`section.json`) for structure, a `Templates` folder of
  reusable blank pages to duplicate, **one hub database** (8–12 rows with real
  bodies, ≥ 3 views) and 1–3 smaller databases or sheets.
- **2 tools** and **3 recipes**, a `variables.md` whose variables the pages
  actually use, a dashboard.
- Voice: direct, practical, warm; short paragraphs; real frameworks people
  can use (not filler). No lorem ipsum, no "TODO".

## 11. Checklist before a PR

```bash
node scripts/inject-tool-baseline.mjs <id>   # tools get the design system
node scripts/check-calcs.mjs <id>            # ${=…}, ${name} and formula columns, via the app's engines
npm run validate -- <id>                     # zero ✗; read every ⚠
npm test && node scripts/build.mjs --check
npm run serve                                # then install it in the app:
# HILLNOTE_TEMPLATE_REGISTRY_URL=http://127.0.0.1:8932/registry.json npm run electron-dev
```

Then in the app: open every database view, every tool, the slides and boards,
and confirm nothing was rewritten on first open (no `_emoji`, `_hnid`, date or
colour churn in the files).
