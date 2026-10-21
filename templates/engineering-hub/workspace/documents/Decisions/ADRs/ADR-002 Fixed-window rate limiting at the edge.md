---
status: Superseded
decided: '2026-09-29'
area: API
deciders: Aiko Tanaka, Sam Okoro
_emoji: 🧱
---

**Superseded by [[ADR-005 Token bucket rate limiting in the gateway|doc:documents/Decisions/ADRs/ADR-005%20Token%20bucket%20rate%20limiting%20in%20the%20gateway.md]].**

## Context

Free-tier keys were sending bursts that slowed paid traffic. We needed a limit quickly, and the edge provider offered rate limiting with no code on our side.

## Decision

We will limit each API key to a fixed number of requests per one-minute window, enforced by the edge provider: 600 a minute for free keys, 3,000 for Standard.

## Consequences

- Shipped in a day, and stopped the worst bursts.
- Each edge node counts separately, so a client spread across nodes is barely limited.
- A client can send double its limit across a window boundary (the end of one minute plus the start of the next).
- Clients get no headers and can't see their budget.

These costs are why [[RFC-001|doc:documents/Specs/RFC-001%20Rate%20limiting.md]] proposed moving limiting into the gateway.
