# Writer's Studio

A quiet place to do the whole job of writing: catch the idea, shape it, draft it, cut it, ship it. Ideas land on the Desk, become pieces, and move through a pipeline until they are published. Your research and your rules of craft sit one link away from every draft.

The workspace comes with a worked example. **${pen_name}** is a fictional essayist who sends a fortnightly newsletter, **${newsletter_name}**, and is halfway through a book of essays about repair, *${book_title}*. Every page and view already has something in it. Read it as a walkthrough, then make it yours.

## How it fits together

```mermaid
graph LR
  I[Desk<br/>ideas inbox] --> P[Pieces<br/>outline, draft, edit]
  R[Research<br/>commonplace book, reading notes] --> P
  C[Craft<br/>style guide, checklists] --> P
  P --> S[Out in the world<br/>newsletter, book, pitches]
  S -. replies and new sparks .-> I
```

- **Desk**: the **Ideas** database catches every spark, with where it came from. [[This week at the desk|doc:documents/Desk/This%20week%20at%20the%20desk.md]] holds the week's plan and the sprint timer, and the **Writing log** keeps every sprint: words per day, per week and per piece.
- **Pieces**: the **Pieces** database is the hub. Every essay, newsletter issue and book chapter is a row with a status, a word target and a progress bar. The [[Book plan|doc:documents/Pieces/Book%20plan.md]], the [[Book board|doc:documents/Pieces/Book%20board.moodboard.md]] and the [[Newsletter plan|doc:documents/Pieces/Newsletter%20plan.md]] sit beside it, with **Submissions** for every pitch, guest essay and prize entry.
- **Research**: the [[Commonplace book|doc:documents/Research/Commonplace%20book.md]] keeps quotes and overheard lines, tagged by topic, and the **Reading notes** database keeps what you read and where it will be used.
- **Craft**: the rules you edit against. The [[Style guide|doc:documents/Craft/Style%20guide.md]], a four-pass [[Editing checklist|doc:documents/Craft/Editing%20checklist.md]], [[Structure cheat-sheets|doc:documents/Craft/Structure%20cheat-sheets.md]] and a [[Publishing checklist|doc:documents/Craft/Publishing%20checklist.md]].
- **Templates**: blank pages to duplicate, an [[Essay outline|doc:documents/Templates/Essay%20outline.md]] and a [[Newsletter issue|doc:documents/Templates/Newsletter%20issue.md]].

## Your first 15 minutes

- [ ] Open **Pieces → Pieces** and switch between the Pipeline, Calendar and Book views
- [ ] Open [[The cobbler on Wren Street|doc:documents/Pieces/Pieces/The%20cobbler%20on%20Wren%20Street.md]] to see an outline, a draft excerpt and a scratch space working together
- [ ] Open the [[Book board|doc:documents/Pieces/Book%20board.moodboard.md]] and drag a sticky into a different part
- [ ] Add one idea of your own to **Desk → Ideas**, with the spark that started it
- [ ] Run a ten-minute sprint from [[This week at the desk|doc:documents/Desk/This%20week%20at%20the%20desk.md]], log the words, and find them in the Writing log
- [ ] Paste a paragraph of your own into the prose check at the bottom of the [[Editing checklist|doc:documents/Craft/Editing%20checklist.md]] and press **Read aloud**
- [ ] Select a paragraph in any draft and type `/line_edit`

## Tools on your desk

Four small tools, each on the page where you'd reach for it.

| Tool | Where it lives | What it does |
|---|---|---|
| ⏱️ Word sprint | This week at the desk, and the Sprint view of Pieces | A timer with a word target. Logs the words to the piece and to the Writing log, and keeps your streak |
| 🔎 Prose check | The bottom of the Editing checklist | Readability, sentence rhythm, echoes and the style guide's words to cut, plus a read-aloud test |
| ✉️ Subject line preview | The Newsletter plan | Shows a subject line and preheader on a phone and in an inbox, checks them against the house style, and saves the winner to the piece |
| 📚 Book tracker | The Book plan, and the Book view of Pieces | The manuscript by part, the words still to write, and when the first draft lands at your real pace |

The first time a tool reads or writes a database or the Writing log, Hillnote asks you to allow it.

## How the pieces connect

An idea is cheap and should stay cheap. Catch it on the Desk with its spark and one line on why it matters, then move on. When an idea keeps coming back, promote it: add a row to Pieces, set it to **Outline**, and link the two.

A piece is a page. Its properties track status, type, target and current words, and the **Progress %** formula works out how close the draft is. The body holds whatever the piece needs right now: the outline, the draft, research links, and a scratch space for the half-thoughts you want to keep but not in the draft.

Every sprint lands in the Writing log, whether the timer logged it or you typed it in. The word sprint reads it for your streak, and the book tracker reads it to work out when the first draft will be done.

When a piece is for someone else's pages, such as a guest essay, a radio slot or a prize, it also gets a row in **Submissions**. The row keeps the pitch exactly as you sent it, and **Days out** counts how long you've been waiting, so you know when to follow up and when to move on.

Research feeds pieces through links and topics. Quotes in the commonplace book carry topics such as #craft and #care, so the topic panel gathers everything you have on a theme, from every page, in one place.

Craft pages are what you edit against. The editing checklist runs four passes, from structure down to commas, and the style guide settles arguments before they start. When a piece moves to **Ready**, the publishing checklist takes it the rest of the way: into the newsletter, to the editor, or onto your blog, which Hillnote can publish as a site on your own domain.

## Make it yours

The sample story lives in the Ideas, Pieces, Submissions and Reading notes rows, the Writing log, the Book board, the commonplace book, the book and newsletter plans, and this week's desk page. Delete rows freely: the columns, views, formulas and tools stay. The Craft pages and the templates are written to be kept; edit them into your own rules.

Your pen name, newsletter name, book title, daily word target and book length are **workspace variables**. Change them once and every page that mentions them updates, including the timeline in the book plan. Two settings live inside their tools instead: the book length in the book tracker, and the sender name in the subject line preview.

## Use with AI

- `/outline_from_notes` turns a scratch space full of notes into an outline: it picks a structure from the cheat-sheets and pulls matching quotes from the commonplace book.
- `/reader_report` reads a whole draft the way a good first reader would: what works, where the turn falls, where attention drifts, and the three changes that matter most. It never touches a sentence.
- `/line_edit` tightens a passage against your style guide and the line pass of the editing checklist, then lists what it changed and why.
- `/headline_options` writes headlines, subtitles and email subject lines for the current piece, using the headline patterns in the cheat-sheets.
- `/pitch_letter` drafts a pitch to an editor, a radio slot or a prize, and learns from what Submissions says was accepted and declined.

Give Claude the heavy lifting, such as a structural rewrite or a middle section that has stopped working. Keep the small fixes local: on-device AI handles grammar, tone and quick rewrites in place, and the draft never leaves your machine.

Coding agents and desktop assistants can work here too. Point Claude Code or Cursor at this workspace folder over MCP, and they can read a draft with its research, update a piece's status or word count, log words to the Writing log, and add sparks to the Ideas inbox.

## Suggested routines

Routines can't come inside a template, but these take a minute to set up:

| When | Run | Why |
|---|---|---|
| Weekdays, 8:30 | "Read This week at the desk and tell me the one thing to write first today" | You sit down knowing what to write |
| Wednesday, 16:00 | `/headline_options` on the next newsletter piece | The subject line is settled before send day |
| Friday, 16:00 | "Read the Writing log and Submissions. How many words this week, on what, and which pitches need a nudge?" | The end-of-week review starts with real numbers |
| Sunday, 18:00 | "Read the Ideas inbox and suggest which two sparks to promote this week" | Good ideas get a hearing before they go stale |
