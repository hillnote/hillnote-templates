---
title: Slides
status: To Do
description: Create your first slide and explore all the attached features. Click to learn more.
priority: Low
_emoji: 🥝
---

# Slides

The slideshow below should help explain 🥳  
Slides are markdown rendered as slides with some special syntax to help define layouts.

## Ask AI to create a slideshow on a topic

You can always ask AI to build a slide deck via MCP or directly on the workspace files (there is enough context for the model to know how to write a deck).

## Hillnote ships with a Slide editor to build slides

The slide editor allows you to add new slides, insert images, define columns and more.  
![Pasted image](resources/images/Slides/1782821311703.webp)

## Slide example

[[Presenting on Hillnote|doc:documents/Presenting%20on%20Hillnote.slides.md]] 

## Quick reference for Syntax commands

| Command | Syntax | Description |
| --- | --- | --- |
| **Slide separator** | `***` | Separates slides (three asterisks on its own line) |
| **Vertical divider** | `~` | Creates vertical sections with `justify-between` spacing |
| **Inline media** | `~inline` | Keeps the next media block in the same column as preceding text |
| **Split column** | `~split` | Forces the next text content into a new column |
| **Split within column** | `~split-column` | Splits a column into stacked sub-blocks with independent styles |
| **Column width** | `~column{N}-{fraction}` | Sets width of column N (e.g., `~column1-2/3`) |
| **Banner** | `~banner` | Makes content above it full-width, remaining content as columns below |
| **Slide background** | `~bg-{color/url}` | Sets slide background (hex color or image URL) |
| **Slide text color** | `~text-{color}` | Sets text color for the entire slide |
| **Scoped text color** | `~text-{target}-{color}` | Sets text color for specific elements (`h1`, `h2`, `h3`, `body`) |
| **Column background** | `~bg-column-{color/url}` | Sets background for the current column only |
| **Column text color** | `~text-column-{color}` | Sets text color for the current column only |
| **Scoped column text** | `~text-column-{target}-{color}` | Sets text color for specific elements in current column |
| **Bar chart** | `~bar` | Renders the following table as a vertical bar chart |
| **Line chart** | `~line` | Renders the following table as a line chart |
| **Pie chart** | `~pie` | Renders the following table as a pie chart |
| **Area chart** | `~area` | Renders the following table as an area chart |
| **Visualization** | `~visualize` | Renders the following code block as live interactive HTML/SVG/JS |
| **Horizontal line** | `~line-horizontal` | Adds a horizontal decorative line (append `-{color}` for custom color) |
| **Vertical line** | `~line-vertical` | Adds a vertical decorative line (append `-left`/`-right` for alignment, `-{color}` for custom color) |

