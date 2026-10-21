---
status: Proposed
decided: '2026-11-02'
area: Docs
deciders: Ravi Menon, Lena Fischer
_emoji: 📜
---

## Context

The API reference, the JavaScript SDK and the Python SDK are written by hand. They drift: the rate-limit headers from [[Return 429 with Retry-After and RateLimit headers|doc:documents/Work/Tickets/Return%20429%20with%20Retry-After%20and%20RateLimit%20headers.md]] would need three separate updates, and last month the Python SDK shipped without the `language` parameter the API added in the spring.

## Decision (proposed)

We will treat the **OpenAPI document** in the repo as the source of truth. The reference docs and both SDKs are generated from it in CI, and a pull request that changes an endpoint without changing the spec fails the build.

## Consequences

- Docs and SDKs can't drift from the API.
- Generated SDKs are less idiomatic than hand-written ones; we keep a thin hand-written layer for retries and pagination.
- One-off migration: about a week for Ravi and Lena to write the current spec and check it against production traffic.

## Open questions

- [ ] Generate the SDKs on every merge, or on release only?
- [ ] Who reviews spec changes: the endpoint's owner or the docs owner?

To be decided at the Sprint 15 review.
