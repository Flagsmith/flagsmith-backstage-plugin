import { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { TestApiProvider } from '@backstage/test-utils';
import { discoveryApiRef, fetchApiRef } from '@backstage/core-plugin-api';
import { useFlagsmithProject } from './useFlagsmithProject';

describe('useFlagsmithProject', () => {
  const mockFetch = jest.fn();
  const mockDiscoveryApi = {
    getBaseUrl: jest.fn().mockResolvedValue('http://localhost:7007/api/proxy'),
  };

  const wrapper = ({ children }: { children: ReactNode }) => (
    <TestApiProvider
      apis={[
        [discoveryApiRef, mockDiscoveryApi],
        [fetchApiRef, { fetch: mockFetch }],
      ]}
    >
      {children}
    </TestApiProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns error when projectId is missing', async () => {
    const { result } = renderHook(() => useFlagsmithProject(undefined), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('No Flagsmith project ID found in entity annotations');
  });

  it('fetches project data successfully', async () => {
    const mockProject = { id: 123, name: 'Test', organisation: 1 };
    const mockEnvs = [{ id: 1, name: 'Dev', api_key: 'key', project: 123 }];
    const mockFeatures = [{ id: 1, name: 'flag', created_date: '2024-01-01', project: 123 }];

    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => mockProject })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ results: mockEnvs }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ results: mockFeatures }) });

    const { result } = renderHook(() => useFlagsmithProject('123'), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeNull();
    expect(result.current.project).toEqual(mockProject);
    expect(result.current.environments).toEqual(mockEnvs);
    expect(result.current.features).toEqual(mockFeatures);
  });
});
