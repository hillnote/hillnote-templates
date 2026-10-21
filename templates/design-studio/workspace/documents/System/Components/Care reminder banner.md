---
status: In design
category: Feedback
platform:
  - iOS
  - Android
owner: Theo Adeyemi
reviewed: '2026-10-30'
_emoji: 💧
---

The banner at the top of Home when something needs care today. It's the heart of goal 1 in the [[Project brief|doc:documents/Briefs/Project%20brief.md]]: reminders people act on.

**Anatomy**

- Icon (drop for water, leaf for feeding), plant name and the care in one sentence
- "Done" as the largest target, "Snooze" as a quiet button with three choices

**States**

- Routine (Sky), overdue (Terracotta with the word "Overdue"), done (collapses with a one-line toast), snoozed

**Accessibility**

- Colour is never the only signal: icon plus words in every state
- "Done" is reachable with one thumb at the bottom of the banner

**Acceptance criteria**

- [x] Copy follows [[Voice and microcopy|doc:documents/System/Voice%20and%20microcopy.md]]: no guilt, no exclamation marks
- [ ] Sky for routine reminders, Terracotta only when overdue: fix for [[Reminder banner reads as an error|doc:documents/Review/Feedback%20log/Reminder%20banner%20reads%20as%20an%20error.md]]
- [ ] Three snooze choices: this evening, tomorrow morning, in 2 days (see [[Too many snooze options|doc:documents/Review/Feedback%20log/Too%20many%20snooze%20options.md]])
- [ ] Retest with three people in week 6

**Figma:** paste this component's frame link into the Figma column. To see the live frame here, type `/figma` on the line below and paste the same link.
