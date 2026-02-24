# Prompt: Solve issue #6621 — Add documentation for Backstage plugin

Create a new documentation page for the Flagsmith Backstage plugin at `docs/docs/third-party-integrations/developer-tools/backstage.mdx`.

The docs use Docusaurus 3 with auto-generated sidebar from filesystem structure. Follow the same pattern as existing integration pages (e.g., Jira at `docs/docs/third-party-integrations/project-management/jira.mdx`, Slack, Datadog).

The plugin is published as `@flagsmith/backstage-plugin` on npm. Repo: https://github.com/Flagsmith/flagsmith-backstage-plugin

The page should include these sections:

**Overview** — The plugin brings Flagsmith feature flag management into Backstage developer portals. It provides three components: a Feature Flags tab (full flag list with environments, tags, and toggle states), an Overview Card (quick flag summary), and a Usage Card (usage metrics chart).

**Prerequisites** — Backstage instance, Flagsmith account with an Admin API Key, and the project ID. (The organization ID is automatically derived from project data.)

**Installation** — `yarn --cwd packages/app add @flagsmith/backstage-plugin`

**Configuration** — Add the Backstage proxy config to `app-config.yaml`:

```yaml
proxy:
  endpoints:
    '/flagsmith':
      target: 'https://api.flagsmith.com/api/v1'
      headers:
        Authorization: Api-Key ${FLAGSMITH_API_TOKEN}
```

Note the self-hosted variant where the target URL changes.

**Adding components to entity pages** — Show how to add `FlagsTab`, `FlagsmithOverviewCard`, and `FlagsmithUsageCard` in `EntityPage.tsx`.

**Entity annotations** — Show the `catalog-info.yaml` annotation:

- `flagsmith.com/project-id` (required) - The organization ID is automatically derived from the project data

**Getting your credentials** — How to find the Admin API Key and Project ID in the Flagsmith dashboard. Important: The Project ID is the numeric `id` field shown in Project Settings JSON (e.g., `1`), not the UUID.

Use the frontmatter format:

```
---
title: Backstage
sidebar_position: 1
description: "Integrate Flagsmith feature flags into your Backstage developer portal"
---
```

You may also need to create a `docs/docs/third-party-integrations/developer-tools/_category_.json` file if that category folder doesn't already exist. Look at how other category folders are structured for reference.
