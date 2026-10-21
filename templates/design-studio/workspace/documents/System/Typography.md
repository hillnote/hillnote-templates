---
stage: In review
owner: Theo Adeyemi
---

# Typography

One modular scale for every platform: a ${base_size} px base multiplied by ${scale_ratio} (a major third) for each step. Sizes below are calculated from those two workspace variables, so changing either one updates the whole table.

## Roles

| Role | Size (px) | Weight | Line height | Use |
|---|---|---|---|---|
| Display | ${=round(base_size * scale_ratio * scale_ratio * scale_ratio * scale_ratio, 1)} | Semibold, serif | 1.15 | The plant's name on its profile |
| Title 1 | ${=round(base_size * scale_ratio * scale_ratio * scale_ratio, 1)} | Semibold | 1.2 | Screen titles |
| Title 2 | ${=round(base_size * scale_ratio * scale_ratio, 1)} | Semibold | 1.25 | Section headers, sheet titles |
| Headline | ${=round(base_size * scale_ratio, 1)} | Semibold | 1.3 | Card titles, reminder text |
| Body | ${base_size} | Regular | 1.5 | Everything you read |
| Caption | ${=round(base_size / scale_ratio, 1)} | Regular | 1.4 | Timestamps, helper text |

Rules of thumb:

- Body never goes below ${base_size} px, and captions never below 12 px.
- Two weights only: regular and semibold. Emphasis comes from size and colour, not a third weight.
- Numbers in the care calendar use tabular figures, so the days line up.

## Faces

We use each platform's own UI face: SF Pro on iOS, Roboto on Android and the system UI stack on the web. Plant names get the only serif in the app (New York on iOS, Noto Serif on Android) because a name is the one thing worth slowing down for. A plant's botanical name sits under it in Caption, Ink Muted, italic.

## Large text

Every role maps to a platform text style, so Dynamic Type and Android font scaling work for free. At the largest accessibility sizes:

- The care calendar's week strip turns into a vertical list.
- Tab labels wrap to two lines instead of truncating (see [[Tab labels truncate at the largest text size|doc:documents/Review/Feedback%20log/Tab%20labels%20truncate%20at%20the%20largest%20text%20size.md]]).
- Buttons grow in height, never shrink their text.

## Generate a scale

Try another base or ratio, preview it, and copy the CSS variables for the web components.

[html:Type scale](resources/html/type-scale/index.html)
