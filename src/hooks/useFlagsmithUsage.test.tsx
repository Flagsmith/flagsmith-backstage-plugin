import { renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
// eslint-disable-next-line @backstage/no-undeclared-imports
import { TestApiProvider } from '@backstage/test-utils';
import { discoveryApiRef, fetchApiRef } from '@backstage/core-plugin-api';
import { useFlagsmithUsage } from './useFlagsmithUsage';
import {
  mockProject,
  mockUsageData,
  createMockDiscoveryApi,
} from '../__tests__/fixtures';

describe('useFlagsmithUsage', () => {
  const createWrapper = (fetchMock: jest.Mock) => {
    const discoveryApi = createMockDiscoveryApi();
    const fetchApi = { fetch: fetchMock };

    return ({ children }: { children: ReactNode }) => (
      <TestApiProvider
        apis={[
          [discoveryApiRef, discoveryApi],
          [fetchApiRef, fetchApi],
        ]}
      >
        {children}
      </TestApiProvider>
    );
  };

  it('returns loading state initially', () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockProject,
    });

    const { result } = renderHook(() => useFlagsmithUsage('123', '1'), {
      wrapper: createWrapper(fetchMock),
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.project).toBeNull();
    expect(result.current.usageData).toEqual([]);
    expect(result.current.totalFlags).toBe(0);
  });

  it('fetches usage data successfully', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockProject,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockUsageData,
      });

    const { result } = renderHook(() => useFlagsmithUsage('123', '1'), {
      wrapper: createWrapper(fetchMock),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.project).toEqual(mockProject);
    expect(result.current.usageData).toEqual(mockUsageData);
  });

  it('calculates totalFlags correctly', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockProject,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockUsageData,
      });

    const { result } = renderHook(() => useFlagsmithUsage('123', '1'), {
      wrapper: createWrapper(fetchMock),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // mockUsageData: 100 + 150 + 200 = 450
    expect(result.current.totalFlags).toBe(450);
  });

  it('handles null flags in usage data', async () => {
    const usageWithNullFlags = [
      { ...mockUsageData[0], flags: null },
      { ...mockUsageData[1], flags: 50 },
    ];

    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockProject,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => usageWithNullFlags,
      });

    const { result } = renderHook(() => useFlagsmithUsage('123', '1'), {
      wrapper: createWrapper(fetchMock),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // null is treated as 0, so 0 + 50 = 50
    expect(result.current.totalFlags).toBe(50);
  });

  it('returns error when projectId is undefined', async () => {
    const fetchMock = jest.fn();

    const { result } = renderHook(() => useFlagsmithUsage(undefined, '1'), {
      wrapper: createWrapper(fetchMock),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(
      'Missing Flagsmith project ID or organization ID in entity annotations',
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns error when orgId is undefined', async () => {
    const fetchMock = jest.fn();

    const { result } = renderHook(() => useFlagsmithUsage('123', undefined), {
      wrapper: createWrapper(fetchMock),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(
      'Missing Flagsmith project ID or organization ID in entity annotations',
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns error when both IDs are undefined', async () => {
    const fetchMock = jest.fn();

    const { result } = renderHook(() => useFlagsmithUsage(undefined, undefined), {
      wrapper: createWrapper(fetchMock),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(
      'Missing Flagsmith project ID or organization ID in entity annotations',
    );
  });

  it('returns error on API failure', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: false,
      statusText: 'Forbidden',
    });

    const { result } = renderHook(() => useFlagsmithUsage('123', '1'), {
      wrapper: createWrapper(fetchMock),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to fetch project: Forbidden');
  });

  it('handles empty usage data', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockProject,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    const { result } = renderHook(() => useFlagsmithUsage('123', '1'), {
      wrapper: createWrapper(fetchMock),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.usageData).toEqual([]);
    expect(result.current.totalFlags).toBe(0);
  });

  it('handles network errors', async () => {
    const fetchMock = jest.fn().mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useFlagsmithUsage('123', '1'), {
      wrapper: createWrapper(fetchMock),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
  });

  it('handles non-Error exceptions', async () => {
    const fetchMock = jest.fn().mockRejectedValue('String error');

    const { result } = renderHook(() => useFlagsmithUsage('123', '1'), {
      wrapper: createWrapper(fetchMock),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Unknown error');
  });
});
