---
status: Exploring
category: Content
platform:
  - iOS
  - Android
owner: Mara Lindqvist
reviewed: '2026-10-27'
_emoji: 🔍
---

The sheet that slides up after a plant photo is analysed. The model stays the same in v3; how its answer reads is what we're redesigning.

**Anatomy**

- The photo with up to three labelled call-outs ("yellowing starts at the lower leaves")
- Likely cause in Title 2, confidence in plain words ("fairly sure", "not sure")
- "How to check" steps, then one thing to do today
- A quiet "Not it? Try another photo" link

**States**

- Result, low confidence (two possible causes, side by side), no result (photo unreadable), loading

**Accessibility**

- Call-outs are listed as text below the photo too
- Confidence is words, never a percentage alone or a coloured meter alone

**Acceptance criteria**

- [ ] Copy says "looks like", never a verdict: fix for [[Diagnosis result sounds too certain|doc:documents/Review/Feedback%20log/Diagnosis%20result%20sounds%20too%20certain.md]]
- [ ] Every result has a "how to check" step
- [ ] Error copy for unreadable photos approved in the UX copy sheet

**Figma:** paste this component's frame link into the Figma column. To see the live frame here, type `/figma` on the line below and paste the same link.
