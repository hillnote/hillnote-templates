---
status: Done
type: Bug
priority: P3
estimate: 1
sprint: Sprint 14
owner: Lena Fischer
pr: https://github.example.com/cobalt-labs/atlas-api/pull/409
opened: '2026-10-14'
_emoji: 🎲
---

`places_search_pagination_test` failed about one run in twelve on CI. Two places in the fixture had the same distance from the search point, and the sort order between them wasn't defined.

- [x] Tie-break the sort on place ID, in the query and in the test
- [x] Ran the suite 200 times in a loop: no failures

Small, but flaky tests teach people to press "re-run" without reading, and that's how real failures get merged.
