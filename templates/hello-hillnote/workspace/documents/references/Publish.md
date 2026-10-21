# Publishing Your Workspace

Hillnote lets you turn any synced workspace into a public website. Your documents  
become web pages, hosted for you at a Hillnote address (or your own custom domain),  
and stay in sync as you update and republish.

This guide explains how publishing works, what you get, and how to manage your  
published sites.

* * *

![Pasted image](resources/images/Publish/1783014340628.webp)

## What is a published workspace?

When you publish a workspace, Hillnote builds a static website from your documents  
and hosts it publicly. Each published workspace gets its own URL:

```javascript
https://sites.hillnote.com/<your-username>/<workspace-slug>
```

- `your-username` — the public username you choose (see Set a username).
- `workspace-slug` — a URL-safe version of your workspace name, generated  
  automatically (e.g. *"My Travel Notes"* → `my-travel-notes`).

Everyone with the link can view your published site. Documents you don't publish  
stay private.

* * *

## Before you publish

A workspace must meet two requirements before it can be published:

1. **You must have a public username set.** This becomes the first part of your  
   site's URL.
2. **The workspace must have been synced at least once.** Publishing builds the  
   site from the synced copy of your workspace, so an unsynced workspace can't be  
   published.

You'll also need to be within your plan's **publish limit** (see  
Plans & limits).

* * *

## How publishing works, step by step

### 1\. Set a username

Your username is the public handle that appears in every published URL and on your  
public profile page. You can check whether a username is available and set or change  
it from your account settings before publishing.

> Your public profile lives at `https://sites.hillnote.com/<your-username>` and  
> lists all of your currently-published workspaces.

### 2\. Publish a workspace

When you publish, Hillnote:

1. Verifies you own the workspace and that it's been synced.
2. Checks you're under your publish limit.
3. Generates a URL slug from the workspace name.
4. **Queues a build** in the background.

Publishing doesn't happen instantly — it's queued and processed by a build worker.  
The publish request returns right away with a status of `queued`, and the site  
becomes live once the build finishes.

### 3\. The build runs

A background worker picks up the queued workspace and builds the static site:  
it converts each document to a web page, generates a search index, a sitemap, and  
a `robots.txt`, and uploads everything to Hillnote's hosting.

Your published workspace moves through these build states:

| Status | Meaning |
| --- | --- |
| `queued` | Waiting for the build worker to start. |
| `building` | The site is currently being built. |
| `published` | The build succeeded and your site is live. |
| `failed` | The build hit an error (the reason is shown so you can retry). |

The app polls the build status automatically and shows you when the site goes live.  
If a build **fails**, you can simply publish again to retry.

### 4\. Your site goes live

Once the status is `published`, your URL is live and anyone with the link can view  
it.

* * *

## Updating a published site

Your published site is a snapshot — editing documents in the app doesn't change the  
live site until you **republish**.

There are two ways to refresh a live site:

- **Update / rebuild** — pulls in your latest synced content and rebuilds every  
  page. Use this after you've edited documents and want the changes online.
- **Change site options** — adjust appearance and layout settings (see  
  Customizing your site). Saving new options also queues a  
  rebuild so the changes take effect.

Both actions queue a new build, just like the first publish. Only one build can run  
for a workspace at a time — if a build is already in progress, you'll be asked to  
wait for it to finish before starting another.

* * *

## Customizing your site

You can control how your published site looks and behaves with **site options**.  
These are saved per published workspace and applied on the next build.

### Toggles (on/off)

| Option | What it controls |
| --- | --- |
| **Show sidebar** | The document navigation sidebar. |
| **Show table of contents** | The on-page table of contents. |
| **Show dark mode** | A light/dark mode toggle for visitors. |
| **Show search** | Site search. |
| **Show emojis** | Document/folder emojis in navigation. |
| **Show comments** | Reader comments on documents. |
| **Show navbar** | The top navigation bar. |
| **Floating sidebar** | Renders the sidebar as a floating panel. |
| **Floating navbar** | Renders the navbar as a floating bar. |

### Appearance & layout

| Option | What it controls |
| --- | --- |
| **Site name** | The name shown for your site (up to 100 characters). |
| **Default theme** | `light`, `dark`, or `system` (follow the visitor's device). |
| **Logo / logo size** | A logo image and its height (24–96 px). |
| **Sidebar / content background** | Custom hex colors (e.g. `#1a1a2e`). |
| **Favicon** | A single emoji used as the site favicon. |
| **Database view** | How database documents display: `minimal-list` or `table`. |
| **Home page** | Which document is the site's landing page (`auto` picks one for you). |

Invalid values are quietly corrected to safe defaults — for example, a malformed  
color is ignored, and an unrecognized theme falls back to `system`.

* * *

## Custom domains

By default your site is served from `sites.hillnote.com`. On the **Ultra plan** you  
can connect your own domain (e.g. `docs.yourcompany.com`).

**How it works:**

1. The workspace must already be **published** before you can add a domain.
2. Add your domain. Hillnote registers it and gives you **DNS verification  
   records** (for ownership and SSL).
3. Add those records at your DNS provider.
4. Hillnote checks the status and issues an SSL certificate once verification  
   passes. You can re-check the status at any time to see progress.

**Notes & restrictions:**

- Custom domains require an **Ultra** plan.
- You can't use `hillnote.com` or its subdomains.
- A domain can only be connected to one published workspace at a time.
- Removing a domain detaches it from your site (your `sites.hillnote.com` URL keeps  
  working).

* * *

## Unpublishing

Unpublishing a workspace takes the site offline and deletes its hosted files. If a  
custom domain was attached, it's disconnected too. This is permanent for that  
published instance — you can always publish the workspace again later, but the live  
site and its files are removed immediately.

* * *

## Plans & limits

How many workspaces you can publish depends on your plan:

| Plan | Publish limit | Custom domains |
| --- | --- | --- |
| **Free** | 0 (publishing not available) | — |
| **Plus** | 1 | — |
| **Pro** | 6 | — |
| **Ultra** | 30 | ✅ |

If you reach your publish limit, you'll need to unpublish a workspace or upgrade  
your plan to publish more.

### Rate limits

To keep the build system healthy, publishing is rate-limited:

- **Publish / rebuild / option changes:** up to **10 per hour** per user.
- **Status checks:** up to **60 per minute** per user.

These limits are generous for normal use — you'd only hit them by republishing very  
rapidly in a short window.

* * *

## Troubleshooting

**"Please set a username before publishing."**  
You need a public username first. Set one in your account settings, then try again.

**"Workspace must be synced at least once before publishing."**  
Sync the workspace, then publish.

**"You've reached your publish limit."**  
Unpublish an existing site or upgrade your plan.

**"This workspace is already published."**  
Use **Update** to rebuild it instead of publishing a second time.

**Build failed.**  
The failure reason is shown on the workspace. Fix the issue if applicable and  
publish again — a failed build can always be retried.

**"A build is already in progress."**  
Wait for the current build to finish, then make your change.

**"This workspace name produces a reserved URL slug."**  
Some names (like *index* or *sitemap*) collide with reserved site paths. Rename the  
workspace so its slug is unique and valid, then publish.