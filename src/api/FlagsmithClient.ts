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
  tags?: Array<string>;
  is_server_key_only?: boolean;
  type?: string;
  default_enabled?: boolean;
  is_archived?: boolean;
}

export interface FlagsmithFeatureVersion {
  uuid: string;
  is_live: boolean;
  live_from?: string | null;
  published: boolean;
  published_by?: string | null;
}

export interface FlagsmithFeatureState {
  id: number;
  enabled: boolean;
  feature_segment?: number | null;
  feature_state_value?: string | null;
}

export interface FlagsmithFeatureDetails {
  liveVersion: FlagsmithFeatureVersion | null;
  featureState: FlagsmithFeatureState[] | null;
  segmentOverrides: number;
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

  async getEnvironmentFeatures(
    _environmentId: number,
    projectId: string,
  ): Promise<FlagsmithFeature[]> {
    // With proxy approach, we just get project features
    // Details are loaded lazily on accordion expand
    return this.getProjectFeatures(projectId);
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
  ): Promise<FlagsmithUsageData[]> {
    const baseUrl = await this.getBaseUrl();
    let url = `${baseUrl}/organisations/${orgId}/usage-data/`;
    if (projectId) {
      url += `?project_id=${projectId}`;
    }

    const response = await this.fetchApi.fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch usage data: ${response.statusText}`);
    }

    return await response.json();
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
    };
  }
}
