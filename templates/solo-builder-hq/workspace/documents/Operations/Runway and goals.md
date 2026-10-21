# Runway and goals

Two questions decide whether a solo product survives: **how long can you keep going**, and **what does enough look like**. This page answers both with real numbers, once a month.

## The Money sheet

One row per month: revenue collected, costs paid, MRR at the end of the month and paying customers. Month 2 is the current month; the projected rows are a plan to beat, not a promise.

[sheet:Money](documents/Operations/Money)

## Runway

Runway is the number of months until the savings set aside for this run out. The question that matters more is whether you're **default alive**: at the current growth rate, do revenue and side income cover spending before the money runs out?

The sample numbers: 14,000 set aside, 2,600 a month of spending (living costs included), and 1,400 a month from one freelance day a week. At today's MRR that's about a year of runway. With MRR growing 25% a month after launch, ${product_name} is default alive, just. Put your own numbers in and save a scenario each month.

[html:Runway calculator](resources/html/runway-calculator/index.html)

## The goal

${target_customers} customers × $${price_monthly} = **$${=price_monthly * target_customers} MRR**. Running costs of $${monthly_costs} a month are covered at ${=ceil(monthly_costs / price_monthly)} customers; everything after that is salary.

Starting from about 30 customers in the launch month, reaching the goal in a year takes ${=ceil((target_customers - 30) / 12)} net new customers a month, before churn. The planner adds churn and works back from customers to trials and visitors, so you know what the launch has to deliver every week.

[html:MRR goal planner](resources/html/mrr-goal-planner/index.html)

## The monthly check

- [ ] Add last month's row to the Money sheet and switch it from Projected to Actual
- [ ] Update the runway calculator with real numbers and save a scenario named after the month
- [ ] If you're default dead, decide this week: cut a cost, add a freelance day or test a higher price
- [ ] Note the decision in the [[Ship log|doc:documents/Build/Ship%20log.md]]
