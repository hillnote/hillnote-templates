---
stage: In review
owner: Product
---

# Launch plan: Saved dashboards

**Tier:** 2, a meaningful feature for existing customers with no pricing change. **Spec:** [[PRD - Saved dashboards|doc:documents/Delivery/PRD%20-%20Saved%20dashboards.md]]

## Goals

1. Half of active accounts save a dashboard within six weeks.
2. Every customer-facing team can explain it in one sentence.

## Message

**One sentence:** Save any dashboard view and reopen it in one click, so Monday's meeting prep takes seconds instead of twenty minutes.

**For ops leads:** your Monday view, ready when you are.
**For dispatchers:** filters that stay put.

## Timeline

### Two weeks before
- [x] Beta live for Brightwater Logistics and Kestrel Freight
- [ ] Help-centre article drafted
- [ ] Support team walkthrough (15 min)

### One week before
- [ ] Beta feedback reviewed and fixes merged
- [ ] In-app announcement written
- [ ] Release note drafted in [[Release notes|doc:documents/Delivery/Release%20notes.md]]

### Launch day
- [ ] Flag on for all accounts, staggered by region
- [ ] In-app announcement live
- [ ] Customer email to ops leads

### One week after
- [ ] Adoption check against the success metrics
- [ ] Follow-up interviews with three accounts that didn't save anything

## Owners

| Area | Owner |
|---|---|
| Product and launch | Product |
| Engineering and flag rollout | Core team |
| Help centre and support | Support |
| Email and announcement | Marketing |

## Rollback

Turn the flag off if more than 1% of dashboard loads error, or if P95 load time rises above 3 seconds. Saved dashboards keep working once the flag is back on.
