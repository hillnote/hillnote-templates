# Ship log

One entry a week, written on Friday afternoon, newest first. It takes ten minutes and does three jobs: it shows you that you're moving, it catches slipping work while it's still small, and it becomes the raw material for launch posts and updates.

Run `/weekly_ship_review` and it drafts the entry from the Build board for you, using the [[Weekly review template|doc:documents/Templates/Weekly%20review%20template.md]].

## Week 7 (this week)

**The three for this week**

1. Finish the pay-by-card link (due Wednesday)
2. Paid status from payment webhooks
3. Start automatic reminders: the scheduler and the first email

Also: invite the 12 beta users, and the interview with Sofia on Thursday.

## Week 6

**Shipped**

- Payout account onboarding. A freelancer connects a payout account in about four minutes, tested end to end.
- Founding-member offer to the waitlist: **8 pre-sales** in four days.

**Learned**

- The onboarding form asks for a tax ID most freelancers don't have to hand. Added "finish later" so they can still draft invoices.
- Every pre-sale came from a designer. Developers opened the email and didn't buy. Worth asking why.

**Stuck**

- Webhook signatures failed locally for half a day. The fix was forwarding events with the provider's CLI instead of a tunnel.

**Numbers:** waitlist 189 (+27), pre-sales 8, interviews 6.

## Week 5

**Shipped**

- PDF invoices that print well, on A4 and US Letter.
- Started payout onboarding.

**Learned**

- Half the waitlist is in Europe, so paper size follows the client's country rather than the freelancer's.

**Stuck**

- Long invoices split line items across pages. Fixed with a keep-together rule on each row.

**Numbers:** waitlist 162 (+34), interviews 6.

[database:Build board](documents/Build/Build board)
