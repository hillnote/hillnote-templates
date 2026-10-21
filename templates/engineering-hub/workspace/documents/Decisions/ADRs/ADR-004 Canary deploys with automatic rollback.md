---
status: Accepted
decided: '2026-10-13'
area: Infra
deciders: Sam Okoro, Tomás Reyes
_emoji: 🐤
---

## Context

Deploys went to all instances at once. Two bad deploys last quarter were caught by customers before our dashboards, and rollback took about 12 minutes each time.

## Decision

Every production deploy will be a [[canary|doc:documents/Specs/Glossary.md#canary]]: 5% of traffic for 15 minutes, compared automatically with the current version on error rate and p99 latency. If either is worse by more than a set margin, the deploy rolls back without a human. Otherwise it continues to 25%, then 100%. Steps are in [[Deploy|doc:documents/Runbooks/Deploy.md]].

## Consequences

- A bad deploy reaches 5% of requests for at most 15 minutes instead of everyone until someone notices.
- Deploys take about 35 minutes end to end instead of 8.
- The canary only catches what shows up in 15 minutes. Slow problems, like a cache that fills over hours, still get through: see the [[places search postmortem|doc:documents/Runbooks/Postmortem%20-%20Places%20search%20latency.md]].
- Schema migrations must be backwards compatible, because two versions run side by side.
