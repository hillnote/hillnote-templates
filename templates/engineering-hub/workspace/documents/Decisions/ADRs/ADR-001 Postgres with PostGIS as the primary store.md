---
status: Accepted
decided: '2026-09-22'
area: Data
deciders: Tomás Reyes, Aiko Tanaka
_emoji: 🐘
---

## Context

${service} stores about 180 million addresses and 40 million places, and almost every query is spatial: nearest places to a point, places inside a bounding box, the address closest to a coordinate. We also need transactions for accounts and billing. This decision was made when the service was first built; we are writing it down now, because we started keeping ADRs this quarter and new people keep asking.

## Decision

We will use **Postgres with the PostGIS extension** as the single source of truth for addresses, places, accounts and usage. Search results may be cached in Redis, but nothing lives only in the cache.

## Consequences

- Spatial queries use GiST indexes and stay in SQL, which the whole team can read.
- One database to back up, monitor and fail over, instead of a search engine plus a relational store.
- A cold cache sends all search load to Postgres, so we must keep headroom for it. The [[places search incident|doc:documents/Runbooks/Postmortem%20-%20Places%20search%20latency.md]] was this consequence arriving.
- Full-text search on place names is good enough in Postgres today. If fuzzy multilingual search becomes a requirement, revisit with a dedicated search index.

## Alternatives considered

- A dedicated search engine for places, Postgres for the rest: two sources of truth to keep in sync.
- A managed geospatial database: lock-in, and nobody on the team had run one.
