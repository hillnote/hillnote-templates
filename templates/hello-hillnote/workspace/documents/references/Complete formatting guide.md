---
title: Complete formatting guide
date: 2024-01-15
tags: [example, test, formats, reference]
description: A comprehensive test document showcasing Hillnote's Markdown and formatting capabilities.
---

# Table of contents

:::toc "Table of Contents"
:::

* * *

# Heading 1

## Heading 2

### Heading 3

#### Heading 4

##### Heading 5

###### Heading 6

* * *

## Text Formatting

Paragraph text which is your standard format when nothing else is selected. You could have **bold text** or *italic text* or ***bold and italic*** combined.

highlighted ==text== works too

You can also use ~strikethrough~ for deleted text.

For subscript use ~H2O~ and for superscript use X^2^.

* * *

## Links

Document links look like [[Start here|doc:documents/Start%20here.md]] or perhaps something else entirely?

Regular links look like [hillnote.com](http://hillnote.com)

Links with titles: [Hillnote](http://hillnote.com)

* * *

## Topics

#formating-reference is how you reference a topic that spans across multiple documents

* * *

## Lists

### Unordered List

- First item
- Second item
  - Nested item
  - Another nested item
- Third item

### Ordered List

1. First item
2. Second item
   1. Nested item
   2. Another nested item
3. Third item

### Task List

- [ ] Uncompleted task
- [x] Completed task
- [ ] Tier 2 task
    - [ ] Tier 2 task 2
        - [ ] Tier 3 task 1
        - [ ] One more
        - [ ] Tier 3 task 2
    - [ ] Another
    - [ ] Another task
- [ ] Last root

* * *

## Code

This is a `little code` block that appears inline.

```javascript
// Code block with syntax highlighting
function greet(name) {
  console.log(`Hello, ${name}!`);
}
```

```javascript
# Python example
def hello():
    print("Hello, World!")
```

* * *

## Blockquotes

> This is a blockquote.  
> It can span multiple lines.

> > Nested blockquotes are also possible.

* * *

## Tables

| Column 1 | Column 2 | Column 3 |
| --- | --- | --- |
| Left | Center | Right |
| aligned | aligned | aligned |
| text | text | text |

* * *

## Images

### Local images



### Public images

![Pasted image](https://images.unsplash.com/photo-1774258161365-2adce28518b9?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)

* * *

## Horizontal Rules

Three or more hyphens:

* * *

Three or more asterisks:

* * *

Three or more underscores:

* * *

* * *

## Escaping Characters

Use backslash to escape: \*not italic\* and \`not code\`

* * *

## Footnotes

Here's a sentence with a footnote[^1].

[^1]: This is the footnote content.

* * *

## Scratchspaces

:::scratchspace "# Hello! this is a scratchspace!"
> **Note for AI:** This section contains the user's rough thinking, incomplete ideas, and unpolished notes.

# Hello! this is a scratchspace!

:::

* * *

## Tabs

:::tabs
:::tab "🚀 Do's"
This is an easy way to segregate content into several tabs

1. Organised content
2. Simplified reading
3. Selective disclosure
:::endtab
:::tab "🔥 Dont's"
### This is another tab

You could put any content in here that would help convey the idea or so
:::endtab
:::endtabs

* * *

## Resources

[file:excalidraw-library.json](resources/excalidraw-library.json)

* * *

## Web Embeds

[web:About Japan](https://en.wikipedia.org/wiki/Japan)

* * *

## Slide embeds

[[Presenting on Hillnote|doc:documents/Presenting%20on%20Hillnote.slides.md]] 

* * *

## Database embed

[[database:Exploring Hillnote|documents/Exploring%20Hillnote]] 

* * *

