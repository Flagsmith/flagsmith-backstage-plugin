import { createElement } from 'react';
import { createFrontendPlugin } from '@backstage/frontend-plugin-api';
import {
  EntityContentBlueprint,
  EntityCardBlueprint,
} from '@backstage/plugin-catalog-react/alpha';

/**
 * Entity content (tab) for FlagsTab - displays feature flags for an entity
 * Requires annotation: flagsmith.com/project-id
 */
const flagsTabContent = EntityContentBlueprint.make({
  name: 'flags',
  params: {
    path: '/flagsmith',
    title: 'Feature Flags',
    filter: 'has:annotation:flagsmith.com/project-id',
    loader: () =>
      import('./components/FlagsTab').then(m => createElement(m.FlagsTab)),
  },
});

/**
 * Entity card for FlagsmithOverviewCard - shows flag overview in entity page
 * Requires annotation: flagsmith.com/project-id
 */
const overviewCard = EntityCardBlueprint.make({
  name: 'overview',
  params: {
    filter: 'has:annotation:flagsmith.com/project-id',
    loader: () =>
      import('./components/FlagsmithOverviewCard').then(m =>
        createElement(m.FlagsmithOverviewCard),
      ),
  },
});

/**
 * Entity card for FlagsmithUsageCard - shows 30-day usage analytics
 * Requires annotations: flagsmith.com/project-id, flagsmith.com/org-id
 */
const usageCard = EntityCardBlueprint.make({
  name: 'usage',
  params: {
    filter: 'has:annotation:flagsmith.com/project-id,flagsmith.com/org-id',
    loader: () =>
      import('./components/FlagsmithUsageCard').then(m =>
        createElement(m.FlagsmithUsageCard),
      ),
  },
});

/**
 * Flagsmith plugin for Backstage's new frontend system.
 *
 * This plugin provides:
 * - Entity content tab showing feature flags
 * - Overview card for entity pages
 * - Usage analytics card
 */
const flagsmithPlugin = createFrontendPlugin({
  pluginId: 'flagsmith',
  extensions: [flagsTabContent, overviewCard, usageCard],
});

export default flagsmithPlugin;
export { flagsmithPlugin };

// Export components for users who need direct access
export { FlagsTab } from './components/FlagsTab';
export { FlagsmithOverviewCard } from './components/FlagsmithOverviewCard';
export { FlagsmithUsageCard } from './components/FlagsmithUsageCard';
