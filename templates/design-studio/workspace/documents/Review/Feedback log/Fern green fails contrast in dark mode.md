---
status: Resolved
severity: Blocker
screen: Plant profile
source: Design crit
reported: '2026-10-16'
_emoji: 🌙
---

The first dark-mode pass reused the light-mode Fern (`#2F6B4F`) for links and selected states. On the dark Surface it measured 2.55:1, far below the 4.5:1 our text needs.

**Fix:** a separate dark value for Fern (`#7FC49F`), 7.88:1 on the dark Surface. Every token now has a light and a dark value, with ratios listed on [[Colors|doc:documents/System/Colors.md]].

- [x] Dark values for all nine tokens
- [x] Contrast re-checked with the contrast checker
