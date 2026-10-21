---
stage: Working
confidence: Medium
---

# Assumptions to test

Every box on the [[Lean canvas|doc:documents/Strategy/Lean%20canvas.md]] is an assumption. This page ranks them by risk and gives each one a cheap test, with the pass line written down before the result comes in. Writing it first is the whole trick: it stops you from moving the goalposts.

**Risk = how bad if wrong × how unsure you are**, each scored 1 to 5. Work from the top. A high-risk assumption that is cheap to test is the best deal you'll get all week.

| # | Assumption | Bad if wrong | Unsure | Risk |
|---|---|---|---|---|
| 1 | Freelancers will pay $${price_monthly} a month | 5 | 4 | **20** |
| 2 | Automatic reminders won't hurt client relationships | 4 | 4 | **16** |
| 3 | Clients will pay through a card link | 4 | 3 | **12** |
| 4 | Freelancer communities can bring the first ${target_customers} customers | 3 | 4 | **12** |
| 5 | Chasing payments hurts enough to switch tools | 5 | 2 | **10** |
| 6 | One person can support ${target_customers} customers | 3 | 3 | **9** |
| 7 | People will move their client list over | 2 | 3 | **6** |

## 1. Freelancers will pay $${price_monthly} a month

**Test:** offer founding-member pre-sales to the waitlist before launch.

**Pass if:** 15 or more of the 212 waitlist sign-ups pay up front.

- [x] Email the waitlist the founding-member offer
- [ ] Reach 15 pre-sales (8 so far, tracked in the **Money** sheet)
- [ ] If it's under 10 by launch week, call three people who opened the email and didn't buy

## 2. Automatic reminders won't hurt client relationships

The biggest fear in the interviews. [[Priyanka|doc:documents/Strategy/Customer%20interviews/Priyanka%20-%20copywriter.md]] doesn't want to "sound like a debt collector" to the agencies that send her work, and [[Marco|doc:documents/Strategy/Customer%20interviews/Marco%20-%20freelance%20developer.md]] switched off his accounting suite's reminders because they "sounded like a robot". #reminders

**Test:** private beta with three tones (friendly, firm, final) and a preview of every reminder before it goes out.

**Pass if:** none of the 12 beta users turns reminders off in their first two weeks.

- [ ] Ship tone settings ([[card on the Build board|doc:documents/Build/Build%20board/Reminder%20tones%20-%20friendly%2C%20firm%2C%20final.md]])
- [ ] After each beta user's first reminder, ask: "Did that sound like you?"

## 3. Clients will pay through a card link

**Test:** measure how beta invoices get paid, from day one.

**Pass if:** 40% or more of beta invoices are paid through the link rather than marked paid by hand.

- [ ] Log paid-by-link and marked-paid-by-hand separately
- [ ] Ask two clients of beta users why they did or didn't use the link

## 4. Communities can bring the first customers

Evidence so far: 212 waitlist sign-ups from two community posts and one newsletter mention. That's a promising start, but a waitlist is not a sale.

**Test:** on launch day, post in three communities and track trials from each one separately.

**Pass if:** each post brings at least 40 trials within a week.

- [ ] Tag every launch link by community
- [ ] Write a different first line for each community; never cross-post the same text

## 5. Chasing hurts enough to switch tools (mostly validated)

- [x] Five of six interviewees raised chasing on their own, before we asked: [[Dana|doc:documents/Strategy/Customer%20interviews/Dana%20-%20brand%20designer.md]], [[Leo|doc:documents/Strategy/Customer%20interviews/Leo%20-%20motion%20designer.md]], Priyanka, Marco and [[Tom|doc:documents/Strategy/Customer%20interviews/Tom%20-%20wedding%20photographer.md]]
- [x] Leo had $6,400 outstanding on the day we spoke
- [ ] Aisha didn't care. Confirm she's outside the segment rather than a warning sign (one more consultant interview)

## 6. One person can support ${target_customers} customers

**Test:** answer every beta email yourself, write a help article for each repeat question, and count.

**Pass if:** fewer than one support email per 20 users per week, which is about an hour a day at full size.

- [ ] Start a support log in beta week 1

## 7. People will move their client list over

**Test:** offer to import each beta user's clients by hand, before building any importer.

**Pass if:** at least half of the beta users send a list.

- [ ] Add the offer to the beta welcome email

## Retired

- "Small agencies want this too." Dropped: they already have someone who does finance.
- "Freelancers want expense tracking in the same app." Dropped: nobody mentioned it once.
