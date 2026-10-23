---
kind: Plan
use_when: Planning chapters, and before every call with the editor
---

# Book plan

*${book_title}* is a book of twelve essays about people who fix things, and what fixing teaches the rest of us. Each essay starts with one person and one object, then widens into a question about how we live with the things we own.

:::toc "On this page"
:::

## The promise

A reader who finishes the book should look at a broken thing and think *maybe* before they think *bin*. Not out of guilt, but out of curiosity: who could fix this, and what would it take?

## Shape

Three parts of four essays. Every essay is 4,500 to 6,500 words and follows one rule: start with hands, end with a question.

| Part | Essays | Thread |
|---|---|---|
| One: Hands | The cobbler, the piano tuner, the bicycle, darning | What skill feels like from the inside |
| Two: Places | The radio shop, the tip, the kitchen drawer, the repair café | Where repair happens, and who it gathers |
| Three: People | A friendship, a father's toolbox, a house, the reader's own | Repair as a way of caring |

The [[Book board|doc:documents/Pieces/Book%20board.moodboard.md]] lays the twelve essays out as cards on a corkboard, one column per part, with the newsletter issues and ideas that will grow into chapters underneath. Drag a card to try a new order before you commit to it here.

## Chapters in progress

- [[Introduction|doc:documents/Pieces/Pieces/Introduction.md]]: why a book about repair, and why now. Opens on a dead kettle.
- [[The cobbler on Wren Street|doc:documents/Pieces/Pieces/The%20cobbler%20on%20Wren%20Street.md]]: Teodor Brandt, eleven years of resoling the same boots.
- [[A piano tuner's ear|doc:documents/Pieces/Pieces/A%20piano%20tuner%27s%20ear.md]]: Agnes Moll and the deliberate compromise of equal temperament.
- [[What the bicycle knows|doc:documents/Pieces/Pieces/What%20the%20bicycle%20knows.md]]: a workshop where you fix your own bike while someone watches.
- [[Mending a friendship|doc:documents/Pieces/Pieces/Mending%20a%20friendship.md]]: eight years of silence, told in the shape of a repair manual.

Live status and word counts are in the **Pieces** database: its **Book** view shows only the chapters, grouped by part.

## The word budget

The full draft is **${=round(book_target / 1000)}k words**. At ${daily_words} words a day, five days a week, that is **${=ceil(book_target / (daily_words * 5))} weeks** of sprints before a single word is cut. Add a third again for revision.

The tracker below adds up every chapter in Pieces and reads your real pace from the **Writing log**, so the finish date moves when you do. Set its book length to match the variable, and give it a due date once the editor sets one.

[html:Book tracker](resources/html/book-tracker/index.html)

## Working with the editor

- Chapters go to Jonah Whitlow at Moorcroft Press in pairs, as they are finished. The **Publish date** on a book chapter row is the day it goes to him.
- He reads for structure first. Line edits wait until a whole part is in.
- Every chapter has been through passes 1 and 2 of the [[Editing checklist|doc:documents/Craft/Editing%20checklist.md]] before he sees it.

## Rules for every chapter

- Opens on a person doing something with their hands.
- Names the object on the first page.
- Has at least one scene in the present, with dialogue.
- Widens into an idea by the midpoint, never in the first paragraph.
- Ends on a question the reader can carry out of the book.
- Every fact is checked against a source in **Reading notes**.
