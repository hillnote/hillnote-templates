---
status: In progress
severity: Major
screen: Home
source: Usability test
reported: '2026-10-28'
_emoji: 🚨
---

> "I thought the orange bar meant I'd already killed it."

Participant 3, usability round 2. Four of six people read the Terracotta reminder banner as an error message, and two hesitated before tapping "Done" because they expected bad news.

**Why it happens:** v3 used Terracotta for every reminder. Terracotta is our warning colour, so a routine "water today" looked like an alarm.

**Proposed fix:** Sky for routine care, Terracotta only once something is overdue, always with the word "Overdue". The rule is now on [[Colors|doc:documents/System/Colors.md]].

**Component:** [[Care reminder banner|doc:documents/System/Components/Care%20reminder%20banner.md]]

- [x] Rule added to Colors
- [x] Banner states redrawn in Figma
- [ ] Retest with three people in week 6
