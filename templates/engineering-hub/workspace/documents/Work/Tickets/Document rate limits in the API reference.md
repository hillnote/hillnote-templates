---
status: To do
type: Docs
priority: P2
estimate: 2
sprint: Sprint 15
owner: Ravi Menon
opened: '2026-10-27'
_emoji: 📚
---

Customers should know their limit before they hit it, and know what to do when they do.

**Acceptance criteria**

- [ ] New "Rate limits" page: the tier table, the [[token bucket|doc:documents/Specs/Glossary.md#token-bucket]] explained in two sentences, the headers, the `429` body
- [ ] Code samples (curl, JavaScript, Python) that back off on `Retry-After`
- [ ] Every endpoint page links to it
- [ ] Reviewed by Aiko for accuracy against [[RFC-001|doc:documents/Specs/RFC-001%20Rate%20limiting.md]]

Must be live two weeks before enforcement starts for paid tiers.
