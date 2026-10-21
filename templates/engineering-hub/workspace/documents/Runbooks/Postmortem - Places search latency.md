---
stage: Accepted
owner: Sam Okoro
---

# Postmortem: places search latency

> For 38 minutes, places search answered slowly or not at all for a share of requests, because popular results fell out of the cache together and every miss went to the database at once. Nobody did anything wrong; the system let a small change become a big one.

**Severity:** SEV2 · **Incident commander:** Sam Okoro · **Ops lead:** Aiko Tanaka · **Comms:** Ravi Menon · **Scribe:** Lena Fischer

:::toc "On this page"
:::

## Summary

A release that added opening hours to cached place details made each cache entry about 60% bigger. Over the next three hours the Redis cache filled up and began evicting the most popular search results. Those results had all been written with the same TTL by the warm-up job, so many expired together too. Thousands of identical misses reached PostGIS at once (a [[cache stampede|doc:documents/Specs/Glossary.md#cache-stampede]]), the connection pool saturated, and places search p99 rose from 180 ms to 2.4 s. Rolling back the release and scaling the cache ended it.

## Impact

- **Duration:** 38 minutes from the first alert to recovery
- **Places search p99:** 2.4 s at worst, against a 300 ms SLO
- **Failed requests:** 0.6% of places search requests timed out with `504`
- **Customers:** 1,140 API keys saw at least one timeout; four support tickets
- **Error budget:** 31% of the month's latency budget for places search; availability budget barely touched
- **Geocode:** unaffected

## Timeline

Times are offsets from the first alert (T+0).

| Time | What happened |
|---|---|
| T-3h | v2.13.1 deployed, with `opening_hours` on place details. The canary passed: memory grows slowly, so 15 minutes showed nothing. |
| T-40m | Redis memory reaches its limit and starts evicting keys. No alert exists for this. |
| T+0 | p99 alert for places search fires. Sam is paged. |
| T+4m | Sam acknowledges, opens the incident channel, declares SEV2 and takes IC. |
| T+9m | Aiko joins as ops lead; Ravi posts "Investigating" on the status page. |
| T+14m | Postgres CPU at 96%, connection pool full, Redis evictions at 2,300 a second. |
| T+18m | Aiko notices the cache keys missing are all the popular searches, and they share one TTL. |
| T+21m | Decision: roll back v2.13.1 to shrink entries, and scale the cache node up one size. |
| T+27m | Rollback complete. Evictions stop. |
| T+33m | p99 back under 300 ms as the cache refills. |
| T+38m | Sam declares resolved. Ravi posts the final update. |
| T+2h | Hotfix v2.13.2 ships single-flight lookups and trimmed payloads, and `opening_hours` returns. |

## Root cause and the five whys

1. **Why was search slow?** Postgres was saturated by identical search queries.
2. **Why were there so many identical queries?** Popular results were missing from the cache, and every concurrent miss queried the database separately.
3. **Why were they missing?** Redis was full and evicting, and the warm-up job had given them all the same TTL, so they also expired together.
4. **Why was Redis full?** v2.13.1 made each cached place about 60% bigger, and nothing checked memory headroom for a change in payload size.
5. **Why didn't we catch it before customers did?** The canary watches for 15 minutes; this took three hours. And there was no alert on cache memory or evictions.

The root cause is a system one: the cache had no protection against concurrent misses and no alert on its own health, so a reasonable change to a payload was enough to take search past its SLO.

## What went well

- Paged to acknowledged in 4 minutes; roles were clear within 10.
- The scribe's timeline made this write-up quick and accurate.
- The rollback was safe and fast, because migrations are backwards compatible ([[ADR-004|doc:documents/Decisions/ADRs/ADR-004%20Canary%20deploys%20with%20automatic%20rollback.md]]).

## What went poorly

- 18 minutes to look at the cache, because the first alert pointed at the database.
- The status page said "investigating" for 20 minutes with no new detail.
- We had to scale the cache by hand, mid-incident.

## Where we got lucky

- It happened in working hours, with three people online.
- Geocode doesn't use the places cache, so most customers never noticed.

## Action items

| Action | Owner | Priority | Ticket |
|---|---|---|---|
| Single-flight lookups for places search | Sam Okoro | P0 | Done |
| TTL jitter, plus alerts on Redis memory and evictions | Sam Okoro | P1 | To do |
| Add cache memory to the canary's checks for releases that change cached payloads | Aiko Tanaka | P2 | To be ticketed |
| Status page template with a "what we know" line | Ravi Menon | P3 | To be ticketed |

**Pages:** [[Done|doc:documents/Work/Tickets/Places%20search%20p99%20spikes%20after%20cache%20eviction.md]] · [[To do|doc:documents/Work/Tickets/Stagger%20cache%20TTLs%20with%20jitter.md]]

Discussed at the Sprint 15 review. Linked from the [[Changelog|doc:documents/Runbooks/Changelog.md]] entry for v2.13.2.
