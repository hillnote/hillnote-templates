---
stage: Accepted
owner: Ravi Menon
---

# Glossary

The words this team uses, defined once. Every term has its own anchor, so a page can link straight to the definition instead of re-explaining it. To add one, write the term, select it, and mark it as a section anchor, then link to it from anywhere with the link dialog's References tab.

## API and limits

- [API key]{#api-key}: the secret a customer sends with every request. Keys belong to a tenant, and limits and usage are counted per key, never per IP address.
- [Tenant]{#tenant}: a customer account. One tenant can hold many API keys (one per app or environment is normal), and its tier sets the default limits for all of them.
- [Token bucket]{#token-bucket}: the rate-limiting algorithm in the gateway. Each key has a bucket that refills at a steady rate; each request takes one token, and an empty bucket means `429`. See [[RFC-001|doc:documents/Specs/RFC-001%20Rate%20limiting.md]].
- [Burst]{#burst}: the size of a token bucket, which is how many requests a key can send at once after a quiet spell. Standard keys get ${burst}.
- [Refill rate]{#refill-rate}: how many tokens a bucket gains per second, which is the sustained limit. Standard keys get ${default_limit} per second.
- [Shadow mode]{#shadow-mode}: running new logic on real traffic and logging what it *would* have done, without acting on it. How we launch anything that can refuse requests.
- [Cursor]{#cursor}: an opaque string that marks a position in a list result. Clients pass it back to get the next page. Cursors are signed and bound to the API key that created them.

## Reliability

- [SLO]{#slo}: service level objective, the reliability target we promise ourselves, a little stricter than the SLA we promise customers. Ours are on the [[Architecture overview|doc:documents/Specs/Architecture%20overview.md]].
- [Error budget]{#error-budget}: the unreliability an SLO allows. At ${slo_availability}% availability over 30 days it is ${=round((100 - slo_availability) / 100 * 30 * 24 * 60, 1)} minutes of downtime. When it's spent, reliability work comes before features.
- [p99]{#p99}: the 99th percentile latency, the time under which 99 out of 100 requests finish. Averages hide the slow requests; p99 is where customers feel them.
- [Cache stampede]{#cache-stampede}: many requests missing the cache for the same key at once and all hitting the database together. The cause of the [[places search incident|doc:documents/Runbooks/Postmortem%20-%20Places%20search%20latency.md]].
- [Canary]{#canary}: a deploy that goes to a small slice of traffic first, is compared with the current version, and rolls back automatically if it is worse. See [[Deploy|doc:documents/Runbooks/Deploy.md]].
- [Feature flag]{#feature-flag}: a switch that turns code paths on or off without a deploy. Every risky change ships behind one, off by default.

## How we work

- [RFC]{#rfc}: request for comments, a written proposal for a change big enough to need other people's eyes. Comments go on the page; the decision goes into an ADR.
- [ADR]{#adr}: architecture decision record, one page that says what we decided, why, and what it costs. Never edited after acceptance, only superseded by a newer one.
- [Incident commander]{#incident-commander}: the one person running an incident. They coordinate and decide; they don't debug. See [[Incident response|doc:documents/Runbooks/Incident%20response.md]].
- [SEV level]{#sev-level}: how bad an incident is, from SEV1 (customers can't use the API) to SEV3 (degraded, with a workaround). It sets who gets paged and how often we update customers.
- [Blameless postmortem]{#blameless-postmortem}: a write-up of an incident that looks for the system causes, not the person who pressed the button. People acted reasonably with what they knew; the system let it happen.
