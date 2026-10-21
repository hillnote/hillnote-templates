---
status: Shipped
category: Input
platform:
  - iOS
  - Android
  - Web
owner: Theo Adeyemi
reviewed: '2026-10-05'
_emoji: ⌨️
---

Single-line input for plant names, locations and notes.

**Anatomy**

- Label above the field (never a placeholder pretending to be a label)
- Field with a 1 px border in Ink Muted, 3:1 against Surface
- Helper text or error below, in Caption

**States**

- Empty, focused, filled, error, disabled

**Accessibility**

- The error message is announced and says how to fix it ("Give your plant a name, even a silly one")
- Errors are shown with an icon and text, not only a red border

**Acceptance criteria**

- [x] Plant names up to 40 characters without clipping
- [x] Clear button appears once there is text
- [x] Errors follow [[Voice and microcopy|doc:documents/System/Voice%20and%20microcopy.md]]

**Figma:** paste this component's frame link into the Figma column. To see the live frame here, type `/figma` on the line below and paste the same link.
