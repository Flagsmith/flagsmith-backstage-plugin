import { createDevApp } from '@backstage/dev-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { Entity } from '@backstage/catalog-model';
import { setupWorker } from 'msw';
import { PropsWithChildren } from 'react';
import { flagsmithPlugin, FlagsTab, FlagsmithOverviewCard, FlagsmithUsageCard } from '../src';
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
      'flagsmith.com/org-id': '24242',
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
  .registerPlugin(flagsmithPlugin)
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
  .render();
