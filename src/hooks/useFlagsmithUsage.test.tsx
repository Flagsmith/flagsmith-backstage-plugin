import { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { TestApiProvider } from '@backstage/test-utils';
import { discoveryApiRef, fetchApiRef } from '@backstage/core-plugin-api';
import { useFlagsmithUsage } from './useFlagsmithUsage';

describe('useFlagsmithUsage', () => {
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

  it('returns error when projectId or orgId is missing', async () => {
    const { result } = renderHook(() => useFlagsmithUsage(undefined, '1'), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toContain('Missing Flagsmith project ID');
  });

  it('fetches usage data and calculates totalFlags', async () => {
    const mockProject = { id: 123, name: 'Test', organisation: 1 };
    const mockUsage = [{ flags: 100, day: '2024-01-01' }, { flags: 200, day: '2024-01-02' }];

    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => mockProject })
      .mockResolvedValueOnce({ ok: true, json: async () => mockUsage });

    const { result } = renderHook(() => useFlagsmithUsage('123', '1'), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.project).toEqual(mockProject);
    expect(result.current.usageData).toEqual(mockUsage);
    expect(result.current.totalFlags).toBe(300);
  });
});
