import { ReactNode } from 'react';
import { screen, waitFor } from '@testing-library/react';
import { FlagsmithUsageCard } from '../index';
import {
  renderWithBackstage,
  mockProject,
  mockUsageData,
  mockEntity,
  mockEntityNoAnnotations,
} from '../../../__tests__/fixtures';

// Mock recharts to avoid rendering issues in tests
jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: { children: ReactNode }) => (
      <div data-testid="responsive-container" style={{ width: 400, height: 200 }}>
        {children}
      </div>
    ),
  };
});

describe('FlagsmithUsageCard', () => {
  const defaultFetchResponses = {
    '/projects/123/': mockProject,
    '/organisations/1/usage-data/': mockUsageData,
  };

  it('shows loading state initially', () => {
    renderWithBackstage(<FlagsmithUsageCard />, {
      fetchResponses: defaultFetchResponses,
    });

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Loading usage data...')).toBeInTheDocument();
  });

  it('displays usage data after loading', async () => {
    renderWithBackstage(<FlagsmithUsageCard />, {
      fetchResponses: defaultFetchResponses,
    });

    await waitFor(() => {
      expect(screen.queryByText('Loading usage data...')).not.toBeInTheDocument();
    });

    // Should display card title
    expect(screen.getByText('Flags Usage Data (30 Days)')).toBeInTheDocument();
  });

  it('displays project name in subheader', async () => {
    renderWithBackstage(<FlagsmithUsageCard />, {
      fetchResponses: defaultFetchResponses,
    });

    await waitFor(() => {
      expect(screen.queryByText('Loading usage data...')).not.toBeInTheDocument();
    });

    // Should show project name
    expect(screen.getByText(/Test Project/)).toBeInTheDocument();
  });

  it('displays total flag calls', async () => {
    renderWithBackstage(<FlagsmithUsageCard />, {
      fetchResponses: defaultFetchResponses,
    });

    await waitFor(() => {
      expect(screen.queryByText('Loading usage data...')).not.toBeInTheDocument();
    });

    // mockUsageData: 100 + 150 + 200 = 450
    expect(screen.getByText(/450/)).toBeInTheDocument();
    expect(screen.getByText(/total flag calls/)).toBeInTheDocument();
  });

  it('displays error when org ID is missing', async () => {
    const entityWithoutOrgId = {
      ...mockEntity,
      metadata: {
        ...mockEntity.metadata,
        annotations: {
          'flagsmith.com/project-id': '123',
          // No org-id
        },
      },
    };

    renderWithBackstage(<FlagsmithUsageCard />, {
      entity: entityWithoutOrgId,
    });

    await waitFor(() => {
      expect(screen.queryByText('Loading usage data...')).not.toBeInTheDocument();
    });

    expect(screen.getByText(/Missing Flagsmith/)).toBeInTheDocument();
  });

  it('displays error when project ID is missing', async () => {
    renderWithBackstage(<FlagsmithUsageCard />, {
      entity: mockEntityNoAnnotations,
    });

    await waitFor(() => {
      expect(screen.queryByText('Loading usage data...')).not.toBeInTheDocument();
    });

    expect(screen.getByText(/Missing Flagsmith/)).toBeInTheDocument();
  });

  it('displays error on API failure', async () => {
    const fetchApi = {
      fetch: jest.fn().mockResolvedValue({
        ok: false,
        statusText: 'Unauthorized',
      }),
    };

    renderWithBackstage(<FlagsmithUsageCard />, {
      fetchApi,
    });

    await waitFor(() => {
      expect(screen.queryByText('Loading usage data...')).not.toBeInTheDocument();
    });

    expect(screen.getByText(/Error:/)).toBeInTheDocument();
  });

  it('renders the chart container', async () => {
    renderWithBackstage(<FlagsmithUsageCard />, {
      fetchResponses: defaultFetchResponses,
    });

    await waitFor(() => {
      expect(screen.queryByText('Loading usage data...')).not.toBeInTheDocument();
    });

    // Should have chart container (mocked ResponsiveContainer)
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('renders usage analytics link when orgId is present', async () => {
    renderWithBackstage(<FlagsmithUsageCard />, {
      fetchResponses: defaultFetchResponses,
    });

    await waitFor(() => {
      expect(screen.queryByText('Loading usage data...')).not.toBeInTheDocument();
    });

    // MUI IconButton with component="a" renders as link role
    const analyticsLink = screen.getByRole('link', { name: /view usage analytics/i });
    expect(analyticsLink).toBeInTheDocument();
  });

  it('handles empty usage data', async () => {
    renderWithBackstage(<FlagsmithUsageCard />, {
      fetchResponses: {
        ...defaultFetchResponses,
        '/organisations/1/usage-data/': [],
      },
    });

    await waitFor(() => {
      expect(screen.queryByText('Loading usage data...')).not.toBeInTheDocument();
    });

    // Should show 0 total flag calls
    expect(screen.getByText(/0 total flag calls/)).toBeInTheDocument();
  });

  it('handles usage data with null flags', async () => {
    const usageWithNulls = [
      { ...mockUsageData[0], flags: null },
      { ...mockUsageData[1], flags: 50 },
    ];

    renderWithBackstage(<FlagsmithUsageCard />, {
      fetchResponses: {
        ...defaultFetchResponses,
        '/organisations/1/usage-data/': usageWithNulls,
      },
    });

    await waitFor(() => {
      expect(screen.queryByText('Loading usage data...')).not.toBeInTheDocument();
    });

    // null is treated as 0, so total should be 50
    expect(screen.getByText(/50/)).toBeInTheDocument();
  });
});
