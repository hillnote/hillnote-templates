---
owner: Ravi Menon
---

# Changelog

What changed in ${service}, newest first, written for the developers calling the API. Each line says what changed for *them*, not what we refactored.

Draft each release from the Changelog view of the **Tickets** database: it groups finished tickets by type and adds the PR numbers. Pick the sprint, paste it under a new heading here, then edit every line until a customer would understand it.

[html:Changelog drafter](resources/html/changelog-drafter/index.html)

## Unreleased (v2.14.0)

### Added

- Every response now carries `RateLimit-Limit`, `RateLimit-Remaining` and `RateLimit-Reset` headers, so you can see your remaining budget before you reach it. (#428)

### Fixed

- `GET /v2/geocode` with an empty `q` returns `400 invalid_query` instead of `500`. (#422)

## v2.13.2

### Fixed

- Places search could slow to multi-second responses when popular results left the cache. Concurrent requests for the same search now share one database lookup, and response times stay steady while the cache refills. (#426)

## v2.13.1

### Changed

- Place details include `opening_hours` when we know them. (#418)

## v2.13.0

### Changed

- Database connections are recycled after idle periods, which removes the occasional slow first request after a quiet spell. (#412)

### Fixed

- Places search results with identical distances are now always returned in the same order. (#409)

## How we write it

- **Added** for new endpoints, fields and headers; **Changed** for different behaviour; **Fixed** for bugs; **Docs** for documentation customers will notice.
- Name the endpoint and the field. "Improved performance" says nothing; "places search stays under 300 ms when the cache is cold" says something.
- Security fixes get a line once they have shipped everywhere, not before.
- Internal-only work (metrics, refactors, CI) stays out.
