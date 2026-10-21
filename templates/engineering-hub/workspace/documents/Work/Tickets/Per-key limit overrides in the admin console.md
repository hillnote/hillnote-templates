---
status: Backlog
type: Feature
priority: P2
estimate: 5
sprint: Sprint 16
owner: Lena Fischer
opened: '2026-10-27'
_emoji: 🎛️
---

Let support raise or lower one key's rate and burst without a deploy, for customers with a real reason (a nightly sync, a launch).

**Acceptance criteria**

- [ ] Admin console form: refill rate, burst, expiry date, reason (required)
- [ ] Overrides stored in Postgres and cached by the gateway for at most 60 seconds
- [ ] Every change written to the audit log with who and why
- [ ] Expired overrides fall back to the tier default automatically

Waits on [[Token-bucket rate limiter in the gateway|doc:documents/Work/Tickets/Token-bucket%20rate%20limiter%20in%20the%20gateway.md]]. Open question from [[RFC-001|doc:documents/Specs/RFC-001%20Rate%20limiting.md]]: do Scale customers need more than a 400 burst, or is an override the right answer?
