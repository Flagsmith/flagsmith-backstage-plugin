import { FlagsmithClient } from './FlagsmithClient';
import {
  mockOrganization,
  mockProject,
  mockEnvironments,
  mockFeatures,
  mockUsageData,
  mockFeatureVersions,
  mockFeatureStates,
} from '../__tests__/fixtures';

describe('FlagsmithClient', () => {
  let client: FlagsmithClient;
  let mockDiscoveryApi: { getBaseUrl: jest.Mock };
  let mockFetchApi: { fetch: jest.Mock };

  beforeEach(() => {
    mockDiscoveryApi = {
      getBaseUrl: jest.fn().mockResolvedValue('http://localhost:7007/api/proxy'),
    };
    mockFetchApi = {
      fetch: jest.fn(),
    };
    client = new FlagsmithClient(mockDiscoveryApi, mockFetchApi);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getOrganizations', () => {
    it('fetches organizations successfully', async () => {
      mockFetchApi.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ results: [mockOrganization] }),
      });

      const result = await client.getOrganizations();

      expect(mockDiscoveryApi.getBaseUrl).toHaveBeenCalledWith('proxy');
      expect(mockFetchApi.fetch).toHaveBeenCalledWith(
        'http://localhost:7007/api/proxy/flagsmith/organisations/',
      );
      expect(result).toEqual([mockOrganization]);
    });

    it('handles response without results wrapper', async () => {
      mockFetchApi.fetch.mockResolvedValue({
        ok: true,
        json: async () => [mockOrganization],
      });

      const result = await client.getOrganizations();

      expect(result).toEqual([mockOrganization]);
    });

    it('throws error on failed response', async () => {
      mockFetchApi.fetch.mockResolvedValue({
        ok: false,
        statusText: 'Unauthorized',
      });

      await expect(client.getOrganizations()).rejects.toThrow(
        'Failed to fetch organizations: Unauthorized',
      );
    });
  });

  describe('getProjectsInOrg', () => {
    it('fetches projects for organization', async () => {
      mockFetchApi.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ results: [mockProject] }),
      });

      const result = await client.getProjectsInOrg(1);

      expect(mockFetchApi.fetch).toHaveBeenCalledWith(
        'http://localhost:7007/api/proxy/flagsmith/organisations/1/projects/',
      );
      expect(result).toEqual([mockProject]);
    });

    it('throws error on failed response', async () => {
      mockFetchApi.fetch.mockResolvedValue({
        ok: false,
        statusText: 'Not Found',
      });

      await expect(client.getProjectsInOrg(999)).rejects.toThrow(
        'Failed to fetch projects: Not Found',
      );
    });
  });

  describe('getProject', () => {
    it('fetches single project', async () => {
      mockFetchApi.fetch.mockResolvedValue({
        ok: true,
        json: async () => mockProject,
      });

      const result = await client.getProject(123);

      expect(mockFetchApi.fetch).toHaveBeenCalledWith(
        'http://localhost:7007/api/proxy/flagsmith/projects/123/',
      );
      expect(result).toEqual(mockProject);
    });

    it('throws error on failed response', async () => {
      mockFetchApi.fetch.mockResolvedValue({
        ok: false,
        statusText: 'Not Found',
      });

      await expect(client.getProject(999)).rejects.toThrow(
        'Failed to fetch project: Not Found',
      );
    });
  });

  describe('getProjectFeatures', () => {
    it('fetches features for project', async () => {
      mockFetchApi.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ results: mockFeatures }),
      });

      const result = await client.getProjectFeatures('123');

      expect(mockFetchApi.fetch).toHaveBeenCalledWith(
        'http://localhost:7007/api/proxy/flagsmith/projects/123/features/',
      );
      expect(result).toEqual(mockFeatures);
    });

    it('handles response without results wrapper', async () => {
      mockFetchApi.fetch.mockResolvedValue({
        ok: true,
        json: async () => mockFeatures,
      });

      const result = await client.getProjectFeatures('123');

      expect(result).toEqual(mockFeatures);
    });

    it('throws error on failed response', async () => {
      mockFetchApi.fetch.mockResolvedValue({
        ok: false,
        statusText: 'Internal Server Error',
      });

      await expect(client.getProjectFeatures('123')).rejects.toThrow(
        'Failed to fetch features: Internal Server Error',
      );
    });
  });

  describe('getProjectEnvironments', () => {
    it('fetches environments for project', async () => {
      mockFetchApi.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ results: mockEnvironments }),
      });

      const result = await client.getProjectEnvironments(123);

      expect(mockFetchApi.fetch).toHaveBeenCalledWith(
        'http://localhost:7007/api/proxy/flagsmith/projects/123/environments/',
      );
      expect(result).toEqual(mockEnvironments);
    });

    it('throws error on failed response', async () => {
      mockFetchApi.fetch.mockResolvedValue({
        ok: false,
        statusText: 'Forbidden',
      });

      await expect(client.getProjectEnvironments(123)).rejects.toThrow(
        'Failed to fetch environments: Forbidden',
      );
    });
  });

  describe('getUsageData', () => {
    it('fetches usage data for organization', async () => {
      mockFetchApi.fetch.mockResolvedValue({
        ok: true,
        json: async () => mockUsageData,
      });

      const result = await client.getUsageData(1);

      expect(mockFetchApi.fetch).toHaveBeenCalledWith(
        'http://localhost:7007/api/proxy/flagsmith/organisations/1/usage-data/',
      );
      expect(result).toEqual(mockUsageData);
    });

    it('fetches usage data with project filter', async () => {
      mockFetchApi.fetch.mockResolvedValue({
        ok: true,
        json: async () => mockUsageData,
      });

      const result = await client.getUsageData(1, 123);

      expect(mockFetchApi.fetch).toHaveBeenCalledWith(
        'http://localhost:7007/api/proxy/flagsmith/organisations/1/usage-data/?project_id=123',
      );
      expect(result).toEqual(mockUsageData);
    });

    it('throws error on failed response', async () => {
      mockFetchApi.fetch.mockResolvedValue({
        ok: false,
        statusText: 'Bad Request',
      });

      await expect(client.getUsageData(1)).rejects.toThrow(
        'Failed to fetch usage data: Bad Request',
      );
    });
  });

  describe('getFeatureVersions', () => {
    it('fetches feature versions', async () => {
      mockFetchApi.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ results: mockFeatureVersions }),
      });

      const result = await client.getFeatureVersions(1, 100);

      expect(mockFetchApi.fetch).toHaveBeenCalledWith(
        'http://localhost:7007/api/proxy/flagsmith/environments/1/features/100/versions/',
      );
      expect(result).toEqual(mockFeatureVersions);
    });

    it('throws error on failed response', async () => {
      mockFetchApi.fetch.mockResolvedValue({
        ok: false,
        statusText: 'Not Found',
      });

      await expect(client.getFeatureVersions(1, 999)).rejects.toThrow(
        'Failed to fetch feature versions: Not Found',
      );
    });
  });

  describe('getFeatureStates', () => {
    it('fetches feature states for a version', async () => {
      mockFetchApi.fetch.mockResolvedValue({
        ok: true,
        json: async () => mockFeatureStates,
      });

      const result = await client.getFeatureStates(1, 100, 'version-uuid-1');

      expect(mockFetchApi.fetch).toHaveBeenCalledWith(
        'http://localhost:7007/api/proxy/flagsmith/environments/1/features/100/versions/version-uuid-1/featurestates/',
      );
      expect(result).toEqual(mockFeatureStates);
    });

    it('throws error on failed response', async () => {
      mockFetchApi.fetch.mockResolvedValue({
        ok: false,
        statusText: 'Internal Server Error',
      });

      await expect(
        client.getFeatureStates(1, 100, 'invalid-uuid'),
      ).rejects.toThrow('Failed to fetch feature states: Internal Server Error');
    });
  });

  describe('getFeatureDetails', () => {
    it('fetches and combines feature details', async () => {
      // First call: getFeatureVersions
      mockFetchApi.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: mockFeatureVersions }),
      });
      // Second call: getFeatureStates
      mockFetchApi.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockFeatureStates,
      });

      const result = await client.getFeatureDetails(1, 100);

      expect(mockFetchApi.fetch).toHaveBeenCalledTimes(2);
      expect(result.liveVersion).toEqual(mockFeatureVersions[0]); // The one with is_live: true
      expect(result.featureState).toEqual(mockFeatureStates);
      expect(result.segmentOverrides).toBe(1); // One state has feature_segment
    });

    it('returns null liveVersion when no live version exists', async () => {
      const nonLiveVersions = [
        { ...mockFeatureVersions[1] }, // is_live: false
      ];

      mockFetchApi.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: nonLiveVersions }),
      });

      const result = await client.getFeatureDetails(1, 100);

      expect(mockFetchApi.fetch).toHaveBeenCalledTimes(1);
      expect(result.liveVersion).toBeNull();
      expect(result.featureState).toBeNull();
      expect(result.segmentOverrides).toBe(0);
    });

    it('counts segment overrides correctly', async () => {
      const statesWithMultipleSegments = [
        { ...mockFeatureStates[0], feature_segment: null },
        { ...mockFeatureStates[1], feature_segment: { segment: 1, priority: 1 } },
        { id: 3, enabled: true, feature_segment: { segment: 2, priority: 2 } },
      ];

      mockFetchApi.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: mockFeatureVersions }),
      });
      mockFetchApi.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => statesWithMultipleSegments,
      });

      const result = await client.getFeatureDetails(1, 100);

      expect(result.segmentOverrides).toBe(2);
    });

    it('handles empty versions list', async () => {
      mockFetchApi.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: [] }),
      });

      const result = await client.getFeatureDetails(1, 100);

      expect(result.liveVersion).toBeNull();
      expect(result.featureState).toBeNull();
      expect(result.segmentOverrides).toBe(0);
    });
  });
});
