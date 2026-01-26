import { FlagsmithClient } from './FlagsmithClient';

describe('FlagsmithClient', () => {
  const baseUrl = 'http://localhost:7007/api/proxy/flagsmith';
  let client: FlagsmithClient;
  let mockFetch: jest.Mock;

  beforeEach(() => {
    mockFetch = jest.fn();
    client = new FlagsmithClient(
      { getBaseUrl: jest.fn().mockResolvedValue('http://localhost:7007/api/proxy') },
      { fetch: mockFetch },
    );
  });

  const mockOk = (data: unknown) => ({ ok: true, json: async () => data });
  const mockError = (status: string) => ({ ok: false, statusText: status });

  describe('getOrganizations', () => {
    it('fetches organizations', async () => {
      const org = { id: 1, name: 'Test Org', created_date: '2024-01-01' };
      mockFetch.mockResolvedValue(mockOk({ results: [org] }));

      const result = await client.getOrganizations();

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/organisations/`);
      expect(result).toEqual([org]);
    });

    it('throws on error', async () => {
      mockFetch.mockResolvedValue(mockError('Unauthorized'));
      await expect(client.getOrganizations()).rejects.toThrow('Failed to fetch organizations: Unauthorized');
    });
  });

  describe('getProjectsInOrg', () => {
    it('fetches projects', async () => {
      const project = { id: 1, name: 'Project', organisation: 1, created_date: '2024-01-01' };
      mockFetch.mockResolvedValue(mockOk({ results: [project] }));

      const result = await client.getProjectsInOrg(1);

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/organisations/1/projects/`);
      expect(result).toEqual([project]);
    });
  });

  describe('getProject', () => {
    it('fetches single project', async () => {
      const project = { id: 123, name: 'Project', organisation: 1, created_date: '2024-01-01' };
      mockFetch.mockResolvedValue(mockOk(project));

      const result = await client.getProject(123);

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/projects/123/`);
      expect(result).toEqual(project);
    });
  });

  describe('getProjectFeatures', () => {
    it('fetches features', async () => {
      const features = [{ id: 1, name: 'feature', created_date: '2024-01-01', project: 1 }];
      mockFetch.mockResolvedValue(mockOk({ results: features }));

      const result = await client.getProjectFeatures('123');

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/projects/123/features/`);
      expect(result).toEqual(features);
    });
  });

  describe('getProjectEnvironments', () => {
    it('fetches environments', async () => {
      const envs = [{ id: 1, name: 'Dev', api_key: 'key', project: 123 }];
      mockFetch.mockResolvedValue(mockOk({ results: envs }));

      const result = await client.getProjectEnvironments(123);

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/projects/123/environments/`);
      expect(result).toEqual(envs);
    });
  });

  describe('getUsageData', () => {
    it('fetches usage data', async () => {
      const usage = [{ flags: 100, identities: 50, traits: 25, environment_document: 10, day: '2024-01-01', labels: {} }];
      mockFetch.mockResolvedValue(mockOk(usage));

      const result = await client.getUsageData(1);

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/organisations/1/usage-data/`);
      expect(result).toEqual(usage);
    });

    it('includes project_id filter', async () => {
      mockFetch.mockResolvedValue(mockOk([]));
      await client.getUsageData(1, 123);
      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/organisations/1/usage-data/?project_id=123`);
    });
  });

  describe('getFeatureVersions', () => {
    it('fetches versions', async () => {
      const versions = [{ uuid: 'v1', is_live: true, published: true }];
      mockFetch.mockResolvedValue(mockOk({ results: versions }));

      const result = await client.getFeatureVersions(1, 100);

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/environments/1/features/100/versions/`);
      expect(result).toEqual(versions);
    });
  });

  describe('getFeatureStates', () => {
    it('fetches states', async () => {
      const states = [{ id: 1, enabled: true, feature_segment: null }];
      mockFetch.mockResolvedValue(mockOk(states));

      const result = await client.getFeatureStates(1, 100, 'uuid');

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/environments/1/features/100/versions/uuid/featurestates/`);
      expect(result).toEqual(states);
    });
  });

  describe('getFeatureDetails', () => {
    it('combines versions and states', async () => {
      const versions = [{ uuid: 'v1', is_live: true, published: true }];
      const states = [
        { id: 1, enabled: true, feature_segment: null },
        { id: 2, enabled: true, feature_segment: { segment: 1, priority: 1 } },
      ];

      mockFetch
        .mockResolvedValueOnce(mockOk({ results: versions }))
        .mockResolvedValueOnce(mockOk(states));

      const result = await client.getFeatureDetails(1, 100);

      expect(result.liveVersion).toEqual(versions[0]);
      expect(result.featureState).toEqual(states);
      expect(result.segmentOverrides).toBe(1);
      expect(result.scheduledVersion).toBeNull();
    });

    it('returns nulls when no live version', async () => {
      mockFetch.mockResolvedValue(mockOk({ results: [] }));

      const result = await client.getFeatureDetails(1, 100);

      expect(result.liveVersion).toBeNull();
      expect(result.featureState).toBeNull();
      expect(result.segmentOverrides).toBe(0);
      expect(result.scheduledVersion).toBeNull();
    });

    it('detects scheduled version with future live_from date', async () => {
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const versions = [
        { uuid: 'v1', is_live: true, published: true, live_from: '2024-01-01T00:00:00Z' },
        { uuid: 'v2', is_live: false, published: true, live_from: futureDate },
      ];
      const states = [{ id: 1, enabled: true, feature_segment: null }];

      mockFetch
        .mockResolvedValueOnce(mockOk({ results: versions }))
        .mockResolvedValueOnce(mockOk(states));

      const result = await client.getFeatureDetails(1, 100);

      expect(result.liveVersion).toEqual(versions[0]);
      expect(result.scheduledVersion).toEqual(versions[1]);
    });

    it('ignores past live_from dates for scheduled version', async () => {
      const pastDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const versions = [
        { uuid: 'v1', is_live: true, published: true },
        { uuid: 'v2', is_live: false, published: true, live_from: pastDate },
      ];
      const states = [{ id: 1, enabled: true, feature_segment: null }];

      mockFetch
        .mockResolvedValueOnce(mockOk({ results: versions }))
        .mockResolvedValueOnce(mockOk(states));

      const result = await client.getFeatureDetails(1, 100);

      expect(result.scheduledVersion).toBeNull();
    });
  });
});
