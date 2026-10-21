---
status: In progress
severity: Minor
screen: Diagnosis
source: Stakeholder
reported: '2026-10-27'
_emoji: 🩺
---

From the support lead: support gets angry messages when a plant "diagnosed" with root rot turns out to be fine. The model gives a likely cause with a confidence score, but v2 wrote it up as a verdict ("Your plant has root rot"). Two of six people in usability round 2 said the same thing unprompted.

**Proposed fix:** "This looks like overwatering. Here's how to check." Confidence in plain words, a "how to check" step for every result, and two possible causes side by side when the model isn't sure. Pattern written up in [[Voice and microcopy|doc:documents/System/Voice%20and%20microcopy.md]].

**Component:** [[Photo diagnosis sheet|doc:documents/System/Components/Photo%20diagnosis%20sheet.md]]

- [x] New result pattern drafted
- [ ] Copy approved in the UX copy sheet
