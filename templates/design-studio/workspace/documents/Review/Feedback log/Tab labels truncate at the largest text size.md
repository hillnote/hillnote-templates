---
status: Open
severity: Major
screen: Home
source: Engineering
reported: '2026-11-02'
_emoji: 🔠
---

Kenji found it on a device test: at the largest accessibility text size, "Diagnose" becomes "Diag…" and "Calendar" becomes "Cale…". Truncated navigation is a fail for anyone who needs large text.

**Repro:** iOS, Settings → Accessibility → Larger Text, largest size, open Home.

**Proposed fix:** let labels wrap to two lines and let the bar grow taller, as the platform's own apps do. Never shrink the text to fit.

**Component:** [[Bottom tab bar|doc:documents/System/Components/Bottom%20tab%20bar.md]]

- [ ] Draw the two-line state
- [ ] Check Android at 200% font scale
