---
stage: Final
confidence: High
---

# Tech stack

Boring on purpose. Every choice here is something one person can run, debug at 11 pm and explain to a coding agent in a sentence. The rule: **pay for anything that protects the promise** (getting freelancers paid) and use free tiers for everything else.

## The stack

| Layer | Choice | Why | Per month |
|---|---|---|---|
| App | TypeScript and Next.js, one repo | One language front to back; coding agents know it well | $0 |
| Hosting | A managed app platform, one small instance | No servers to look after | $20 |
| Database | Managed Postgres with daily backups | Boring, reliable, easy to restore | $15 |
| Payments | Stripe Connect (Express accounts) | Card payments land in the freelancer's own payout account; onboarding and compliance handled | Per-payment fees |
| Email | A transactional email service with a dedicated sending domain | Reminders have to reach the inbox | $15 |
| PDFs | Rendered on the server from the invoice page's HTML | One template, two outputs | $0 |
| Errors | Error tracking, free tier | Know before a customer writes in | $0 |
| Analytics | Privacy-friendly page analytics | Counting, not tracking | $9 |
| Design | Figma, one seat | Mock the screens before building them | $15 |
| Domain | One domain, renewed yearly | | $2 |

**Total: about $${monthly_costs} a month** before payment fees. Break-even is ${=ceil(monthly_costs / price_monthly)} customers; the [[Lean canvas|doc:documents/Strategy/Lean%20canvas.md]] has the rest of the cost structure.

## Decisions worth remembering

- **Express accounts, not full custom onboarding.** The payment provider hosts the identity checks. Less control over the form, far less compliance work. Revisit only if onboarding drop-off passes 30%.
- **No background job service.** Reminders run from one scheduled task every 15 minutes that sends anything due. It's simple to reason about and fine until thousands of invoices a day.
- **Server-rendered PDFs.** The invoice page and the PDF share one template, so they can't drift apart.
- **No mobile app.** The invoice page works on a phone; the app comes after the business does.

## Environments

| | Local | Production |
|---|---|---|
| Payments | Test mode, with the provider's CLI forwarding webhooks | Live mode |
| Email | Captured locally, never sent | Real sending domain |
| Data | Seeded with three fake clients | Backed up daily, restore tested once a month |

Keys and secrets live in the hosting platform's settings and a local `.env` file, never in this workspace.

## Working with coding agents

This workspace and the code repository sit side by side. Claude Code or Cursor reads the [[MVP spec|doc:documents/Build/MVP%20spec.md]] and the Build board over MCP, so a prompt can be one line: name the card and let it read the rest. Keep the spec current and the agent stays current.
