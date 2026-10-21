---
status: Ready for dev
category: Content
platform:
  - iOS
  - Android
  - Web
owner: Mara Lindqvist
reviewed: '2026-10-29'
_emoji: 🪴
---

One plant on Home: photo, name, and the one thing it needs next. Borrowed from garden-centre plant tags (see [[References|doc:documents/Exploration/References.md]]).

**Anatomy**

- Photo, square, with the plant's initial as a fallback
- Name in Headline (serif), botanical name in Caption
- Next care line: icon plus words ("Water today", "Feed in 3 days")
- Icon row: light, water, pet safety

**States**

- Default, pressed, needs care today (Sky dot plus words), overdue (Terracotta dot plus "Overdue"), no photo

**Accessibility**

- The whole card is one target that reads "Monstera, water today"
- Name and care line never sit on top of the photo

**Acceptance criteria**

- [x] Long names wrap to two lines, then truncate with the full name in the accessible label
- [x] Photo crop keeps the name fully visible: fix for [[Plant card photo crops the plant name|doc:documents/Review/Feedback%20log/Plant%20card%20photo%20crops%20the%20plant%20name.md]]
- [ ] Web version uses the same tokens at a 280 px minimum width

**Figma:** paste this component's frame link into the Figma column. To see the live frame here, type `/figma` on the line below and paste the same link.
