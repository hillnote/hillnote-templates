---
status: Done
area: Product
milestone: M1 Invoices
effort: 6
start: '2026-10-05'
end: '2026-10-14'
_emoji: 🧾
---

The heart of the product: create an invoice from a saved client, add line items, set the due date, send.

**Spec:** [[Invoices|doc:documents/Build/MVP%20spec.md#invoices]] (I1, I2, I4)

**Acceptance criteria**

- [x] A new user sends a first invoice in under 2 minutes
- [x] Totals right to the cent with any tax rate, including zero
- [x] Invoice numbers in sequence, starting number editable
- [x] Saved clients with default payment terms

**Shipped:** in week 4. Timed with three waitlist users over video calls: 1 min 40 s, 1 min 10 s, 2 min 05 s. The slow one got stuck on tax, so the tax field now defaults to the last rate used.
