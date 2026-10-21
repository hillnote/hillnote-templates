---
status: Done
area: Backend
milestone: M1 Invoices
effort: 3
start: '2026-10-14'
end: '2026-10-21'
_emoji: 🖨️
---

Clients forward invoices to finance teams, and finance teams print them. The PDF has to look as good as the page.

**Spec:** [[Invoices|doc:documents/Build/MVP%20spec.md#invoices]] (I3)

**Acceptance criteria**

- [x] A4 or US Letter by the client's country
- [x] Line items never split across pages
- [x] Same template as the invoice page, so they can't drift
- [x] Under 200 KB per invoice

**Shipped:** in week 5. See the [[Ship log|doc:documents/Build/Ship%20log.md]] for the page-break fix.
