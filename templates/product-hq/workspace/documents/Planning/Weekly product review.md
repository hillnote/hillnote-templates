# Weekly product review

Thirty minutes, every Monday. The goal is decisions, not status: the digest covers status, so the meeting is for the things only humans can settle.

## Agenda

1. **Numbers** (5 min): the scorecard below. Talk only about key results that are At risk or Off track, and anything Ahead (was the target too safe?)
2. **Now** (10 min): each Now initiative, one line each: on track, at risk, or blocked
3. **Decisions** (10 min): anything waiting on this group
4. **Next up** (5 min): open the Roadmap's **Reality check** view. Does Now and Next still fit each team? Did anything ship that needs a verdict?

Before the meeting, owners check in their key results and someone runs `/status_digest`, pasting the result under "This week".

## This week

[database:Key results](documents/Strategy/Key%20results)

**Numbers:** ${north_star} is on track but slowing now the templates bump has worn off. Muted alerts are at risk until digests ship. Large imports haven't moved, and nothing in Now is aimed at them.

### Shipped
- Query caching is live for 40% of accounts behind a flag. P95 load dropped from 9.8s to 2.4s for Summit Couriers.

### In flight
- **Saved dashboards**: on track. Design review on Wednesday, then the beta with Brightwater and Kestrel.
- **Alert digests**: at risk. The email template is waiting on brand review, so it may slip a week.

### Decisions
- Client share links stay in **Next** until the security review is done. Agreed.
- KPI pins move after Saved dashboards, not in parallel. Agreed.
- Growth is 2 person-weeks over for Now and Next. Client share links is below the line; it waits for the security review anyway. Agreed.

### Actions
- [ ] Unblock the digest email review (Product)
- [ ] Book the security review for share links (Growth)
- [ ] Give Onboarding checklist its verdict in four weeks (Growth)
- [x] Turn query caching on for all enterprise accounts (Platform)

## The roadmap

[database:Roadmap](documents/Planning/Roadmap)
