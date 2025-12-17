# Flagsmith Plugin for Backstage

Integrate [Flagsmith](https://flagsmith.com) feature flags into your Backstage instance.

## Features

- **Feature Flags Tab** - View all feature flags for a service directly in the entity page
- **Overview Card** - Quick summary of flags and their states
- **Usage Card** - Display Flagsmith usage metrics

## Installation

### 1. Install the plugin

```bash
# From your Backstage root directory
yarn --cwd packages/app add @flagsmith/backstage-plugin
```

### 2. Configure the Backstage proxy

Add to your `app-config.yaml` (or `app-config.local.yaml` for local development):

```yaml
proxy:
  endpoints:
    '/flagsmith':
      target: 'https://api.flagsmith.com/api/v1'
      headers:
        Authorization: Api-Key ${FLAGSMITH_API_TOKEN}
```

> **Note:** Use an environment variable for the API token in production. Never commit tokens to version control.

For self-hosted Flagsmith, change the target URL:

```yaml
proxy:
  endpoints:
    '/flagsmith':
      target: 'https://your-flagsmith-instance.com/api/v1'
      headers:
        Authorization: Api-Key ${FLAGSMITH_API_TOKEN}
```

### 3. Add the Feature Flags tab to entity pages

In `packages/app/src/components/catalog/EntityPage.tsx`:

```typescript
import { FlagsTab } from '@flagsmith/backstage-plugin';

// Add to your entity page layout (e.g., serviceEntityPage)
<EntityLayout.Route path="/feature-flags" title="Feature Flags">
  <FlagsTab />
</EntityLayout.Route>
```

### 4. (Optional) Add cards to the Overview page

```typescript
import {
  FlagsmithOverviewCard,
  FlagsmithUsageCard,
} from '@flagsmith/backstage-plugin';

// Add to your entity overview page
<Grid item md={6}>
  <FlagsmithOverviewCard />
</Grid>
<Grid item md={6}>
  <FlagsmithUsageCard />
</Grid>
```

### 5. Annotate your entities

Add Flagsmith annotations to your `catalog-info.yaml`:

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: my-service
  annotations:
    flagsmith.com/project-id: '12345'
    flagsmith.com/org-id: '67890' # Optional - defaults to first organization
spec:
  type: service
  owner: team-a
```

## Getting your Flagsmith credentials

1. Log in to your [Flagsmith dashboard](https://app.flagsmith.com)
2. Go to **Organisation Settings** > **API Keys**
3. Create or copy your **Admin API Key**
4. Find your **Project ID** and **Organisation ID** in the URL or project settings

## Development

### Prerequisites

- Node.js 22+ (Node 24 has known ESM compatibility issues with Backstage)
- Yarn
- A Backstage application for testing

### Local Development Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/Flagsmith/flagsmith-backstage-plugin.git
   cd flagsmith-backstage-plugin
   ```

2. Install dependencies:

   ```bash
   yarn install
   ```

3. To test in a Backstage app, copy or link the plugin to your Backstage workspace's `plugins/` directory and add it as a workspace dependency.

4. Create `app-config.local.yaml` with your Flagsmith credentials (this file is gitignored).

5. Run the Backstage app:
   ```bash
   yarn start
   ```

### Available Scripts

| Command      | Description                  |
| ------------ | ---------------------------- |
| `yarn start` | Start the development server |
| `yarn build` | Build for production         |
| `yarn test`  | Run tests                    |
| `yarn lint`  | Lint the codebase            |

### Project Structure

```
src/
├── components/          # React components
│   ├── FlagsTab.tsx
│   ├── FlagsmithOverviewCard.tsx
│   └── FlagsmithUsageCard.tsx
├── api/                 # API client (uses Backstage proxy)
│   └── FlagsmithClient.ts
├── plugin.ts            # Frontend plugin definition
└── index.ts             # Package exports
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

Apache-2.0
