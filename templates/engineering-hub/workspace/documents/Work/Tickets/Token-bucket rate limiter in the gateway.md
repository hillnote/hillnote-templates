---
status: In progress
type: Feature
priority: P1
estimate: 8
sprint: Sprint 15
owner: Aiko Tanaka
pr: https://github.example.com/cobalt-labs/atlas-api/pull/431
opened: '2026-10-19'
_emoji: 🪣
---

Move rate limiting from the edge into the gateway: one [[token bucket|doc:documents/Specs/Glossary.md#token-bucket]] per API key in Redis, updated by a single Lua script. Design and numbers are in [[RFC-001 Rate limiting|doc:documents/Specs/RFC-001%20Rate%20limiting.md]]; the decision is [[ADR-005|doc:documents/Decisions/ADRs/ADR-005%20Token%20bucket%20rate%20limiting%20in%20the%20gateway.md]].

**Acceptance criteria**

- [x] Lua script takes a token atomically and returns `allowed`, `remaining` and `retry_after`
- [x] Tier rates and bursts read from config, not hard-coded
- [ ] Runs on every request behind `ratelimit.shadow`, logging `would_limit` and never refusing
- [ ] Fails open to an in-memory bucket when Redis is unreachable, with a log line and an alert after five minutes
- [ ] Adds under 2 ms at p99 in staging

**Notes**

The PR is open as a draft. Remaining work is the fail-open path and the staging latency check. Pairing with Sam on Thursday to wire it into the shadow-mode dashboard from [[Shadow-mode metrics for the limiter|doc:documents/Work/Tickets/Shadow-mode%20metrics%20for%20the%20limiter.md]].
