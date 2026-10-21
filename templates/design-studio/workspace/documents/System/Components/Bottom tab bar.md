---
status: Shipped
category: Navigation
platform:
  - iOS
  - Android
owner: Mara Lindqvist
reviewed: '2026-09-28'
_emoji: 🧭
---

Top-level navigation: Home, Calendar, Diagnose and Profile. Four tabs, no more.

**Anatomy**

- Surface background with a Line divider above it
- Icon plus label for every tab; the selected tab gets Fern and semibold

**States**

- Default, selected, pressed, with badge (a small dot for overdue care, never a number)

**Accessibility**

- Labels are always visible, never icon-only
- At the largest text sizes, labels wrap to two lines instead of truncating

**Acceptance criteria**

- [x] Four tabs on both platforms
- [x] Selected state readable in light and dark mode
- [ ] Wrapping labels at the largest sizes: fix for [[Tab labels truncate at the largest text size|doc:documents/Review/Feedback%20log/Tab%20labels%20truncate%20at%20the%20largest%20text%20size.md]]

**Figma:** paste this component's frame link into the Figma column. To see the live frame here, type `/figma` on the line below and paste the same link.
