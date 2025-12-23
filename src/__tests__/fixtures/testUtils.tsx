import { ReactElement, ReactNode } from 'react';
// eslint-disable-next-line @backstage/no-undeclared-imports
import { render, RenderOptions } from '@testing-library/react';
// eslint-disable-next-line @backstage/no-undeclared-imports
import { TestApiProvider } from '@backstage/test-utils';
import {
  discoveryApiRef,
  fetchApiRef,
  DiscoveryApi,
} from '@backstage/core-plugin-api';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import type { Entity } from '@backstage/catalog-model';

// Mock Discovery API
export const createMockDiscoveryApi = (baseUrl = 'http://localhost:7007'): DiscoveryApi => ({
  getBaseUrl: jest.fn().mockResolvedValue(`${baseUrl}/api/proxy`),
});

// Mock Fetch API that tracks calls
export const createMockFetchApi = (responses: Record<string, unknown> = {}) => {
  const mockFetch = jest.fn().mockImplementation(async (url: string) => {
    // Find matching response based on URL pattern
    for (const [pattern, data] of Object.entries(responses)) {
      if (url.includes(pattern)) {
        return {
          ok: true,
          json: async () => data,
        };
      }
    }
    // Default 404 response
    return {
      ok: false,
      statusText: 'Not Found',
    };
  });

  return {
    fetch: mockFetch,
  };
};

// Default mock entity with Flagsmith annotations
export const mockEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'test-component',
    namespace: 'default',
    annotations: {
      'flagsmith.com/project-id': '123',
      'flagsmith.com/org-id': '1',
    },
  },
  spec: {
    type: 'service',
    lifecycle: 'production',
    owner: 'team-a',
  },
};

// Entity without Flagsmith annotations
export const mockEntityNoAnnotations: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'test-component',
    namespace: 'default',
  },
  spec: {
    type: 'service',
    lifecycle: 'production',
    owner: 'team-a',
  },
};

interface WrapperProps {
  children: ReactNode;
}

interface RenderWithBackstageOptions extends Omit<RenderOptions, 'wrapper'> {
  entity?: Entity;
  discoveryApi?: DiscoveryApi;
  fetchApi?: { fetch: jest.Mock };
  fetchResponses?: Record<string, unknown>;
}

/**
 * Render a component with Backstage providers and mock APIs
 */
export function renderWithBackstage(
  ui: ReactElement,
  options: RenderWithBackstageOptions = {},
) {
  const {
    entity = mockEntity,
    discoveryApi = createMockDiscoveryApi(),
    fetchApi,
    fetchResponses = {},
    ...renderOptions
  } = options;

  const mockFetchApi = fetchApi || createMockFetchApi(fetchResponses);

  function Wrapper({ children }: WrapperProps) {
    return (
      <TestApiProvider
        apis={[
          [discoveryApiRef, discoveryApi],
          [fetchApiRef, mockFetchApi],
        ]}
      >
        <EntityProvider entity={entity}>
          {children}
        </EntityProvider>
      </TestApiProvider>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    mockFetchApi,
    mockDiscoveryApi: discoveryApi,
  };
}

/**
 * Render a component with just the API providers (no entity context)
 */
export function renderWithApis(
  ui: ReactElement,
  options: Omit<RenderWithBackstageOptions, 'entity'> = {},
) {
  const {
    discoveryApi = createMockDiscoveryApi(),
    fetchApi,
    fetchResponses = {},
    ...renderOptions
  } = options;

  const mockFetchApi = fetchApi || createMockFetchApi(fetchResponses);

  function Wrapper({ children }: WrapperProps) {
    return (
      <TestApiProvider
        apis={[
          [discoveryApiRef, discoveryApi],
          [fetchApiRef, mockFetchApi],
        ]}
      >
        {children}
      </TestApiProvider>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    mockFetchApi,
    mockDiscoveryApi: discoveryApi,
  };
}

/**
 * Wait for async state updates
 */
export const waitForNextTick = () => new Promise(resolve => setTimeout(resolve, 0));

/**
 * Create a mock Response object
 */
export function createMockResponse(data: unknown, ok = true, statusText = 'OK') {
  return {
    ok,
    statusText,
    json: async () => data,
  };
}
