---
stage: Approved
owner: Theo Adeyemi
---

# Colors

${app_name} v3 has nine colour tokens. Each one has a job, a light value and a dark value, and every text token clears ${min_contrast}:1 against the background it sits on in both modes.

## Rules

1. **Fern is for action.** Primary buttons, selected states and links. Nothing decorative is Fern.
2. **Terracotta means overdue, and only overdue.** A routine reminder is Sky. If everything is urgent, nothing is (see [[Reminder banner reads as an error|doc:documents/Review/Feedback%20log/Reminder%20banner%20reads%20as%20an%20error.md]]).
3. **Never colour alone.** Every status that has a colour also has an icon and a word.
4. **Text clears ${min_contrast}:1; large text and UI components clear 3:1.** Check new pairs with the contrast checker at the bottom of this page before they reach Figma.
5. **Line is decorative.** Dividers may be faint because they carry no meaning. Borders that show where a control is need 3:1.

## Tokens

Contrast is each token against Paper, measured with the WCAG 2.x formula and cut to two decimals, never rounded up: a pair at 4.499 fails.

| Token | Light | Dark | Use for | Contrast light / dark |
|---|---|---|---|---|
| `paper` | `#FBF8F2` | `#121815` | App background | (background) |
| `surface` | `#FFFFFF` | `#1B231F` | Cards, sheets, the tab bar | (background) |
| `ink` | `#1E2B24` | `#EBEFEA` | Body text, plant names, icons | 13.89 / 15.47 |
| `ink-muted` | `#5A665F` | `#A2ACA6` | Secondary text, captions, timestamps | 5.65 / 7.70 |
| `fern` | `#2F6B4F` | `#7FC49F` | Primary actions, selection, links | 5.93 / 8.82 |
| `fern-tint` | `#E2EEE6` | `#24382D` | Selected chips and rows (with Fern text on top) | Fern on it: 5.27 / 6.13 |
| `sky` | `#2B6A8F` | `#82BEDF` | Water reminders, information | 5.56 / 8.89 |
| `terracotta` | `#A9502B` | `#E89470` | Overdue care, destructive actions | 5.11 / 7.62 |
| `bloom` | `#A8456A` | `#E58BAA` | Small celebrations (a new leaf logged) | 5.31 / 7.37 |
| `line` | `#E3DDD2` | `#2E3833` | Dividers only, never control borders | 1.27 / 1.48 |

On Surface, the light-mode ratios are slightly higher and the dark-mode ones slightly lower; the lowest is Bloom on dark Surface at 6.58:1, still well clear.

**Button text:** white on Fern is 6.29:1; in dark mode, Paper on Fern is 8.82:1.

## Why the green changed

The v2 brand green (`#5DA271`) measured 3.05:1 on white: fine for a large logo, failing for any text or icon that carries meaning. The v3 Fern is darker in light mode and lighter in dark mode, so it passes in both. Dark mode had its own problem: v2's green on a dark surface measured 2.55:1 (see [[Fern green fails contrast in dark mode|doc:documents/Review/Feedback%20log/Fern%20green%20fails%20contrast%20in%20dark%20mode.md]]).

## Check a pair

Paste two hex values. It shows the ratio, which WCAG levels pass, and the nearest text colour that would pass AA.

[html:Contrast checker](resources/html/contrast-checker/index.html)
