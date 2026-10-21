---
status: Doing
area: Backend
milestone: M2 Get paid
effort: 3
start: '2026-11-02'
end: '2026-11-06'
_emoji: 🔔
---

When a client pays through the link, the invoice flips to Paid on its own and every pending reminder is cancelled. If this is wrong, a reminder goes out after payment, which is the one thing ${product_name} must never do.

**Spec:** [[Getting paid|doc:documents/Build/MVP%20spec.md#getting-paid]] (P3) and [[Reminders|doc:documents/Build/MVP%20spec.md#reminders]] (R3)

**Acceptance criteria**

- [ ] Paid within a minute of the payment succeeding
- [ ] Each provider event id stored once; repeats ignored
- [ ] Refunds and failed payments move the invoice back to Sent
- [ ] Pending reminders cancelled in the same transaction

**Notes for the coding agent:** verify webhook signatures; locally, forward events with the provider's CLI (see the [[Tech stack|doc:documents/Build/Tech%20stack.md]]).
