---
status: This week
area: Backend
milestone: M3 Reminders
effort: 5
start: '2026-11-04'
end: '2026-11-13'
_emoji: ⏰
---

The promise in the tagline. Reminders go out on a schedule, from the freelancer's name, and stop the moment the invoice is paid. #reminders

**Spec:** [[Reminders|doc:documents/Build/MVP%20spec.md#reminders]] (R1, R3, R4)

**Acceptance criteria**

- [ ] Default schedule: on the due date, then +7 and +14 days; each step can be switched off per invoice
- [ ] One scheduled task every 15 minutes sends anything due
- [ ] Never sent after payment (depends on the webhook card)
- [ ] Replies go to the freelancer's own inbox
- [ ] Every send logged on the invoice's timeline

**Notes for the coding agent:** the reminder record holds `scheduled_for` and `sent_at`; the job selects unsent reminders due now for unpaid invoices, in one query, inside a transaction.
