---
status: In progress
type: Bug
priority: P1
estimate: 2
sprint: Sprint 15
owner: Tomás Reyes
opened: '2026-10-29'
_emoji: 🔐
---

A [[cursor|doc:documents/Specs/Glossary.md#cursor]] created by one API key is accepted by another key of a *different* tenant. The second key gets the next page of the first key's results. Found in code review, not in the wild: access logs for the last 90 days show no cross-tenant cursor use.

**Acceptance criteria**

- [ ] Cursors are signed (HMAC) and carry the tenant ID they were issued to
- [ ] A cursor used by another tenant returns `400 invalid_cursor`
- [ ] Old unsigned cursors keep working for 24 hours, then are refused
- [ ] Security review sign-off from Tomás and one other engineer

Treated as a security fix: no public changelog line until it ships, then a short note under Fixed. Pagination rules are in [[ADR-003|doc:documents/Decisions/ADRs/ADR-003%20Cursor-based%20pagination%20for%20list%20endpoints.md]].
