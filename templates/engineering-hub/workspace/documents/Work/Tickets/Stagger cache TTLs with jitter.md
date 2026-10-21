---
status: To do
type: Chore
priority: P1
estimate: 2
sprint: Sprint 15
owner: Sam Okoro
opened: '2026-10-30'
_emoji: ⏳
---

Action item from the [[places search postmortem|doc:documents/Runbooks/Postmortem%20-%20Places%20search%20latency.md]]. The warm-up job writes the most popular searches with the same 15-minute TTL, so they expire in the same second and the misses arrive together.

**Acceptance criteria**

- [ ] TTL = 15 minutes plus a random 0 to 3 minutes per key
- [ ] Alert when Redis memory passes 80% for 10 minutes
- [ ] Alert when evictions pass 100 per second
- [ ] Runbook line added to [[On-call|doc:documents/Runbooks/On-call.md]] for both alerts
