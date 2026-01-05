import type {
  FlagsmithProject,
  FlagsmithEnvironment,
  FlagsmithFeature,
  FlagsmithUsageData,
  FlagsmithFeatureVersion,
  FlagsmithFeatureState,
  FlagsmithOrganization,
} from '../../api/FlagsmithClient';

export const mockOrganization: FlagsmithOrganization = {
  id: 1,
  name: 'Test Organization',
  created_date: '2024-01-01T00:00:00Z',
};

export const mockProject: FlagsmithProject = {
  id: 123,
  name: 'Test Project',
  organisation: 1,
  created_date: '2024-01-01T00:00:00Z',
};

export const mockEnvironments: FlagsmithEnvironment[] = [
  {
    id: 1,
    name: 'Development',
    api_key: 'dev-api-key',
    project: 123,
  },
  {
    id: 2,
    name: 'Production',
    api_key: 'prod-api-key',
    project: 123,
  },
];

export const mockFeatures: FlagsmithFeature[] = [
  {
    id: 1,
    name: 'feature-one',
    description: 'First test feature',
    created_date: '2024-01-15T10:00:00Z',
    project: 123,
    default_enabled: true,
    type: 'FLAG',
    environment_state: [
      { id: 1, enabled: true, feature_segment: null },
      { id: 2, enabled: false, feature_segment: null },
    ],
    num_segment_overrides: 2,
    num_identity_overrides: 0,
    live_version: {
      is_live: true,
      live_from: '2024-01-15T10:00:00Z',
      published: true,
      published_by: 'user@example.com',
      uuid: 'version-uuid-1',
    },
  },
  {
    id: 2,
    name: 'feature-two',
    description: 'Second test feature',
    created_date: '2024-02-01T12:00:00Z',
    project: 123,
    default_enabled: false,
    type: 'CONFIG',
    environment_state: [
      { id: 1, enabled: false, feature_segment: null },
      { id: 2, enabled: false, feature_segment: null },
    ],
    num_segment_overrides: 0,
    num_identity_overrides: 1,
  },
  {
    id: 3,
    name: 'feature-three',
    created_date: '2024-03-01T08:00:00Z',
    project: 123,
    default_enabled: true,
    type: 'FLAG',
  },
];

export const mockFeatureVersions: FlagsmithFeatureVersion[] = [
  {
    uuid: 'version-uuid-1',
    is_live: true,
    live_from: '2024-01-15T10:00:00Z',
    published: true,
    published_by: 'user@example.com',
  },
  {
    uuid: 'version-uuid-2',
    is_live: false,
    live_from: null,
    published: false,
    published_by: null,
  },
];

export const mockFeatureStates: FlagsmithFeatureState[] = [
  {
    id: 1,
    enabled: true,
    environment: 1,
    feature_segment: null,
    feature_state_value: {
      string_value: 'test-value',
      integer_value: null,
      boolean_value: null,
    },
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 2,
    enabled: true,
    environment: 1,
    feature_segment: { segment: 100, priority: 1 },
    feature_state_value: {
      string_value: 'segment-value',
      integer_value: null,
      boolean_value: null,
    },
    updated_at: '2024-01-16T10:00:00Z',
  },
];

export const mockUsageData: FlagsmithUsageData[] = [
  {
    flags: 100,
    identities: 50,
    traits: 25,
    environment_document: 10,
    day: '2024-01-01',
    labels: {
      client_application_name: 'test-app',
      client_application_version: '1.0.0',
      user_agent: 'test-agent',
    },
  },
  {
    flags: 150,
    identities: 75,
    traits: 30,
    environment_document: 15,
    day: '2024-01-02',
    labels: {
      client_application_name: 'test-app',
      client_application_version: '1.0.0',
      user_agent: 'test-agent',
    },
  },
  {
    flags: 200,
    identities: 100,
    traits: 50,
    environment_document: 20,
    day: '2024-01-03',
    labels: {
      client_application_name: null,
      client_application_version: null,
      user_agent: null,
    },
  },
];

// Feature with no environment state (uses default_enabled)
export const mockFeatureNoEnvState: FlagsmithFeature = {
  id: 100,
  name: 'no-env-state-feature',
  created_date: '2024-01-01T00:00:00Z',
  project: 123,
  default_enabled: true,
};

// Feature with null environment state
export const mockFeatureNullEnvState: FlagsmithFeature = {
  id: 101,
  name: 'null-env-state-feature',
  created_date: '2024-01-01T00:00:00Z',
  project: 123,
  default_enabled: false,
  environment_state: null,
};

// Empty arrays for edge case testing
export const emptyFeatures: FlagsmithFeature[] = [];
export const emptyEnvironments: FlagsmithEnvironment[] = [];
export const emptyUsageData: FlagsmithUsageData[] = [];
