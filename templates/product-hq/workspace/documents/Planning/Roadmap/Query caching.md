---
status: Now
theme: Platform
objective: O1 First screen
team: Platform
reach: 600
impact: 1
confidence: 1.0
effort: 5
start: '2026-10-19'
end: '2026-11-13'
_emoji: ⚡
---

Cache the heaviest dashboard queries and warm them before the Monday-morning peak.

**Evidence**

- [[Monday morning dashboards take 10 seconds to load|doc:documents/Discovery/Feedback/Monday%20morning%20dashboards%20take%2010%20seconds%20to%20load.md]]

**Success:** P95 dashboard load under 2 seconds at peak.

- [x] Profile the 20 slowest queries
- [x] Cache layer behind a flag
- [ ] Warm-up job before 8:00 local time
