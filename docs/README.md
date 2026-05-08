# Documentation Hub

This folder is the engineering record for `daily-activity`.

## Core Docs

| Document | Purpose |
| --- | --- |
| [Architecture overview](ARCHITECTURE_OVERVIEW.md) | System shape, modules, runtime dependencies, and request flow |
| [Operations runbook](OPERATIONS_RUNBOOK.md) | How to inspect, maintain, and recover the project workflows |
| [Maintenance scorecard](MAINTENANCE_SCORECARD.md) | Current health signals and improvement areas |
| [Authentication](auth.md) | Token validation and Redis-backed auth notes |
| [Database indexes](db-indexes.md) | Query performance and indexing strategy |
| [Pagination](pagination.md) | Cursor pagination design notes |

## Generated Engineering Records

| Folder | What It Contains |
| --- | --- |
| [adr](adr) | Architecture decision records |
| [rfc](rfc) | Engineering proposals and future design notes |
| [incidents](incidents) | Incident reports and postmortems |
| [security](security) | Security audit summaries |
| [architecture](architecture) | Dependency graphs and module maps |

## How To Review This Repo

1. Start with the main [README](../README.md).
2. Read the [architecture overview](ARCHITECTURE_OVERVIEW.md).
3. Check recent GitHub Actions runs.
4. Inspect the latest ADR, RFC, incident, and security audit.
5. Review the [maintenance scorecard](MAINTENANCE_SCORECARD.md) for current health.
