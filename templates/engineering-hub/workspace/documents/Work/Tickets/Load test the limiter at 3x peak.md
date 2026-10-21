---
status: To do
type: Chore
priority: P1
estimate: 3
sprint: Sprint 15
owner: Aiko Tanaka
opened: '2026-10-27'
_emoji: 🏋️
---

Prove the limiter holds at three times peak traffic, ${=peak_rps * 3} requests per second, before it refuses anything for real.

**Acceptance criteria**

- [ ] Replay a recorded weekday-lunch traffic mix at 1x, 2x and 3x peak against staging
- [ ] Limiter p99 under 2 ms at 3x; Redis CPU under 50%
- [ ] Kill the limiter's Redis mid-test: the gateway fails open within one second
- [ ] Results written up under "Load test" in [[RFC-001|doc:documents/Specs/RFC-001%20Rate%20limiting.md]]

At risk this sprint: if [[Token-bucket rate limiter in the gateway|doc:documents/Work/Tickets/Token-bucket%20rate%20limiter%20in%20the%20gateway.md]] isn't in review by Wednesday, this moves to Sprint 16.
