---
status: Done
type: Bug
priority: P1
estimate: 1
sprint: Sprint 15
owner: Aiko Tanaka
pr: https://github.example.com/cobalt-labs/atlas-api/pull/422
opened: '2026-10-26'
_emoji: 🕳️
---

`GET /v2/geocode?q=` with an empty query returned `500 internal_error` and a stack-trace ID. It should be a client error.

**Steps to reproduce**

1. Call `/v2/geocode?q=` with any valid key
2. Get `500`, and an alert fires if a client loops on it

**Fix**

- [x] Validate `q` at the gateway: empty or whitespace-only returns `400 invalid_query`
- [x] Test for empty, whitespace and 2,000-character queries
- [x] Changelog line under Fixed

One customer's retry loop sent 40,000 of these overnight, which is how we found it.
