---
status: Accepted
decided: '2026-10-23'
area: API
deciders: Aiko Tanaka, Tomás Reyes, Sam Okoro
_emoji: 🧮
---

Supersedes [[ADR-002 Fixed-window rate limiting at the edge|doc:documents/Decisions/ADRs/ADR-002%20Fixed-window%20rate%20limiting%20at%20the%20edge.md]]. Proposed in [[RFC-001 Rate limiting|doc:documents/Specs/RFC-001%20Rate%20limiting.md]].

## Context

The fixed window at the edge allows bursts of double the limit, counts per edge node, and gives clients no feedback. One free-tier backfill tripled places search p99 for every other customer.

## Decision

We will rate-limit in the gateway with one [[token bucket|doc:documents/Specs/Glossary.md#token-bucket]] per API key, stored in Redis and updated atomically by a Lua script. Standard keys refill at ${default_limit} requests per second with a [[burst|doc:documents/Specs/Glossary.md#burst]] of ${burst}. Every response carries `RateLimit-*` headers, and refused requests get `429` with `Retry-After`. If Redis is unreachable, the limiter fails open to a local in-memory bucket. The rollout starts in [[shadow mode|doc:documents/Specs/Glossary.md#shadow-mode]].

## Consequences

- One accurate limit per key across every gateway instance.
- Clients see their budget on every response and can slow down before they are refused.
- Another Redis dependency on the request path. Failing open means an outage of the limiter's Redis lets traffic through unlimited until it recovers. We accept that over refusing everyone.
- About 1 ms added to every request.

## Follow-up

[[Token-bucket rate limiter in the gateway|doc:documents/Work/Tickets/Token-bucket%20rate%20limiter%20in%20the%20gateway.md]], [[Return 429 with Retry-After and RateLimit headers|doc:documents/Work/Tickets/Return%20429%20with%20Retry-After%20and%20RateLimit%20headers.md]], [[Shadow-mode metrics for the limiter|doc:documents/Work/Tickets/Shadow-mode%20metrics%20for%20the%20limiter.md]], [[Load test the limiter at 3x peak|doc:documents/Work/Tickets/Load%20test%20the%20limiter%20at%203x%20peak.md]], [[Document rate limits in the API reference|doc:documents/Work/Tickets/Document%20rate%20limits%20in%20the%20API%20reference.md]].
