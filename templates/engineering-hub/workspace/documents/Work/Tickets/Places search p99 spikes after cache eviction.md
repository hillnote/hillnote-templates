---
status: Done
type: Bug
priority: P0
estimate: 3
sprint: Sprint 15
owner: Sam Okoro
pr: https://github.example.com/cobalt-labs/atlas-api/pull/426
opened: '2026-10-28'
_emoji: 🔥
---

Places search p99 went from 180 ms to 2.4 s for 38 minutes after popular results were evicted from the Redis cache and every miss went to PostGIS at once: a [[cache stampede|doc:documents/Specs/Glossary.md#cache-stampede]]. Full story in the [[postmortem|doc:documents/Runbooks/Postmortem%20-%20Places%20search%20latency.md]].

**Fix (hotfix v2.13.2)**

- [x] Concurrent misses for the same search key share one database lookup (single-flight)
- [x] Place payloads in the cache trimmed back to the fields search needs
- [x] Cache node scaled to the next size up, so memory sits under 60% at peak

**Verification**

Replayed the incident's traffic in staging with the cache flushed: p99 peaked at 410 ms and recovered in under two minutes. Follow-up work is in [[Stagger cache TTLs with jitter|doc:documents/Work/Tickets/Stagger%20cache%20TTLs%20with%20jitter.md]].
