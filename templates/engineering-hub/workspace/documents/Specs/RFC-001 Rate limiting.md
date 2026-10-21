---
stage: Accepted
owner: Aiko Tanaka
---

# RFC-001: Rate limiting in the gateway

> Replace the edge's fixed-window limit with a per-key [[token bucket|doc:documents/Specs/Glossary.md#token-bucket]] in the gateway, so one busy customer can't slow ${service} down for everyone else.

**Author:** Aiko Tanaka · **Reviewers:** Tomás Reyes, Sam Okoro, Ravi Menon · **Decision:** [[ADR-005|doc:documents/Decisions/ADRs/ADR-005%20Token%20bucket%20rate%20limiting%20in%20the%20gateway.md]]

:::toc "On this page"
:::

## Summary

Every request takes one token from its API key's bucket. A bucket holds up to **${burst} tokens** (the [[burst|doc:documents/Specs/Glossary.md#burst]]) and refills at **${default_limit} tokens per second** on the Standard tier. An empty bucket means `429 Too Many Requests` with a `Retry-After` header. The buckets live in Redis and are updated atomically by one Lua script, so the limit holds across every gateway instance.

## Motivation

- In Sprint 13 one free-tier key ran a backfill at 900 requests per second for forty minutes. Places search p99 tripled for every other customer.
- The current limit ([[ADR-002|doc:documents/Decisions/ADRs/ADR-002%20Fixed-window%20rate%20limiting%20at%20the%20edge.md]]) is a fixed one-minute window counted separately on each edge node. A client can send twice its limit across a window boundary, and a client spread across edge nodes is barely limited at all.
- Customers can't see their limit until they hit it. Three support tickets last month asked "what is my rate limit?"

## Goals and non-goals

**Goals**

- One global limit per API key, accurate to within a few percent across all gateway instances.
- Short bursts are fine; sustained overload is not.
- Clients can see their remaining budget on every response.
- The limiter adds less than 2 ms at p99.

**Non-goals**

- Quotas per month (that's billing, not limiting).
- Limits per endpoint. One bucket per key for now; we revisit if search and geocode need different costs.
- Blocking abuse by IP address. The edge keeps doing that.

## Design

### Tiers

| Tier | Refill (requests per second) | Burst |
|---|---|---|
| Free | 10 | 20 |
| Standard | ${default_limit} | ${burst} |
| Scale | 200 | 400 |

A Standard key can sustain ${=default_limit * 60} requests a minute, and an empty bucket is full again after ${=burst / default_limit} seconds of rest. Per-key overrides come later, in the [[admin console|doc:documents/Work/Tickets/Per-key%20limit%20overrides%20in%20the%20admin%20console.md]].

### The algorithm

```text
on request(key):
  bucket = redis.eval(TAKE_TOKEN, key, now, refill_rate, capacity)
  # TAKE_TOKEN: tokens = min(capacity, tokens + (now - updated_at) * refill_rate)
  #             if tokens >= 1: tokens -= 1, allowed = true
  #             else: allowed = false, retry_after = (1 - tokens) / refill_rate
  if bucket.allowed: forward the request
  else: return 429 with Retry-After = ceil(bucket.retry_after)
```

The script reads and writes one hash per key with a TTL of ten minutes, so idle keys cost nothing.

### Response headers

Every response carries the draft-standard headers, so well-behaved clients can slow down before they are refused:

```http
RateLimit-Limit: 50
RateLimit-Remaining: 37
RateLimit-Reset: 1
```

A refused request gets `429`, `Retry-After` in whole seconds and an error body with `code: rate_limited` and a link to the docs. Details in [[Return 429 with Retry-After and RateLimit headers|doc:documents/Work/Tickets/Return%20429%20with%20Retry-After%20and%20RateLimit%20headers.md]].

### When Redis is down

The limiter **fails open**: each gateway instance falls back to an in-memory bucket per key at the same rates divided by the number of instances. We would rather let a few extra requests through than refuse every request because of the limiter. The fallback is logged and alerts the on-call engineer after five minutes.

## Alternatives considered

| Option | Why not |
|---|---|
| Keep the fixed window, count it in Redis | Still allows double the limit across a window boundary |
| Sliding log of timestamps per key | Exact, but stores one entry per request: about 30 MB of Redis at peak |
| Leaky bucket that queues requests | Adds latency instead of refusing; clients can't tell they are over |
| Buy limiting from the edge provider | Per-node counting is the problem we have today; no per-key tiers |

## Rollout

1. **Shadow mode** (Sprint 15): the limiter decides for every request and logs `would_limit`, but never refuses. Flag `ratelimit.shadow`. Metrics from [[Shadow-mode metrics for the limiter|doc:documents/Work/Tickets/Shadow-mode%20metrics%20for%20the%20limiter.md]].
2. **Load test** at ${=peak_rps * 3} requests per second ([[Load test the limiter at 3x peak|doc:documents/Work/Tickets/Load%20test%20the%20limiter%20at%203x%20peak.md]]).
3. **Enforce the free tier** (Sprint 16), once a week of shadow data shows fewer than 0.5% of free keys would be limited on a normal day.
4. **Enforce every tier** two weeks after customers get an email and the [[updated docs|doc:documents/Work/Tickets/Document%20rate%20limits%20in%20the%20API%20reference.md]].

Rollback at every step is flipping the flag back.

## Success metrics

- Places search p99 stays under its SLO while any single key is at its limit.
- Fewer than 1% of Standard keys see a `429` in a normal week.
- Zero "what is my rate limit?" tickets a month after launch.

## Open questions

- [x] Do retries after a `429` count against the bucket? Yes. Clients that retry in a tight loop stay limited, and `Retry-After` tells them how long to wait.
- [x] Fail open or closed when Redis is down? Open, with the local fallback above.
- [ ] Should batch geocoding cost one token per address instead of one per request?
- [ ] Do Scale customers need a burst above 400 for nightly syncs?

## Tickets

- [[Token-bucket rate limiter in the gateway|doc:documents/Work/Tickets/Token-bucket%20rate%20limiter%20in%20the%20gateway.md]]
- [[Return 429 with Retry-After and RateLimit headers|doc:documents/Work/Tickets/Return%20429%20with%20Retry-After%20and%20RateLimit%20headers.md]]
- [[Shadow-mode metrics for the limiter|doc:documents/Work/Tickets/Shadow-mode%20metrics%20for%20the%20limiter.md]]
- [[Load test the limiter at 3x peak|doc:documents/Work/Tickets/Load%20test%20the%20limiter%20at%203x%20peak.md]]
- [[Document rate limits in the API reference|doc:documents/Work/Tickets/Document%20rate%20limits%20in%20the%20API%20reference.md]]
- [[Per-key limit overrides in the admin console|doc:documents/Work/Tickets/Per-key%20limit%20overrides%20in%20the%20admin%20console.md]]
