---
status: In review
type: Feature
priority: P1
estimate: 3
sprint: Sprint 15
owner: Lena Fischer
pr: https://github.example.com/cobalt-labs/atlas-api/pull/428
opened: '2026-10-20'
_emoji: 🚦
---

When the limiter refuses a request, say so clearly, and tell every client how much budget it has left before it gets there.

**Acceptance criteria**

- [x] `RateLimit-Limit`, `RateLimit-Remaining` and `RateLimit-Reset` on every response
- [x] Refused requests get `429` with `Retry-After` in whole seconds
- [x] Error body: `code: rate_limited`, a human message and a link to the rate-limit docs
- [ ] SDKs (JavaScript, Python) back off on `429` using `Retry-After`

**Review notes**

Tomás asked for a contract test that pins the header names, so a refactor can't silently drop them. Added; waiting on a second approval. Headers ship with shadow mode too, since they are useful even when nothing is refused.
