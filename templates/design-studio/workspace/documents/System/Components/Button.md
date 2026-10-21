---
status: Shipped
category: Action
platform:
  - iOS
  - Android
  - Web
owner: Theo Adeyemi
reviewed: '2026-10-12'
_emoji: 🔘
---

The one way to trigger an action. Three variants, one height per size, and the label always says what happens.

**Anatomy**

- Container: Fern fill (primary), Surface with a Fern border (secondary), or no container (quiet)
- Label: Headline role, sentence case, verb first, at most 18 characters
- Optional leading icon, never an icon on its own without a label or an accessible name

**States**

- Default, pressed, focused, disabled, loading (spinner replaces the label, width stays the same)

**Accessibility**

- Minimum touch target from the [[Design QA checklist|doc:documents/Review/Design%20QA%20checklist.md]], even for the quiet variant
- White on Fern is 6.29:1; in dark mode, Paper on Fern is 8.82:1 (see [[Colors|doc:documents/System/Colors.md]])
- Focus ring visible on web and with a keyboard on tablets

**Acceptance criteria**

- [x] One primary button per screen
- [x] Destructive actions use the secondary variant with Terracotta text, plus a confirmation
- [x] Label never truncates; the button grows taller at large text sizes
- [x] Shipped on iOS, Android and the web

**Figma:** paste this component's frame link into the Figma column. To see the live frame here, type `/figma` on the line below and paste the same link.
