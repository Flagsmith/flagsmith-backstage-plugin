import { renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
// eslint-disable-next-line @backstage/no-undeclared-imports
import { TestApiProvider } from '@backstage/test-utils';
import { discoveryApiRef, fetchApiRef } from '@backstage/core-plugin-api';
import { useFlagsmithProject } from './useFlagsmithProject';
import {
  mockProject,
  mockEnvironments,
  mockFeatures,
  createMockDiscoveryApi,
} from '../__tests__/fixtures';

describe('useFlagsmithProject', () => {
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

    const { result } = renderHook(() => useFlagsmithProject('123'), {
      wrapper: createWrapper(fetchMock),
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.project).toBeNull();
    expect(result.current.environments).toEqual([]);
    expect(result.current.features).toEqual([]);
  });

  it('fetches project data successfully', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockProject,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: mockEnvironments }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: mockFeatures }),
      });

    const { result } = renderHook(() => useFlagsmithProject('123'), {
      wrapper: createWrapper(fetchMock),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.project).toEqual(mockProject);
    expect(result.current.environments).toEqual(mockEnvironments);
    expect(result.current.features).toEqual(mockFeatures);
  });

  it('returns error when projectId is undefined', async () => {
    const fetchMock = jest.fn();

    const { result } = renderHook(() => useFlagsmithProject(undefined), {
      wrapper: createWrapper(fetchMock),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(
      'No Flagsmith project ID found in entity annotations',
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns error on API failure', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: false,
      statusText: 'Internal Server Error',
    });

    const { result } = renderHook(() => useFlagsmithProject('123'), {
      wrapper: createWrapper(fetchMock),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(
      'Failed to fetch project: Internal Server Error',
    );
  });

  it('returns the client instance', () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockProject,
    });

    const { result } = renderHook(() => useFlagsmithProject('123'), {
      wrapper: createWrapper(fetchMock),
    });

    expect(result.current.client).toBeDefined();
    expect(typeof result.current.client.getProject).toBe('function');
    expect(typeof result.current.client.getFeatureDetails).toBe('function');
  });

  it('memoizes client across re-renders', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => mockProject })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ results: [] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ results: [] }) });

    const { result, rerender } = renderHook(() => useFlagsmithProject('123'), {
      wrapper: createWrapper(fetchMock),
    });

    const firstClient = result.current.client;

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    rerender();

    expect(result.current.client).toBe(firstClient);
  });

  it('handles network errors', async () => {
    const fetchMock = jest
      .fn()
      .mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useFlagsmithProject('123'), {
      wrapper: createWrapper(fetchMock),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
  });

  it('handles non-Error exceptions', async () => {
    const fetchMock = jest.fn().mockRejectedValue('String error');

    const { result } = renderHook(() => useFlagsmithProject('123'), {
      wrapper: createWrapper(fetchMock),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Unknown error');
  });
});
