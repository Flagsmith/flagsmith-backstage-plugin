import { PropsWithChildren } from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { Entity } from '@backstage/catalog-model';
import { Box, Grid } from '@material-ui/core';
import { setupWorker } from 'msw';
import { FlagsTab } from '../src/components/FlagsTab';
import { FlagsmithOverviewCard } from '../src/components/FlagsmithOverviewCard';
import { FlagsmithUsageCard } from '../src/components/FlagsmithUsageCard';
import { handlers } from './mockHandlers';

// Start MSW worker for API mocking
const worker = setupWorker(...handlers);
worker.start({
  onUnhandledRequest: 'bypass',
});

// Mock entity with Flagsmith annotations
const mockEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'demo-service',
    description: 'A demo service with Flagsmith feature flags integration',
    annotations: {
      'flagsmith.com/project-id': '31465',
    },
  },
  spec: {
    type: 'service',
    lifecycle: 'production',
    owner: 'guests',
  },
};

// Wrapper component to provide entity context
const EntityWrapper = ({ children }: PropsWithChildren<{}>) => (
  <EntityProvider entity={mockEntity}>{children}</EntityProvider>
);

createDevApp()
  .addPage({
    element: (
      <EntityWrapper>
        <FlagsTab />
      </EntityWrapper>
    ),
    title: 'Feature Flags',
    path: '/flagsmith',
  })
  .addPage({
    element: (
      <EntityWrapper>
        <div style={{ padding: 20, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 400px', maxWidth: 600 }}>
            <FlagsmithOverviewCard />
          </div>
          <div style={{ flex: '1 1 400px', maxWidth: 600 }}>
            <FlagsmithUsageCard />
          </div>
        </div>
      </EntityWrapper>
    ),
    title: 'Overview Cards',
    path: '/flagsmith-cards',
  })
  .addPage({
    element: (
      <EntityWrapper>
        <Box p={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FlagsmithOverviewCard />
            </Grid>
            <Grid item xs={12} md={6}>
              <FlagsmithUsageCard />
            </Grid>
          </Grid>
          <Box mt={3}>
            <FlagsTab />
          </Box>
        </Box>
      </EntityWrapper>
    ),
    title: 'Complete View',
    path: '/flagsmith-complete',
  })
  .render();
