# Vision and strategy

## Vision

Every operations team can see what is about to go wrong in time to fix it.

## Who we serve

${product} is for **operations teams at mid-size logistics and field-service companies**: 50 to 2,000 people, running dispatch, deliveries or on-site jobs against service-level agreements. They are drowning in spreadsheets and alerts, and they live in a dispatch tool that was never built for analysis. See [[Personas|doc:documents/Strategy/Personas.md]].

## The problem

Ops leads find out about missed SLAs from angry customers, not from their data. The information exists, scattered across a dispatch system, a CRM and a billing tool. Pulling it together takes a Monday morning every week, and by Thursday it is out of date.

## Our bet

1. **The first screen of the day.** If ${product} is the first thing an ops lead opens each morning, everything else follows. We measure this with our north-star metric, **${north_star}**.
2. **Opinionated over infinite.** Ten great operational dashboards beat a blank canvas. Templates, sensible defaults and saved views come before custom chart builders.
3. **Alerts people trust.** Fewer, better alerts, with digests instead of 3am pings. An alert that cries wolf gets muted, and a muted alert is worth nothing.

## What we won't do

- Build a general-purpose BI tool. Customers who need one already have one.
- Chase enterprise procurement checklists before mid-market retention is healthy.
- Replace the dispatch system. We sit beside it and read from it.

## How we win

| | Spreadsheets | Generic BI | ${product} |
|---|---|---|---|
| Time to first useful dashboard | Days | Weeks | **Under an hour** |
| Built for SLAs and dispatch data | No | With work | **Yes** |
| Alerting people trust | No | Rarely | **Core feature** |
| Price per seat | Free | High | **$${price_per_seat} / month** |

## The size of the prize

Today: ${active_accounts} accounts × ${avg_seats} seats × $${price_per_seat} a month × 12 = **$${=round(active_accounts * avg_seats * price_per_seat * 12 / 1000000, 2)}M ARR**.

Use the calculator below to pressure-test the market. Change the inputs, save a scenario, and compare.

[html:Market sizing](resources/html/market-sizing/index.html)
