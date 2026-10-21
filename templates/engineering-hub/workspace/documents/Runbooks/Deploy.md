---
stage: Accepted
owner: Sam Okoro
---

# Deploy

How ${service} goes to production. Every deploy is a [[canary|doc:documents/Specs/Glossary.md#canary]] ([[ADR-004|doc:documents/Decisions/ADRs/ADR-004%20Canary%20deploys%20with%20automatic%20rollback.md]]): 5% of traffic, then 25%, then everyone, with automatic rollback at each step. A normal deploy takes about 35 minutes, and most of that is waiting.

:::toc "On this page"
:::

## Before you deploy

- [ ] The PR is merged to `main` and CI is green, including the contract tests
- [ ] The ticket is In review or Done, and the PR link is on it
- [ ] Any schema migration is backwards compatible: the old version must run against the new schema for the length of the canary
- [ ] Risky code is behind a [[feature flag|doc:documents/Specs/Glossary.md#feature-flag]], off by default
- [ ] No freeze is in effect (see below) and nobody is running an incident
- [ ] You can stay for the next hour

## Ship it

```bash
atlasctl deploy atlas-api --ref main
```

The pipeline then runs these stages on its own:

| Stage | Traffic | Duration | Rolls back automatically if |
|---|---|---|---|
| Canary | 5% | 15 min | Error rate > 1.5x baseline, or p99 > 1.2x baseline |
| Partial | 25% | 10 min | Same checks |
| Full | 100% | — | Same checks for the first 10 minutes |

Watch the deploy dashboard while it runs. Post the deploy link in the team channel, so nobody stacks a second deploy on top of yours.

## Verify

- [ ] Error rate and p99 on the gateway dashboard look like they did an hour ago
- [ ] One real request per changed endpoint, from your machine, with a test key
- [ ] Redis memory and Postgres connections are flat, not climbing (the canary doesn't catch slow leaks)
- [ ] Turn the feature flag on for internal keys first, then a small share of tenants

## Roll back

If anything looks wrong, roll back first and investigate second. Rolling back is always safe; that's what the backwards-compatible migrations are for.

```bash
atlasctl rollback atlas-api
```

It returns to the previous release in about two minutes. If you rolled back because customers were affected, open an incident: see [[Incident response|doc:documents/Runbooks/Incident%20response.md]].

## Freezes

- No deploys after 15:00 on Fridays, or the day before a public holiday.
- No deploys during a SEV1 or SEV2, except the fix, approved by the [[incident commander|doc:documents/Specs/Glossary.md#incident-commander]].
- During enforcement weeks for rate limiting, only the limiter's owner deploys the gateway.

Flag changes are not deploys and are fine during a freeze, as long as you post them in the channel.
