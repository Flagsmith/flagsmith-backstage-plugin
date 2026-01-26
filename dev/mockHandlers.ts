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
    num_segment_overrides: 1,
    num_identity_overrides: 5,
    // Multi-environment status
    environment_state: [
      { id: 101, enabled: true },   // Dev - enabled
      { id: 102, enabled: true },   // Staging - enabled
      { id: 103, enabled: false },  // Prod - disabled (not yet rolled out)
    ],
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
    num_segment_overrides: 2,
    num_identity_overrides: 0,
    environment_state: [
      { id: 101, enabled: true },   // Dev - enabled
      { id: 102, enabled: false },  // Staging - disabled
      { id: 103, enabled: false },  // Prod - disabled
    ],
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
    num_segment_overrides: 0,
    num_identity_overrides: 0,
    environment_state: [
      { id: 101, enabled: true },   // Dev - enabled
      { id: 102, enabled: true },   // Staging - enabled
      { id: 103, enabled: true },   // Prod - enabled
    ],
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
    num_segment_overrides: 3,
    num_identity_overrides: 12,
    environment_state: [
      { id: 101, enabled: true },   // Dev - enabled
      { id: 102, enabled: true },   // Staging - enabled
      { id: 103, enabled: true },   // Prod - enabled (for beta users only via segment)
    ],
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
    num_segment_overrides: 0,
    num_identity_overrides: 0,
    environment_state: [
      { id: 101, enabled: false },  // Dev - disabled
      { id: 102, enabled: false },  // Staging - disabled
      { id: 103, enabled: false },  // Prod - disabled
    ],
  },
];

// Helper to create a future date (7 days from now)
const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

const mockFeatureVersions: Record<number, any[]> = {
  1001: [
    {
      uuid: 'v1-dark-mode-uuid',
      is_live: true,
      live_from: '2024-02-01T10:00:00Z',
      published: true,
      published_by: 'John Doe',
    },
    // Scheduled change for dark_mode - goes live in 7 days
    {
      uuid: 'v2-dark-mode-uuid',
      is_live: false,
      live_from: futureDate,
      published: true,
      published_by: 'Jane Smith',
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
    {
      id: 2001,
      enabled: true,
      environment: 101,
      feature_segment: null,
      feature_state_value: { string_value: 'dark', integer_value: null, boolean_value: null },
      updated_at: '2024-12-01T10:00:00Z',
    },
    {
      id: 2002,
      enabled: true,
      environment: 101,
      feature_segment: { segment: 501, priority: 1 },
      feature_state_value: { string_value: 'auto', integer_value: null, boolean_value: null },
      updated_at: '2024-12-05T14:30:00Z',
    },
  ],
  'v1-checkout-uuid': [
    {
      id: 2003,
      enabled: false,
      environment: 101,
      feature_segment: null,
      feature_state_value: null,
      updated_at: '2024-03-15T09:00:00Z',
    },
    {
      id: 2004,
      enabled: true,
      environment: 101,
      feature_segment: { segment: 502, priority: 1 },
      feature_state_value: { string_value: null, integer_value: null, boolean_value: true },
      updated_at: '2024-03-20T11:00:00Z',
    },
  ],
  'v1-rate-limit-uuid': [
    {
      id: 2005,
      enabled: true,
      environment: 101,
      feature_segment: null,
      feature_state_value: { string_value: null, integer_value: 1000, boolean_value: null },
      updated_at: '2024-01-21T00:00:00Z',
    },
  ],
  'v1-beta-uuid': [
    {
      id: 2006,
      enabled: false,
      environment: 101,
      feature_segment: null,
      feature_state_value: null,
      updated_at: '2024-04-05T16:45:00Z',
    },
    {
      id: 2007,
      enabled: true,
      environment: 101,
      feature_segment: { segment: 503, priority: 1 },
      feature_state_value: null,
      updated_at: '2024-04-10T12:00:00Z',
    },
    {
      id: 2008,
      enabled: true,
      environment: 101,
      feature_segment: { segment: 504, priority: 2 },
      feature_state_value: null,
      updated_at: '2024-04-12T09:00:00Z',
    },
  ],
  'v1-maintenance-uuid': [
    {
      id: 2009,
      enabled: false,
      environment: 101,
      feature_segment: null,
      feature_state_value: { string_value: 'Scheduled maintenance', integer_value: null, boolean_value: null },
      updated_at: '2024-02-28T08:00:00Z',
    },
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
