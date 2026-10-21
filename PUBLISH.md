# Publishing this repo

## One-time setup

1. **The `hillnote` GitHub org** already exists (it also holds Hillnote-Tools). It is shared with
   `hillnote-plugins`. The app pins
   `https://raw.githubusercontent.com/hillnote/hillnote-templates/main/registry.json` and only
   accepts zips from `https://github.com/hillnote/hillnote-templates/releases/download/`, so the
   owner and repo name must be exactly these.
2. **Create the repo and push** (public, MIT):
   ```bash
   gh repo create hillnote/hillnote-templates --public --source . --push
   ```
3. **Let the release workflow write.** Repo → Settings → Actions → General → Workflow permissions →
   **Read and write permissions**. It only needs `contents: write`, to create releases and commit
   `registry.json`. It never opens pull requests.
4. **Make releases immutable** (Settings → General → Releases → *Enable release immutability*, where
   GitHub offers it). The workflow already refuses to replace an existing `<id>-v<version>` tag;
   this makes GitHub refuse too.
5. **Protect `main`** with a *ruleset* (Settings → Rules → Rulesets), not classic branch protection:
   require pull requests and the *Validate templates* check, and add **GitHub Actions** to the
   ruleset's bypass list. The release workflow commits `registry.json` straight to `main` as
   `github-actions[bot]`; without the bypass that push is refused after the releases were already
   created, and the gallery never sees them (re-run the workflow once the bypass is in place).

Do steps 3–5 before the first push if you can. The first push releases every template at once; if
it ran before step 3, re-run it from the Actions tab afterwards (it only builds what isn't released).
6. **Publish `hillnote-plugins` first** if any template references a plugin (see that repo's
   PUBLISH.md). Templates without plugins never touch the plugin registry.

## What happens on a merge

`.github/workflows/release.yml` runs on every push to `main` that touches `templates/**`, one run at
a time:

1. `npm test` and `npm run validate`.
2. Builds a zip for every template version with no `<id>-v<version>` release yet. Versions already
   released are carried forward from the committed `registry.json`; their zips are immutable.
3. Creates release `<id>-v<version>` with asset `<id>-<version>.zip`, downloads it back and checks
   its sha256.
4. Regenerates `registry.json`, with media URLs pinned to the merge commit, and commits it as
   `github-actions[bot]`.

Releases come before the registry, so the registry never points at a missing asset. The bot's
commit doesn't trigger another run.

Within about five minutes (GitHub's raw CDN cache), the app's gallery and
hillnote.com/templates show the new template.

## Updating a template

Change its files, bump `version` in `template.json`, open a PR. CI rejects a content change without
a version bump. A metadata-only change (tagline, tags, `featured`) needs no bump: the next run
refreshes the listing and keeps the released zip.

## Removing a template

Delete `templates/<id>/`. The next run drops it from `registry.json`. Its old releases stay on
GitHub but nothing points at them any more.

## Local end-to-end test (no GitHub needed)

```bash
npm run build && npm run serve
# in HillnoteApp, dev build only:
HILLNOTE_TEMPLATE_REGISTRY_URL=http://127.0.0.1:8932/registry.json npm run electron-dev
```

The server rewrites every zip and media URL to itself and answers with
`Access-Control-Allow-Origin: *`, so hillnote.com's gallery page can also be pointed at it during
local development.
