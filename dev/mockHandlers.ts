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
    use_v2_feature_versioning: true,
  },
  {
    id: 102,
    name: 'Staging',
    api_key: 'staging_api_key_456',
    project: 31465,
    use_v2_feature_versioning: true,
  },
  {
    id: 103,
    name: 'Production',
    api_key: 'prod_api_key_789',
    project: 31465,
    use_v2_feature_versioning: false, // Production still on v1
  },
];

// Mock tags for the project
const mockTags = [
  { id: 1, label: 'ui', color: '#2196F3' },
  { id: 2, label: 'theme', color: '#9C27B0' },
  { id: 3, label: 'checkout', color: '#4CAF50' },
  { id: 4, label: 'experiment', color: '#FF9800' },
  { id: 5, label: 'api', color: '#F44336' },
  { id: 6, label: 'performance', color: '#00BCD4' },
  { id: 7, label: 'beta', color: '#E91E63' },
  { id: 8, label: 'ops', color: '#795548' },
  { id: 9, label: 'notifications', color: '#607D8B' },
  { id: 10, label: 'v2', color: '#3F51B5' },
  { id: 11, label: 'payments', color: '#8BC34A' },
  { id: 12, label: 'integration', color: '#FFEB3B' },
  { id: 13, label: 'cache', color: '#009688' },
  { id: 14, label: 'analytics', color: '#673AB7' },
  { id: 15, label: 'onboarding', color: '#CDDC39' },
  { id: 16, label: 'ux', color: '#FF5722' },
  { id: 17, label: 'search', color: '#03A9F4' },
  { id: 18, label: 'v3', color: '#FFC107' },
  { id: 19, label: 'ai', color: '#9E9E9E' },
  { id: 20, label: 'recommendations', color: '#00E676' },
  { id: 21, label: 'export', color: '#651FFF' },
  { id: 22, label: 'bulk', color: '#1DE9B6' },
  { id: 23, label: 'admin', color: '#D500F9' },
  { id: 24, label: 'security', color: '#C51162' },
  { id: 25, label: 'audit', color: '#304FFE' },
  { id: 26, label: 'unique', color: '#64DD17' },
  { id: 27, label: 'page2', color: '#FFAB00' },
];

// Feature name templates for generating mock data
const featureTemplates = [
  { name: 'dark_mode', desc: 'Enable dark mode theme for the application', tags: [1, 2], type: 'FLAG' },
  { name: 'new_checkout_flow', desc: 'A/B test for the new checkout experience', tags: [3, 4], type: 'FLAG' },
  { name: 'api_rate_limit', desc: 'API rate limiting configuration', tags: [5, 6], type: 'CONFIG' },
  { name: 'beta_features', desc: 'Enable beta features for selected users', tags: [7], type: 'FLAG' },
  { name: 'maintenance_mode', desc: 'Put the application in maintenance mode', tags: [8], type: 'FLAG' },
  { name: 'notifications_v2', desc: 'New notification system', tags: [9, 10], type: 'FLAG' },
  { name: 'payment_gateway', desc: 'Enable new payment gateway integration', tags: [11, 12], type: 'FLAG' },
  { name: 'cache_ttl', desc: 'Cache time-to-live configuration', tags: [13, 6], type: 'CONFIG' },
  { name: 'feature_analytics', desc: 'Track feature usage analytics', tags: [14], type: 'FLAG' },
  { name: 'user_onboarding', desc: 'New user onboarding flow', tags: [15, 16], type: 'FLAG' },
  { name: 'search_v3', desc: 'Enhanced search functionality', tags: [17, 18], type: 'FLAG' },
  { name: 'recommendation_engine', desc: 'AI-powered recommendations', tags: [19, 20], type: 'FLAG' },
  { name: 'export_csv', desc: 'Enable CSV export functionality', tags: [21], type: 'FLAG' },
  { name: 'bulk_operations', desc: 'Enable bulk edit operations', tags: [22, 23], type: 'FLAG' },
  { name: 'audit_logging', desc: 'Enhanced audit logging', tags: [24, 25], type: 'FLAG' },
];

// Generate 55 mock features
const generateMockFeatures = () => {
  const features = [];
  for (let i = 0; i < 55; i++) {
    const template = featureTemplates[i % featureTemplates.length];
    const suffix = i < featureTemplates.length ? '' : `_${Math.floor(i / featureTemplates.length) + 1}`;
    const id = 1001 + i;
    const daysAgo = Math.floor(Math.random() * 365);
    const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    // Determine initial_value for CONFIG type features
    const configValues = ['100', 'enabled', '{"key": "value"}'];
    const initialValue = template.type === 'CONFIG' ? configValues[i % 3] : null;

    // Add multivariate options for a few features
    const multivariateOptions = i === 5 ? [
      { id: 1, type: 'string', string_value: 'variant_a', integer_value: null, boolean_value: null, default_percentage_allocation: 50 },
      { id: 2, type: 'string', string_value: 'variant_b', integer_value: null, boolean_value: null, default_percentage_allocation: 50 },
    ] : undefined;

    features.push({
      id,
      name: `${template.name}${suffix}`,
      description: template.desc,
      created_date: date.toISOString(),
      project: 31465,
      default_enabled: Math.random() > 0.5,
      type: template.type,
      is_archived: i === 10, // One archived flag for demo
      is_server_key_only: i === 15, // One server-side only flag for demo
      tags: template.tags,
      owners: i % 3 === 0 ? [{ id: 1, name: 'John Doe', email: 'john@example.com' }] : [],
      group_owners: i % 5 === 0 ? [{ id: 1, name: 'Engineering Team' }] : [],
      created_by: { id: 1, email: 'creator@example.com', first_name: 'Alice', last_name: 'Smith' },
      num_segment_overrides: Math.floor(Math.random() * 5),
      num_identity_overrides: Math.floor(Math.random() * 20),
      initial_value: initialValue,
      multivariate_options: multivariateOptions,
      environment_state: [
        { id: 101, enabled: Math.random() > 0.3 },
        { id: 102, enabled: Math.random() > 0.4 },
        { id: 103, enabled: Math.random() > 0.6 },
      ],
    });
  }

  // Add a special feature on "page 2" (index 51) that's easy to search for
  features[51] = {
    id: 9999,
    name: 'zebra_stripe_mode',
    description: 'A unique feature on page 2 - search for "zebra" to find it',
    created_date: '2024-06-15T10:00:00Z',
    project: 31465,
    default_enabled: true,
    type: 'FLAG',
    is_archived: false,
    is_server_key_only: false,
    tags: [26, 27],
    owners: [{ id: 2, name: 'Jane Smith', email: 'jane@example.com' }],
    num_segment_overrides: 1,
    num_identity_overrides: 3,
    environment_state: [
      { id: 101, enabled: true },
      { id: 102, enabled: true },
      { id: 103, enabled: false },
    ],
  };

  return features;
};

const mockFeatures = generateMockFeatures();

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

// Generate usage data for each environment with distinct values (0-500 range)
const generateUsageData = (envId: number) => {
  // Different data patterns per environment to make lines visually distinct
  const envData: Record<number, number[]> = {
    101: [50, 80, 65, 95, 120, 90, 75],      // Development - lowest, volatile (50-120)
    102: [150, 170, 180, 200, 195, 210, 185], // Staging - medium range (150-210)
    103: [350, 380, 360, 420, 400, 450, 410], // Production - highest, stable (350-450)
  };
  const flags = envData[envId] || [200, 220, 210, 240, 230, 250, 220];

  return Array.from({ length: 7 }, (_, i) => ({
    flags: flags[i],
    identities: Math.round(flags[i] * 0.2),
    traits: Math.round(flags[i] * 0.5),
    environment_document: Math.round(flags[i] * 0.03),
    day: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    labels: { client_application_name: 'web-app', client_application_version: '1.0.0', user_agent: null },
  }));
};

// Default usage data (for requests without environment_id)
const mockUsageData = generateUsageData(103);

export const handlers = [
  // Get project
  rest.get('*/proxy/flagsmith/projects/:projectId/', (req, res, ctx) => {
    return res(ctx.json(mockProject));
  }),

  // Get project environments
  rest.get('*/proxy/flagsmith/projects/:projectId/environments/', (req, res, ctx) => {
    return res(ctx.json({ results: mockEnvironments }));
  }),

  // Get project tags
  rest.get('*/proxy/flagsmith/projects/:projectId/tags/', (req, res, ctx) => {
    return res(ctx.json({ results: mockTags }));
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

  // Get usage data - returns different data per environment
  rest.get('*/proxy/flagsmith/organisations/:orgId/usage-data/', (req, res, ctx) => {
    const environmentId = req.url.searchParams.get('environment_id');
    if (environmentId) {
      return res(ctx.json(generateUsageData(parseInt(environmentId, 10))));
    }
    return res(ctx.json(mockUsageData));
  }),
];
