---
status: Ready for dev
category: Input
platform:
  - iOS
  - Android
owner: Theo Adeyemi
reviewed: '2026-10-26'
_emoji: 🎚️
---

Switches between two to four views of the same content, like Week and Month on the care calendar.

**Anatomy**

- Track in Fern Tint, selected segment in Surface with Fern text
- Labels in Body, one or two words each

**States**

- Default, selected, pressed, disabled

**Accessibility**

- Selected segment is marked by weight and a container, not colour alone
- Screen readers announce "Week, selected, 1 of 2"
- At the largest text sizes it becomes a list of two options

**Acceptance criteria**

- [x] Used on the [[Watering calendar|doc:documents/System/Components/Watering%20calendar.md]] (Week and Month)
- [x] Fern on Fern Tint measured at 5.27:1
- [ ] Android uses the platform's own segmented buttons with our tokens

**Figma:** paste this component's frame link into the Figma column. To see the live frame here, type `/figma` on the line below and paste the same link.
