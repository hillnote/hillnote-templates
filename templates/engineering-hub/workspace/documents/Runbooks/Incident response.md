---
stage: Accepted
owner: Sam Okoro
---

# Incident response

When ${service} is broken or slow for customers, this page is the plan. Read it once now, so you aren't reading it for the first time at 3am.

:::toc "On this page"
:::

## Severity

| Level | What it means | Who gets paged | Customer updates |
|---|---|---|---|
| SEV1 | The API is down or wrong for most customers, or data is exposed | On-call, secondary, tech lead | Status page within 10 minutes, then every 30 minutes |
| SEV2 | A core endpoint is badly degraded, or an SLO is burning fast | On-call, secondary | Status page within 20 minutes, then every hour |
| SEV3 | Degraded with a workaround, or one customer affected | On-call, in working hours | Support replies; no status page |

When unsure, pick the higher one. Downgrading later is free; under-reacting isn't. See also [[SEV level|doc:documents/Specs/Glossary.md#sev-level]].

## Roles

One person per role. In a small incident, one person can hold two, but never let the incident commander debug.

- **Incident commander (IC).** Runs the incident: decides, delegates, keeps time. Asks "what do we know, what are we trying, what's next?" every 15 minutes. Usually the on-call engineer until they hand it to someone. See [[incident commander|doc:documents/Specs/Glossary.md#incident-commander]].
- **Ops lead.** Investigates and fixes. Says what they are about to do *before* doing it, in the channel.
- **Comms lead.** Writes the status page and customer updates on the cadence above, and answers support, so the ops lead never has to.
- **Scribe.** Keeps the timeline in the Incident log below: what happened, what we tried, what we decided, with times. This becomes the postmortem.

## The first 15 minutes

- [ ] Acknowledge the page and open an incident channel named after the symptom, not the cause
- [ ] Declare a severity and say who is IC
- [ ] Start the Incident log and note when it began and how it was detected
- [ ] Check the obvious: anything deployed, flagged or migrated in the last three hours? (See the [[Changelog|doc:documents/Runbooks/Changelog.md]] and the deploy channel)
- [ ] If a recent change is a plausible cause, roll it back now ([[Deploy|doc:documents/Runbooks/Deploy.md]])
- [ ] Comms lead posts the first status update
- [ ] Page more people if you need them. Nobody minds being woken for a real SEV1.

## Keep the timeline

The scribe keeps the log here. Every entry is timestamped, so the postmortem writes itself. When it's over, press **Copy timeline** and paste it into a new page with `/postmortem`.

[html:Incident log](resources/html/incident-log/index.html)

## Updating customers

Short, plain and regular, even when there's no news:

> **Investigating.** Places search is responding slowly for some requests. We are investigating and will update within 30 minutes.

> **Identified.** We found the cause of the slow places search responses and are rolling out a fix. Next update within 30 minutes.

> **Resolved.** Places search response times are back to normal. A small share of requests timed out between the first and last update. We'll publish what happened and what we're changing.

Never guess at causes publicly, and never blame a vendor or a customer.

## When it's over

- [ ] IC declares it resolved, and the comms lead posts the final update
- [ ] Scribe copies the timeline out of the Incident log
- [ ] A [[blameless postmortem|doc:documents/Specs/Glossary.md#blameless-postmortem]] within five working days for every SEV1 and SEV2: run `/postmortem`
- [ ] Every action item becomes a ticket with an owner and a priority

The [[places search postmortem|doc:documents/Runbooks/Postmortem%20-%20Places%20search%20latency.md]] is a good example of the whole loop.
