---
status: Done
type: Feature
priority: P1
estimate: 3
sprint: Sprint 15
owner: Sam Okoro
pr: https://github.example.com/cobalt-labs/atlas-api/pull/424
opened: '2026-10-20'
_emoji: 📈
---

Emit what the limiter *would* have done during [[shadow mode|doc:documents/Specs/Glossary.md#shadow-mode]], so we can see who would be limited before anybody is.

**Acceptance criteria**

- [x] Counter `ratelimit_decisions_total` with labels `tier` and `decision` (`allow`, `would_limit`)
- [x] Dashboard: share of keys that would be limited, per tier, per hour
- [x] Top 20 keys by `would_limit`, so account managers can warn customers early
- [x] Metrics cost checked: under 300 new series

Merged and live. The dashboard shows zeros until the [[limiter|doc:documents/Work/Tickets/Token-bucket%20rate%20limiter%20in%20the%20gateway.md]] starts feeding it.
