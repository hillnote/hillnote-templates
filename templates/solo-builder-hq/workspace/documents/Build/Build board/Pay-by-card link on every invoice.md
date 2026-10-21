---
status: Doing
area: Payments
milestone: M2 Get paid
effort: 4
start: '2026-10-26'
end: '2026-11-04'
_emoji: 💳
---

Every invoice email and PDF carries a link where the client pays by card, without creating an account. This is what turns "I'll transfer it next week" into "done".

**Spec:** [[Getting paid|doc:documents/Build/MVP%20spec.md#getting-paid]] (P2)

**Acceptance criteria**

- [x] Hosted payment page with the invoice summary and the freelancer's name
- [x] Link in the email, on the invoice page and on the PDF
- [ ] Works on a phone with one thumb
- [ ] Partially paid invoices show the remaining amount

**Notes for the coding agent:** amounts in cents everywhere; the link carries an opaque token, never the invoice id.

Tests assumption 3 on [[Assumptions to test|doc:documents/Strategy/Assumptions%20to%20test.md]].
