# Weekly product review

Thirty minutes, every Monday. The goal is decisions, not status: the digest covers status, so the meeting is for the things only humans can settle.

## Agenda

1. **Numbers** (5 min): the north star and anything red on the [[OKRs|doc:documents/Strategy/OKRs.md]] page
2. **Now** (10 min): each Now initiative, one line each: on track, at risk, or blocked
3. **Decisions** (10 min): anything waiting on this group
4. **Next up** (5 min): does the top of the By RICE view still make sense?

Run `/status_digest` before the meeting and paste the result under "This week".

## This week

**${north_star}:** ${wad_current} (target ${wad_target}, ${=round(wad_current / wad_target * 100)}% of the way)

### Shipped
- Query caching is live for 40% of accounts behind a flag. P95 load dropped from 9.8s to 2.4s for Summit Couriers.

### In flight
- **Saved dashboards**: on track. Design review on Wednesday, then the beta with Brightwater and Kestrel.
- **Alert digests**: at risk. The email template is waiting on brand review, so it may slip a week.

### Decisions
- Client share links stay in **Next** until the security review is done. Agreed.
- KPI pins move after Saved dashboards, not in parallel. Agreed.

### Actions
- [ ] Unblock the digest email review (Product)
- [ ] Book the security review for share links (Growth)
- [x] Turn query caching on for all enterprise accounts (Platform)

## The roadmap

[database:Roadmap](documents/Planning/Roadmap)
