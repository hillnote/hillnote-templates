---
status: In design
category: Content
platform:
  - iOS
  - Android
owner: Mara Lindqvist
reviewed: '2026-11-02'
_emoji: 📅
---

A seven-day strip at the top of the Calendar tab, with a month view behind it, showing what each plant needs and when. Built for the collector; the new plant parent should never need it. The strip comes from weather apps' hourly view (see [[References|doc:documents/Exploration/References.md]]).

**Anatomy**

- Day header: weekday initial and day number in tabular figures
- Care marks: a drop icon in Sky for water, a leaf icon in Fern for feeding, each with a count
- Today marker: a Fern ring, announced as "Today"
- Week and Month switch: the [[Segmented control|doc:documents/System/Components/Segmented%20control.md]]

**States**

- Default, today, selected day, overdue (Terracotta outline and the word "Overdue"), nothing due

**Accessibility**

- Watering and feeding differ by icon and label, not only colour: fix for [[Can't tell watering from feeding in the calendar|doc:documents/Review/Feedback%20log/Can%27t%20tell%20watering%20from%20feeding%20in%20the%20calendar.md]]
- Screen readers read each day as weekday, then the care due ("water the monstera and the fern")
- At the largest text sizes the strip becomes a vertical list

**Acceptance criteria**

- [x] Week strip scrolls sideways; tapping a day opens its list
- [ ] Icons and labels for every care type
- [ ] Vertical list layout at accessibility sizes
- [ ] Decision at Thursday's review: does it replace the home list or sit above it?

**Figma:** paste this component's frame link into the Figma column. To see the live frame here, type `/figma` on the line below and paste the same link.
