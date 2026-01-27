import { DiscoveryApi, FetchApi } from '@backstage/core-plugin-api';

export interface FlagsmithOrganization {
  id: number;
  name: string;
  created_date: string;
}

export interface FlagsmithProject {
  id: number;
  name: string;
  organisation: number;
  created_date: string;
}

export interface FlagsmithEnvironment {
  id: number;
  name: string;
  api_key: string;
  project: number;
  use_v2_feature_versioning?: boolean;
}

export interface FlagsmithFeature {
  id: number;
  name: string;
  description?: string;
  created_date: string;
  project: number;
  environment_state?: Array<{
    id: number;
    enabled: boolean;
    feature_segment?: number | null;
  }> | null;
  num_segment_overrides?: number | null;
  num_identity_overrides?: number | null;
  live_version?: {
    is_live: boolean;
    live_from?: string | null;
    published: boolean;
    published_by?: string | null;
    uuid?: string;
  } | null;
  owners?: Array<{
    id: number;
    name: string;
    email: string;
  }>;
  group_owners?: Array<{
    id: number;
    name: string;
  }>;
  created_by?: {
    id: number;
    email: string;
    first_name?: string;
    last_name?: string;
  } | null;
  tags?: Array<string>;
  is_server_key_only?: boolean;
  type?: string;
  default_enabled?: boolean;
  is_archived?: boolean;
  initial_value?: string | null;
  multivariate_options?: Array<{
    id: number;
    type: string;
    integer_value?: number | null;
    string_value?: string | null;
    boolean_value?: boolean | null;
    default_percentage_allocation: number;
  }>;
}

export interface FlagsmithFeatureVersion {
  uuid: string;
  is_live: boolean;
  live_from?: string | null;
  published: boolean;
  published_by?: string | null;
}

export interface FlagsmithFeatureStateValue {
  string_value?: string | null;
  integer_value?: number | null;
  boolean_value?: boolean | null;
}

export interface FlagsmithFeatureSegment {
  segment: number;
  priority: number;
}

export interface FlagsmithFeatureState {
  id: number;
  enabled: boolean;
  environment?: number;
  feature_segment?: FlagsmithFeatureSegment | null;
  feature_state_value?: FlagsmithFeatureStateValue | null;
  updated_at?: string | null;
}

export interface FlagsmithFeatureDetails {
  liveVersion: FlagsmithFeatureVersion | null;
  featureState: FlagsmithFeatureState[] | null;
  segmentOverrides: number;
  scheduledVersion: FlagsmithFeatureVersion | null;
}

export interface FlagsmithUsageData {
  flags: number | null;
  identities: number;
  traits: number;
  environment_document: number;
  day: string;
  labels: {
    client_application_name: string | null;
    client_application_version: string | null;
    user_agent: string | null;
  };
}

export class FlagsmithClient {
  constructor(
    private readonly discoveryApi: DiscoveryApi,
    private readonly fetchApi: FetchApi,
  ) {}

  private async getBaseUrl(): Promise<string> {
    const proxyUrl = await this.discoveryApi.getBaseUrl('proxy');
    return `${proxyUrl}/flagsmith`;
  }

  async getOrganizations(): Promise<FlagsmithOrganization[]> {
    const baseUrl = await this.getBaseUrl();
    const response = await this.fetchApi.fetch(`${baseUrl}/organisations/`);

    if (!response.ok) {
      throw new Error(`Failed to fetch organizations: ${response.statusText}`);
    }

    const data = await response.json();
    return data.results || data;
  }

  async getProjectsInOrg(orgId: number): Promise<FlagsmithProject[]> {
    const baseUrl = await this.getBaseUrl();
    const response = await this.fetchApi.fetch(
      `${baseUrl}/organisations/${orgId}/projects/`,
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }

    const data = await response.json();
    return data.results || data;
  }

  async getProjectFeatures(projectId: string): Promise<FlagsmithFeature[]> {
    const baseUrl = await this.getBaseUrl();
    const response = await this.fetchApi.fetch(
      `${baseUrl}/projects/${projectId}/features/`,
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch features: ${response.statusText}`);
    }

    const data = await response.json();
    return data.results || data;
  }

  async getProjectEnvironments(
    projectId: number,
  ): Promise<FlagsmithEnvironment[]> {
    const baseUrl = await this.getBaseUrl();
    const response = await this.fetchApi.fetch(
      `${baseUrl}/projects/${projectId}/environments/`,
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch environments: ${response.statusText}`);
    }

    const data = await response.json();
    return data.results || data;
  }

  async getProject(projectId: number): Promise<FlagsmithProject> {
    const baseUrl = await this.getBaseUrl();
    const response = await this.fetchApi.fetch(
      `${baseUrl}/projects/${projectId}/`,
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch project: ${response.statusText}`);
    }

    return await response.json();
  }

  async getUsageData(
    orgId: number,
    projectId?: number,
    environmentId?: number,
  ): Promise<FlagsmithUsageData[]> {
    const baseUrl = await this.getBaseUrl();
    const url = new URL(`${baseUrl}/organisations/${orgId}/usage-data/`);
    if (projectId) {
      url.searchParams.set('project_id', projectId.toString());
    }
    if (environmentId) {
      url.searchParams.set('environment_id', environmentId.toString());
    }

    const response = await this.fetchApi.fetch(url.toString());

    if (!response.ok) {
      throw new Error(`Failed to fetch usage data: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Fetch usage data for multiple environments in parallel
   */
  async getUsageDataByEnvironments(
    orgId: number,
    projectId: number,
    environments: Pick<FlagsmithEnvironment, 'id' | 'name'>[],
  ): Promise<Map<string, FlagsmithUsageData[]>> {
    const results = new Map<string, FlagsmithUsageData[]>();

    // Fetch usage data for each environment in parallel
    const promises = environments.map(async env => {
      try {
        const data = await this.getUsageData(orgId, projectId, env.id);
        return { envName: env.name, data };
      } catch {
        // If environment-level filtering isn't supported, return empty
        return { envName: env.name, data: [] };
      }
    });

    const responses = await Promise.all(promises);
    responses.forEach(({ envName, data }) => {
      results.set(envName, data);
    });

    return results;
  }

  // Lazy loading methods for feature details
  async getFeatureVersions(
    environmentId: number,
    featureId: number,
  ): Promise<FlagsmithFeatureVersion[]> {
    const baseUrl = await this.getBaseUrl();
    const response = await this.fetchApi.fetch(
      `${baseUrl}/environments/${environmentId}/features/${featureId}/versions/`,
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch feature versions: ${response.statusText}`,
      );
    }

    const data = await response.json();
    return data.results || data;
  }

  async getFeatureStates(
    environmentId: number,
    featureId: number,
    versionUuid: string,
  ): Promise<FlagsmithFeatureState[]> {
    const baseUrl = await this.getBaseUrl();
    const response = await this.fetchApi.fetch(
      `${baseUrl}/environments/${environmentId}/features/${featureId}/versions/${versionUuid}/featurestates/`,
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch feature states: ${response.statusText}`);
    }

    return await response.json();
  }

  // Helper to load full feature details (called on accordion expand)
  async getFeatureDetails(
    environmentId: number,
    featureId: number,
  ): Promise<FlagsmithFeatureDetails> {
    const versions = await this.getFeatureVersions(environmentId, featureId);
    const liveVersion = versions.find(v => v.is_live) || null;

    // Find scheduled version (future live_from date, not yet live)
    const now = new Date();
    const scheduledVersion = versions.find(v =>
      !v.is_live &&
      v.live_from &&
      new Date(v.live_from) > now
    ) || null;

    let featureState: FlagsmithFeatureState[] | null = null;
    let segmentOverrides = 0;

    if (liveVersion) {
      featureState = await this.getFeatureStates(
        environmentId,
        featureId,
        liveVersion.uuid,
      );
      segmentOverrides = (featureState || []).filter(
        s => s.feature_segment !== null,
      ).length;
    }

    return {
      liveVersion,
      featureState,
      segmentOverrides,
      scheduledVersion,
    };
  }
}
