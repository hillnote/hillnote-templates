# Design QA checklist

Run this on a screen before its components move to **Ready for dev**, and again in week 8 on the build. Tick what passes; anything that fails becomes a row in the Feedback log with a screen and a severity.

The ticks below are the onboarding flow's pass in week 5.

## Layout

- [x] Spacing follows the 4 px grid; no one-off values
- [x] Content is readable at the smallest supported phone width
- [x] Safe areas respected on every edge, including the home indicator
- [ ] Landscape on tablets doesn't stretch text lines past roughly 70 characters

## Type

- [x] Only roles from [[Typography|doc:documents/System/Typography.md]], no one-off sizes
- [x] Body text at least ${base_size} px, captions at least 12 px
- [ ] Holds at the largest Dynamic Type and Android font scale (wraps, never truncates)

## Colour and contrast

- [x] Text clears ${min_contrast}:1 against its background, in light and dark mode
- [x] Icons and control borders that carry meaning clear 3:1
- [x] No status is shown by colour alone
- [x] Terracotta appears only for overdue care or destructive actions

## States

- [x] Default, pressed, focused, disabled and loading designed for every control
- [x] Empty, error and offline states designed for every screen
- [ ] Long plant names (40 characters) and missing photos tested

## Motion

- [x] Nothing moves without a reason; transitions under 300 ms
- [x] Reduce Motion replaces slides with fades

## Copy

- [x] Every string is in the UX copy sheet with a limit, and fits it
- [x] Follows [[Voice and microcopy|doc:documents/System/Voice%20and%20microcopy.md]]: no exclamation marks, no guilt
- [ ] Reviewed by Ana and marked Approved

## Accessibility

- [x] Touch targets at least ${touch_target} × ${touch_target} pt
- [x] Every image and icon button has a label; decorative images are hidden from screen readers
- [x] Reading order matches visual order
- [ ] VoiceOver and TalkBack walkthrough recorded

## Platform parity

- [x] iOS and Android differ only where the platform expects it (navigation, sheets, dates)
- [x] Shared web components match the mobile tokens

## Handoff

- [x] Frames named after the Components database rows
- [x] Each component's Figma link pasted into its row
- [ ] Redlines only where tokens don't already say it
- [ ] Open Feedback log rows for this screen are resolved or accepted
