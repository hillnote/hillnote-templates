---
owner: Hana Kim
---

# Sprint plan

**Sprint 15** · two weeks · this is week 2 · review and retro on Friday

## Goal

Rate limiting runs in [[shadow mode|doc:documents/Specs/Glossary.md#shadow-mode]] on every request, and places search stays inside its latency SLO.

If something has to give, the goal decides what: anything that doesn't move one of those two halves is the first thing cut.

## Capacity

| Person | Focus this sprint | Days available |
|---|---|---|
| Aiko Tanaka | The limiter, the load test | 9 |
| Lena Fischer | Rate-limit headers, admin console prep | 9 |
| Tomás Reyes | Tech lead, the cursor fix, reviews | 7 |
| Sam Okoro | SRE, on-call in week 1 | 6 |
| Ravi Menon | Rate-limit docs, SDK backoff | 8 |
| Hana Kim | Product; not counted in capacity | 0 |

39 engineer-days at our running average of 0.7 points a day is about 27 points. We committed 22 at planning and kept 5 for interruptions.

## Committed at planning (22 points)

- [[Token-bucket rate limiter in the gateway|doc:documents/Work/Tickets/Token-bucket%20rate%20limiter%20in%20the%20gateway.md]] (8)
- [[Return 429 with Retry-After and RateLimit headers|doc:documents/Work/Tickets/Return%20429%20with%20Retry-After%20and%20RateLimit%20headers.md]] (3)
- [[Shadow-mode metrics for the limiter|doc:documents/Work/Tickets/Shadow-mode%20metrics%20for%20the%20limiter.md]] (3)
- [[Pagination cursor accepted across API keys|doc:documents/Work/Tickets/Pagination%20cursor%20accepted%20across%20API%20keys.md]] (2)
- [[Geocode returns 500 on an empty query|doc:documents/Work/Tickets/Geocode%20returns%20500%20on%20an%20empty%20query.md]] (1)
- [[Document rate limits in the API reference|doc:documents/Work/Tickets/Document%20rate%20limits%20in%20the%20API%20reference.md]] (2)
- [[Load test the limiter at 3x peak|doc:documents/Work/Tickets/Load%20test%20the%20limiter%20at%203x%20peak.md]] (3)

## Added mid-sprint (5 points)

- [[Places search p99 spikes after cache eviction|doc:documents/Work/Tickets/Places%20search%20p99%20spikes%20after%20cache%20eviction.md]] (3), the incident on Wednesday of week 1
- [[Stagger cache TTLs with jitter|doc:documents/Work/Tickets/Stagger%20cache%20TTLs%20with%20jitter.md]] (2), its follow-up

That used the whole interruption buffer, which is what it is for.

## Mid-sprint check

- **On track:** headers in review, shadow-mode metrics merged, geocode fix shipped.
- **At risk:** the limiter is a day behind because Aiko spent a day on the incident. The load test moves to Sprint 16 if the limiter isn't in review by Wednesday.
- **Watch:** the cursor fix needs a second security reviewer. Lena has offered.

## Risks

- Shadow-mode logging volume. Sam has capped the new series at 300; if it costs more, we sample at 10%.
- Docs must be live two weeks before paid tiers are enforced, so they can't slip into Sprint 16.

## The board

[database:Tickets](documents/Work/Tickets)
