import { DiscoveryApi, FetchApi } from '@backstage/core-plugin-api';

export interface FlagsmithOrganization {
  id: number;
  name: string;
  created_date: string;
  // Add more fields as needed
}

export interface FlagsmithProject {
  id: number;
  name: string;
  organisation: number;
  created_date: string;
  // Add more fields as needed
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
  environment_state: Array<{
    id: number;
    enabled: boolean;
  }>;
  num_segment_overrides?: number | null;
  num_identity_overrides?: number | null;
  live_version: {
    is_live: boolean;
    live_from?: string | null;
    published: boolean;
    published_by?: string | null;
  };
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
    return await this.discoveryApi.getBaseUrl('flagsmith');
  }

  async getOrganizations(): Promise<FlagsmithOrganization[]> {
    const baseUrl = await this.getBaseUrl();
    const response = await this.fetchApi.fetch(`${baseUrl}/organizations`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch organizations: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.results || data; // Handle paginated vs non-paginated responses
  }

  async getProjectsInOrg(orgId: number): Promise<FlagsmithProject[]> {
    const baseUrl = await this.getBaseUrl();
    const response = await this.fetchApi.fetch(`${baseUrl}/organizations/${orgId}/projects`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.results || data;
  }

  async getProjectFeatures(projectId: string): Promise<FlagsmithFeature[]> {
    const baseUrl = await this.getBaseUrl();
    const response = await this.fetchApi.fetch(`${baseUrl}/projects/${projectId}/features`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch features: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.results || data;
  }

  async getEnvironmentFeatures(environmentId: number, projectId: string): Promise<FlagsmithFeature[]> {
    const baseUrl = await this.getBaseUrl();
    const response = await this.fetchApi.fetch(`${baseUrl}/projects/${projectId}/environments/${environmentId}/features`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch environment features: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.results || data;
  }

  async getProjectEnvironments(projectId: number): Promise<FlagsmithEnvironment[]> {
    const baseUrl = await this.getBaseUrl();
    const response = await this.fetchApi.fetch(`${baseUrl}/projects/${projectId}/environments`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch environments: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.results || data;
  }

  async getProject(projectId: number): Promise<FlagsmithProject> {
    const baseUrl = await this.getBaseUrl();
    const response = await this.fetchApi.fetch(`${baseUrl}/projects/${projectId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch project: ${response.statusText}`);
    }

    return await response.json();
  }

  async getUsageData(orgId: number, projectId?: number, period: string = '30_day_period'): Promise<FlagsmithUsageData[]> {
    const baseUrl = await this.getBaseUrl();
    let url = `${baseUrl}/organizations/${orgId}/usage-data?period=${period}`;
    if (projectId) {
      url += `&project_id=${projectId}`;
    }

    const response = await this.fetchApi.fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch usage data: ${response.statusText}`);
    }

    return await response.json();
  }
}