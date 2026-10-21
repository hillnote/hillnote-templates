---
stage: Working
confidence: Medium
---

# Lean canvas

One screen, nine boxes, and every box is a guess until an interview or a number says otherwise. Fill it in the order below: the boxes at the top are the ones that kill products, so they get the most evidence.

This is version 3, rewritten after the first six conversations in the **Customer interviews** database. What changed is at the bottom.

## 1. Problem

1. **Chasing late payments by hand.** A polite nudge, then a firmer one, then the awkward third email. Five of the six people we interviewed brought this up before we asked.
2. **Not knowing what's owed.** Invoices live in a folder, payments in a bank app, and the gap lives in their head.
3. **Clients who don't pay by bank transfer.** Account details get lost, copied wrong or forgotten until the next reminder.

**Existing alternatives:** a spreadsheet and a doc template, a full accounting suite, a free invoice maker, or the invoicing built into a business bank account. See [[Competitor notes|doc:documents/Strategy/Competitor%20notes.md]].

## 2. Customer segments

**Who:** solo freelancers who bill 3 to 15 clients a month: designers, developers, writers and photographers.

**Early adopters:** freelance designers with agency clients on 30 to 60 day terms, who already chase at least one invoice a month.

## 3. Unique value proposition

> **Invoices that chase themselves.** Send an invoice in a minute, and ${product_name} follows up politely until you're paid.

**High-level concept:** autopilot for getting paid.

## 4. Solution

1. An invoice in under a minute, from a saved client.
2. A pay-by-card link on every invoice.
3. Reminders on a schedule you choose, in a tone you choose.

The scope, and what is deliberately left out, lives in the [[MVP spec|doc:documents/Build/MVP%20spec.md]].

## 5. Channels

- Freelancer communities and newsletters (where the waitlist came from)
- The invoice itself: a small "Sent with ${product_name}" line in the footer
- Bookkeepers who serve freelancers (to test after launch)

## 6. Revenue streams

One plan: **$${price_monthly} a month**, a 14-day free trial, no card needed to start. Founding members keep that price for life. #pricing

**The goal:** ${target_customers} customers × $${price_monthly} = **$${=price_monthly * target_customers} MRR**, enough to replace two days a week of client work.

## 7. Cost structure

- Running costs of about $${monthly_costs} a month (the line items are in [[Tech stack|doc:documents/Build/Tech%20stack.md]])
- Payment fees, charged per transaction and passed through
- Time: four focused days a week; the fifth is paid client work

Break-even on running costs is **${=ceil(monthly_costs / price_monthly)} paying customers**.

## 8. Key metrics

| Metric | Why it matters | Today |
|---|---|---|
| Invoices sent per active user per month | The habit | Beta not started |
| Share of invoices paid through the link | Does the pay link get used | No data yet |
| Days from due date to paid | The promise | 19 days late on average (interviews) |
| Paying customers | The business | 8 founding members |

## 9. Unfair advantage

Honest answer: none yet. The closest thing is a network of freelance designers and a reminder library written by someone who has sent hundreds of awkward payment emails herself. Revisit this box after launch.

## What changed in version 3

- Dropped expense tracking from the solution. Nobody mentioned it unprompted.
- Narrowed the segment from "small businesses" to solo freelancers, after [[Aisha|doc:documents/Strategy/Customer%20interviews/Aisha%20-%20UX%20consultant.md]] showed that people with a few retainer clients barely feel the problem.
- Raised the price from $9 to $${price_monthly} after three interviewees named $10 to $15 without hesitating.

Think it's solid? Type `/pressure_test` on a new page and let it argue with you.
