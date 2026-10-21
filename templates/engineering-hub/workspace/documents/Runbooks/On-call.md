---
stage: Accepted
owner: Sam Okoro
---

# On-call

Being on call for ${service} should be boring. If it isn't, the fix is better alerts and better systems, not tougher people.

## Rotation

- One week each, primary and secondary, handing over on Monday at 10:00.
- Primary answers pages; secondary is backup and takes over if the primary doesn't acknowledge in 5 minutes.
- Escalation after that: the tech lead (Tomás Reyes), then the engineering manager.
- Swaps are fine. Update the schedule yourself and say so in the team channel.
- After a night with a page, start late the next day. After a rough week, take a day.

## What pages and what doesn't

We page for customer pain, measured against our SLOs, and nothing else.

| Pages someone | Becomes a ticket |
|---|---|
| Availability burning the error budget 14x faster than normal for 5 minutes | Slow burn: 2x normal for six hours |
| Places search or geocode p99 over SLO for 10 minutes | A single slow endpoint outside the SLO list |
| Gateway error rate over 1% for 5 minutes | Disk at 70% |
| Rate limiter failing open for 5 minutes | Certificate expiring in 14 days |

**Pages:** [[error budget|doc:documents/Specs/Glossary.md#error-budget]]

An alert that fires and needs no action is a bug. Fix it or delete it within the week.

## Common alerts

- **Places search p99 high.** Check Redis memory and evictions first. If evictions spiked, look for a stampede: see the [[places search postmortem|doc:documents/Runbooks/Postmortem%20-%20Places%20search%20latency.md]] and the [[TTL jitter alerts|doc:documents/Work/Tickets/Stagger%20cache%20TTLs%20with%20jitter.md]].
- **Limiter failing open.** The limiter's Redis is unreachable and the gateway is using local buckets. Customers are fine; fix Redis within the hour.
- **Gateway 5xx.** Anything deployed in the last three hours? Roll it back first ([[Deploy|doc:documents/Runbooks/Deploy.md]]).
- **Import workers stalled.** Data goes stale after 48 hours, so this can wait for working hours unless it has already been 36.

## Handoff checklist

- [ ] Pages this week, one line each, and whether a ticket exists for each
- [ ] Anything still open or being watched
- [ ] Alerts that fired without needing action, with a ticket to fix them
- [ ] Deploys or flag changes planned for the coming week
- [ ] Confirm the new primary can log in to the dashboards and the deploy tool

## When you're paged

1. Acknowledge within 5 minutes.
2. Decide: is a customer hurting? If yes, it's an incident: follow [[Incident response|doc:documents/Runbooks/Incident%20response.md]].
3. If not, write down what you saw in the alert's ticket and go back to bed.
