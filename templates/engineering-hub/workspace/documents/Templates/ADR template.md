---
stage: Draft
owner:
---

# ADR-000: Short decision title

Write ADRs as rows of the **ADRs** database so they show up in the log, the board and the timeline. Copy these headings into a new row, or run `/draft_adr` and let it fill them in.

**Status:** Proposed · **Deciders:** names · **Supersedes:** link, if any

## Context

The forces at play: what's true today, the constraints, the numbers, and why a decision is needed now. Someone joining in a year should understand the problem without asking.

## Decision

One paragraph, in the active voice: "We will…". Specific enough that a reviewer can tell whether the code follows it.

## Consequences

Good, bad and neutral, honestly. What becomes easier, what becomes harder, what we now have to look after.

## Alternatives considered

- **Option**: why not

## Open questions

- [ ]

Once accepted, an ADR is never edited. If the decision changes, write a new ADR that supersedes it and set this one to Superseded.
