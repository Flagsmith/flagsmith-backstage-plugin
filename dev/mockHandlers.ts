import { rest } from 'msw';

// Mock data that represents realistic Flagsmith responses
const mockProject = {
  id: 31465,
  name: 'Demo Project',
  organisation: 24242,
  created_date: '2024-01-15T10:00:00Z',
};

const mockEnvironments = [
  {
    id: 101,
    name: 'Development',
    api_key: 'dev_api_key_123',
    project: 31465,
  },
  {
    id: 102,
    name: 'Staging',
    api_key: 'staging_api_key_456',
    project: 31465,
  },
  {
    id: 103,
    name: 'Production',
    api_key: 'prod_api_key_789',
    project: 31465,
  },
];

const mockFeatures = [
  {
    id: 1001,
    name: 'dark_mode',
    description: 'Enable dark mode theme for the application',
    created_date: '2024-02-01T09:00:00Z',
    project: 31465,
    default_enabled: true,
    type: 'FLAG',
    is_archived: false,
    tags: ['ui', 'theme'],
    owners: [{ id: 1, name: 'John Doe', email: 'john@example.com' }],
  },
  {
    id: 1002,
    name: 'new_checkout_flow',
    description: 'A/B test for the new checkout experience',
    created_date: '2024-03-10T14:30:00Z',
    project: 31465,
    default_enabled: false,
    type: 'FLAG',
    is_archived: false,
    tags: ['checkout', 'experiment'],
    owners: [{ id: 2, name: 'Jane Smith', email: 'jane@example.com' }],
  },
  {
    id: 1003,
    name: 'api_rate_limit',
    description: 'API rate limiting configuration',
    created_date: '2024-01-20T11:15:00Z',
    project: 31465,
    default_enabled: true,
    type: 'CONFIG',
    is_archived: false,
    tags: ['api', 'performance'],
    owners: [],
  },
  {
    id: 1004,
    name: 'beta_features',
    description: 'Enable beta features for selected users',
    created_date: '2024-04-05T16:45:00Z',
    project: 31465,
    default_enabled: false,
    type: 'FLAG',
    is_archived: false,
    tags: ['beta'],
    owners: [{ id: 1, name: 'John Doe', email: 'john@example.com' }],
  },
  {
    id: 1005,
    name: 'maintenance_mode',
    description: 'Put the application in maintenance mode',
    created_date: '2024-02-28T08:00:00Z',
    project: 31465,
    default_enabled: false,
    type: 'FLAG',
    is_archived: false,
    tags: ['ops'],
    owners: [],
  },
];

const mockFeatureVersions: Record<number, any[]> = {
  1001: [
    {
      uuid: 'v1-dark-mode-uuid',
      is_live: true,
      live_from: '2024-02-01T10:00:00Z',
      published: true,
      published_by: 'John Doe',
    },
  ],
  1002: [
    {
      uuid: 'v1-checkout-uuid',
      is_live: true,
      live_from: '2024-03-15T09:00:00Z',
      published: true,
      published_by: 'Jane Smith',
    },
  ],
  1003: [
    {
      uuid: 'v1-rate-limit-uuid',
      is_live: true,
      live_from: '2024-01-21T00:00:00Z',
      published: true,
      published_by: 'System',
    },
  ],
  1004: [
    {
      uuid: 'v1-beta-uuid',
      is_live: true,
      live_from: '2024-04-10T12:00:00Z',
      published: true,
      published_by: 'John Doe',
    },
  ],
  1005: [
    {
      uuid: 'v1-maintenance-uuid',
      is_live: true,
      live_from: '2024-03-01T00:00:00Z',
      published: true,
      published_by: 'Admin',
    },
  ],
};

const mockFeatureStates: Record<string, any[]> = {
  'v1-dark-mode-uuid': [
    { id: 2001, enabled: true, feature_segment: null, feature_state_value: null },
    { id: 2002, enabled: true, feature_segment: 501, feature_state_value: null }, // Segment override
  ],
  'v1-checkout-uuid': [
    { id: 2003, enabled: false, feature_segment: null, feature_state_value: null },
    { id: 2004, enabled: true, feature_segment: 502, feature_state_value: null }, // Beta users segment
  ],
  'v1-rate-limit-uuid': [
    { id: 2005, enabled: true, feature_segment: null, feature_state_value: '1000' },
  ],
  'v1-beta-uuid': [
    { id: 2006, enabled: false, feature_segment: null, feature_state_value: null },
    { id: 2007, enabled: true, feature_segment: 503, feature_state_value: null }, // Beta testers
    { id: 2008, enabled: true, feature_segment: 504, feature_state_value: null }, // Internal users
  ],
  'v1-maintenance-uuid': [
    { id: 2009, enabled: false, feature_segment: null, feature_state_value: null },
  ],
};

const mockUsageData = [
  {
    flags: 15420,
    identities: 3250,
    traits: 8900,
    environment_document: 450,
    day: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    labels: { client_application_name: 'web-app', client_application_version: '1.0.0', user_agent: null },
  },
  {
    flags: 16800,
    identities: 3400,
    traits: 9200,
    environment_document: 480,
    day: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    labels: { client_application_name: 'web-app', client_application_version: '1.0.0', user_agent: null },
  },
  {
    flags: 14200,
    identities: 3100,
    traits: 8500,
    environment_document: 420,
    day: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    labels: { client_application_name: 'web-app', client_application_version: '1.0.0', user_agent: null },
  },
  {
    flags: 17500,
    identities: 3600,
    traits: 9800,
    environment_document: 510,
    day: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    labels: { client_application_name: 'web-app', client_application_version: '1.0.0', user_agent: null },
  },
  {
    flags: 18200,
    identities: 3750,
    traits: 10100,
    environment_document: 530,
    day: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    labels: { client_application_name: 'web-app', client_application_version: '1.0.0', user_agent: null },
  },
  {
    flags: 16900,
    identities: 3500,
    traits: 9400,
    environment_document: 490,
    day: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    labels: { client_application_name: 'web-app', client_application_version: '1.0.0', user_agent: null },
  },
  {
    flags: 15800,
    identities: 3300,
    traits: 9000,
    environment_document: 460,
    day: new Date().toISOString().split('T')[0],
    labels: { client_application_name: 'web-app', client_application_version: '1.0.0', user_agent: null },
  },
];

export const handlers = [
  // Get project
  rest.get('*/proxy/flagsmith/projects/:projectId/', (req, res, ctx) => {
    return res(ctx.json(mockProject));
  }),

  // Get project environments
  rest.get('*/proxy/flagsmith/projects/:projectId/environments/', (req, res, ctx) => {
    return res(ctx.json({ results: mockEnvironments }));
  }),

  // Get project features
  rest.get('*/proxy/flagsmith/projects/:projectId/features/', (req, res, ctx) => {
    return res(ctx.json({ results: mockFeatures }));
  }),

  // Get feature versions (lazy loading)
  rest.get('*/proxy/flagsmith/environments/:envId/features/:featureId/versions/', (req, res, ctx) => {
    const featureId = parseInt(req.params.featureId as string, 10);
    const versions = mockFeatureVersions[featureId] || [];
    return res(ctx.json({ results: versions }));
  }),

  // Get feature states (lazy loading)
  rest.get('*/proxy/flagsmith/environments/:envId/features/:featureId/versions/:versionUuid/featurestates/', (req, res, ctx) => {
    const versionUuid = req.params.versionUuid as string;
    const states = mockFeatureStates[versionUuid] || [];
    return res(ctx.json(states));
  }),

  // Get usage data
  rest.get('*/proxy/flagsmith/organisations/:orgId/usage-data/', (req, res, ctx) => {
    return res(ctx.json(mockUsageData));
  }),
];
