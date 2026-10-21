---
stage: Approved
owner: Mara Lindqvist
---

# Project brief: ${app_name} v3

> Make ${app_name} feel like a calm field guide instead of a to-do list that judges you, and make it work for everyone who holds the phone.

:::toc "On this page"
:::

## Background

${app_name} helps people keep their houseplants alive: care reminders, a profile for each plant, and a photo diagnosis when something looks wrong. Version 2 grew one feature at a time, and it shows. Reminders are loud, the home screen is green on green, and the brand green fails contrast for text (3.05:1 on white). There is no dark mode, and large text sizes break half the layouts.

## Problem

People stop trusting the reminders, so they stop acting on them, and then the plant dies anyway. Only 41% of reminders end in a "done" tap. New users quit onboarding before adding a single plant: it asks twelve questions before it shows any value. #onboarding

## Goals

1. **Reminders people act on.** Fewer, kinder, more specific reminders, and a care calendar that shows the week at a glance.
2. **First plant in under a minute.** Onboarding asks only what it needs to send the first useful reminder.
3. **Accessible by default.** WCAG 2.2 AA on every core flow, dark mode, and layouts that hold at the largest text sizes. #accessibility
4. **One calm visual language** across iOS, Android and the shared web components.

## Non-goals

- A new diagnosis model. The engine stays; we redesign how its results read.
- Social features, plant swaps or a community feed.
- A full web redesign beyond the shared components.

## Audience

**The new plant parent** owns one to three plants, bought on impulse, and is quietly scared of killing them. They need one clear thing to do today.

**The collector** owns twenty or more plants and wants the whole week's care on one screen. They forgive density, not ambiguity.

## Constraints

- **Platforms:** iOS and Android ship together. Web shares Button, Text field, Toast, Plant card and Empty state.
- **Accessibility:** text contrast at least ${min_contrast}:1, touch targets at least ${touch_target} pt, Dynamic Type and Android font scaling up to the largest sizes, and never colour alone.
- **Timeline:** eight weeks, engineering handoff in week 7.
- **Honesty:** the diagnosis model gives a confidence score, not a verdict. The copy has to say so.

## Success metrics

| Metric | v2 today | v3 target |
|---|---|---|
| Reminders that end in "done" | 41% | 60% |
| Median time to first plant added | 3 min 10 s | under 60 s |
| Onboarding completion | 54% | 75% |
| Blocker accessibility issues in the audit | 37 | 0 |
| Store rating (last 90 days) | 4.2 | 4.5 |

## Timeline

| Week | Focus |
|---|---|
| 1–2 | Discovery, moodboard, references |
| 3–4 | System: tokens, type, components, copy |
| 5 | Design review and usability round 2 (this week) |
| 6 | Clickable prototype, fixes from round 2 |
| 7 | Handoff to engineering |
| 8 | QA with engineering, release candidate |

## Team

| Who | Role |
|---|---|
| Mara Lindqvist | Design lead, owns this brief |
| Theo Adeyemi | Product designer, system and components |
| Ana Sousa | Content designer, voice and UX copy |
| Jules Moreau | Product manager, metrics and scope |
| Kenji Watanabe | iOS engineer, handoff partner |
| Dani Ruiz | Android engineer, handoff partner |

## How we work

Brief, then [[moodboard|doc:documents/Exploration/Fernway%20moodboard.moodboard.md]], then spec and copy in the System section, then Figma. When we ask Claude to build frames, it reads this brief and the Components database over MCP, so the constraints above come along with every request. Prototypes get tested, findings go into the Feedback log, and the final Figma file is embedded back on this page.

## Design files

No Figma file is linked yet. When the v3 file exists, type `/figma` on the line below this paragraph and paste its link, so the live frames sit right here under the brief.

## Open questions

- [x] Do we keep the leaf logo? Yes, simplified to a single stroke.
- [ ] Does the care calendar replace the home list or sit above it? Decision at Thursday's review.
- [ ] Do Android users get dynamic system colours? Proposal: no, brand colours on both platforms.
