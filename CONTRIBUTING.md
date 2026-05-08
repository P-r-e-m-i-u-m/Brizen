# Contributing

Thanks for checking out `daily-activity`.

This repository values small, reviewable changes with clear operational impact.

## Good Contributions

- Improve documentation navigation.
- Add tests around middleware, utilities, or queue behavior.
- Harden GitHub Actions without changing their schedule.
- Clarify runbooks, incident reports, or architecture notes.
- Improve security posture with minimal, verified changes.

## Before Opening a Pull Request

```bash
npm install
npm test
npm audit
```

If a check cannot run locally, mention why in the PR notes.

## Workflow Changes

Workflow changes should be conservative. If a workflow writes commits, releases, or docs, preserve its schedule and token behavior unless the change explicitly fixes that area.
