const issues = [
  {
    title: "fix: make queue retries idempotent across worker restarts",
    labels: ["bug", "operations"],
    body: [
      "## Problem",
      "If a worker restarts after completing work but before acknowledging the job, the same job can be processed again.",
      "",
      "## Why it matters",
      "Production queues must tolerate restarts without duplicate side effects.",
      "",
      "## Suggested approach",
      "- Add an idempotency key per job",
      "- Store completion state with a TTL",
      "- Skip already-completed jobs safely",
      "- Log duplicate-skip events with job id and queue name",
      "",
      "## Acceptance criteria",
      "- Restarted workers do not duplicate completed work",
      "- Tests cover completed, retry, and duplicate paths",
      "- Logs include enough data to debug skipped jobs",
      "- Repo checks pass"
    ].join("\n")
  },
  {
    title: "perf: add database connection pool saturation alerts",
    labels: ["performance", "operations"],
    body: [
      "## Problem",
      "Connection pool saturation can cause request latency spikes before the app shows obvious errors.",
      "",
      "## Why it matters",
      "The service should expose early warning signals before DB pool exhaustion becomes an incident.",
      "",
      "## Suggested approach",
      "- Track active, idle, and waiting DB connections",
      "- Emit warning logs when waiting clients exceed a threshold",
      "- Add metrics for pool saturation",
      "- Document alert thresholds",
      "",
      "## Acceptance criteria",
      "- Pool state is observable through logs or metrics",
      "- Thresholds are configurable",
      "- Tests cover threshold logic",
      "- Operations docs mention how to investigate"
    ].join("\n")
  },
  {
    title: "test: add regression coverage for request id middleware",
    labels: ["testing", "operations"],
    body: [
      "## Problem",
      "Request id behavior is easy to break when middleware order changes.",
      "",
      "## Why it matters",
      "Request ids are needed for log tracing and incident debugging.",
      "",
      "## Suggested approach",
      "- Test incoming `X-Request-ID` preservation",
      "- Test generated id when header is missing",
      "- Test response header propagation",
      "- Test logs receive the same id",
      "",
      "## Acceptance criteria",
      "- Middleware tests cover all request id paths",
      "- Generated ids are stable for the request lifecycle",
      "- Tests are deterministic",
      "- Repo checks pass"
    ].join("\n")
  },
  {
    title: "feat: add safe config defaults for local development",
    labels: ["enhancement", "maintenance"],
    body: [
      "## Problem",
      "Local development can fail with unclear errors when optional environment values are missing.",
      "",
      "## Why it matters",
      "New contributors should be able to run the project without guessing which variables are required.",
      "",
      "## Suggested approach",
      "- Separate required production config from safe local defaults",
      "- Add startup validation messages",
      "- Document `.env.example` values",
      "- Avoid printing secrets",
      "",
      "## Acceptance criteria",
      "- Local mode starts with documented defaults",
      "- Production mode fails fast on missing required config",
      "- Tests cover both modes",
      "- Docs explain the difference"
    ].join("\n")
  },
  {
    title: "fix: prevent log noise from expected client disconnects",
    labels: ["bug", "operations"],
    body: [
      "## Problem",
      "Expected client disconnects can appear as server errors and hide real production failures.",
      "",
      "## Why it matters",
      "Operational logs should separate actionable server errors from normal client behavior.",
      "",
      "## Suggested approach",
      "- Detect aborted requests",
      "- Log client disconnects at info/debug level",
      "- Keep real upstream/server errors at error level",
      "- Add a metric for aborted requests",
      "",
      "## Acceptance criteria",
      "- Aborted requests no longer create error-level noise",
      "- Real server errors still log as errors",
      "- Tests cover aborted request handling",
      "- Metrics include disconnect count"
    ].join("\n")
  },
  {
    title: "perf: add cache invalidation tests for write-heavy endpoints",
    labels: ["performance", "testing"],
    body: [
      "## Problem",
      "Caching read endpoints is useful, but stale cache bugs appear when writes do not invalidate the right keys.",
      "",
      "## Why it matters",
      "Users should not see stale data after create/update/delete operations.",
      "",
      "## Suggested approach",
      "- Identify write paths that affect cached reads",
      "- Add tests that write data and verify cache invalidation",
      "- Include user-specific and list-level cache keys",
      "- Document invalidation rules",
      "",
      "## Acceptance criteria",
      "- Tests cover create, update, and delete invalidation",
      "- Cache keys are documented",
      "- No sensitive values are used in key names",
      "- Repo checks pass"
    ].join("\n")
  },
  {
    title: "docs: add debugging guide for failed scheduled workflows",
    labels: ["docs", "operations"],
    body: [
      "## Problem",
      "Scheduled workflows can fail because of permissions, token scopes, branch conflicts, or runner problems.",
      "",
      "## Why it matters",
      "This repo relies on automation. Maintainers need a repeatable debugging guide.",
      "",
      "## Suggested approach",
      "- Document how to inspect the latest run",
      "- Include common failure causes",
      "- Include safe rerun steps",
      "- Explain when to use `workflow_dispatch`",
      "",
      "## Acceptance criteria",
      "- Add a workflow debugging guide under docs/",
      "- Include GitHub CLI examples",
      "- Include token/permissions checklist",
      "- Link the guide from operations docs"
    ].join("\n")
  }
];

const token = process.env.GITHUB_TOKEN;
const repository = process.env.GITHUB_REPOSITORY;
const dryRun = process.env.DRY_RUN === "1";

if (!repository) {
  throw new Error("Missing GITHUB_REPOSITORY");
}

const dayIndex = Math.floor(Date.now() / 86_400_000) % issues.length;
const issue = issues[dayIndex];

if (dryRun) {
  console.log(JSON.stringify({ repository, issue }, null, 2));
  process.exit(0);
}

if (!token) {
  throw new Error("Missing GITHUB_TOKEN");
}

const [owner, repo] = repository.split("/");
const headers = {
  Accept: "application/vnd.github+json",
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
  "X-GitHub-Api-Version": "2022-11-28"
};

async function github(path, options = {}) {
  const response = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: { ...headers, ...options.headers }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub API ${response.status}: ${text}`);
  }

  return response.status === 204 ? undefined : response.json();
}

for (const label of issue.labels) {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/labels/${encodeURIComponent(label)}`, {
    headers
  });

  if (response.status === 404) {
    await github(`/repos/${owner}/${repo}/labels`, {
      method: "POST",
      body: JSON.stringify({
        name: label,
        color: label === "operations" ? "0052CC" : "ededed",
        description: "Created by daily engineering issue automation"
      })
    });
  } else if (!response.ok) {
    const text = await response.text();
    throw new Error(`Could not inspect label ${label}: ${text}`);
  }
}

const searchQuery = encodeURIComponent(`repo:${repository} in:title "${issue.title}"`);
const search = await github(`/search/issues?q=${searchQuery}`);

if (search.total_count > 0) {
  console.log(`Daily engineering issue already exists: ${issue.title}`);
  process.exit(0);
}

const created = await github(`/repos/${owner}/${repo}/issues`, {
  method: "POST",
  body: JSON.stringify(issue)
});

console.log(`Created issue #${created.number}: ${created.html_url}`);
