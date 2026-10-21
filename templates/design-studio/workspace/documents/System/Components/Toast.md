---
status: Shipped
category: Feedback
platform:
  - iOS
  - Android
  - Web
owner: Theo Adeyemi
reviewed: '2026-09-30'
_emoji: 💬
---

A short confirmation after an action, with an undo when the action can be undone.

**Anatomy**

- Ink background with Paper text (inverted), one line, at most 40 characters
- Optional "Undo" action in Fern Tint text

**States**

- Appearing, visible (4 seconds, 8 with an action), dismissed

**Accessibility**

- Announced politely to screen readers, never steals focus
- Nothing important lives only in a toast: it confirms, it doesn't inform

**Acceptance criteria**

- [x] "Watered. Next drink in 6 days." fits on the smallest phone
- [x] Pauses while touched or focused
- [x] Respects Reduce Motion (fades instead of sliding)

**Figma:** paste this component's frame link into the Figma column. To see the live frame here, type `/figma` on the line below and paste the same link.
