---
status: Accepted
decided: '2026-10-06'
area: API
deciders: Lena Fischer, Tomás Reyes
_emoji: 📑
---

## Context

List endpoints (places search, usage history) used `offset` and `limit`. Deep pages got slow, because Postgres still reads every skipped row, and results shifted between pages when new places were imported mid-scroll.

## Decision

We will paginate every list endpoint with an opaque [[cursor|doc:documents/Specs/Glossary.md#cursor]] that encodes the sort key of the last item returned. Clients pass `cursor` back to get the next page; `offset` is deprecated and removed in v3. Cursors are signed and bound to the tenant that created them.

## Consequences

- Page 500 is as fast as page 1.
- No duplicates or gaps when data changes between requests.
- Clients can't jump to an arbitrary page. Nobody asked for it in support history, but the docs say so plainly.
- Binding cursors to the tenant was missed in the first implementation, which is [[Pagination cursor accepted across API keys|doc:documents/Work/Tickets/Pagination%20cursor%20accepted%20across%20API%20keys.md]].

## Alternatives considered

- Keyset pagination with readable parameters (`after_id`): leaks internal IDs and sort details into client code.
- Keep offsets with a maximum depth: fixes speed, not shifting results.
