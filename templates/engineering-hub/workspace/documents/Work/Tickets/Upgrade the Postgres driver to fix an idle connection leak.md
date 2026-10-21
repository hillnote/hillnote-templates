---
status: Done
type: Chore
priority: P2
estimate: 2
sprint: Sprint 14
owner: Tomás Reyes
pr: https://github.example.com/cobalt-labs/atlas-api/pull/412
opened: '2026-10-13'
_emoji: 🔧
---

Connections sitting idle for more than ten minutes were never returned to the pool after the load balancer closed them, so the pool slowly filled with dead connections until a restart.

- [x] Upgrade the Postgres driver to the version with the idle-connection fix
- [x] Pool health check every 30 seconds
- [x] Graph of open versus in-use connections on the database dashboard

Restarts for "pool exhausted" went from two a week to none since.
