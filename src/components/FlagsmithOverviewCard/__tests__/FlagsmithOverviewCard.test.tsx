
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { FlagsmithOverviewCard } from '../index';
import {
  renderWithBackstage,
  mockProject,
  mockEnvironments,
  mockFeatures,
  mockEntityNoAnnotations,
} from '../../../__tests__/fixtures';

describe('FlagsmithOverviewCard', () => {
  const defaultFetchResponses = {
    '/projects/123/': mockProject,
    '/projects/123/environments/': { results: mockEnvironments },
    '/projects/123/features/': { results: mockFeatures },
  };

  it('shows loading state initially', () => {
    renderWithBackstage(<FlagsmithOverviewCard />, {
      fetchResponses: defaultFetchResponses,
    });

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Loading Flagsmith data...')).toBeInTheDocument();
  });

  it('displays feature flag stats after loading', async () => {
    renderWithBackstage(<FlagsmithOverviewCard />, {
      fetchResponses: defaultFetchResponses,
    });

    await waitFor(() => {
      expect(screen.queryByText('Loading Flagsmith data...')).not.toBeInTheDocument();
    });

    // Should show total flags
    expect(screen.getByText('3')).toBeInTheDocument(); // Total flags
    expect(screen.getByText('Total Flags')).toBeInTheDocument();
  });

  it('displays enabled/disabled counts', async () => {
    renderWithBackstage(<FlagsmithOverviewCard />, {
      fetchResponses: defaultFetchResponses,
    });

    await waitFor(() => {
      expect(screen.getByText('Total Flags')).toBeInTheDocument();
    });

    // mockFeatures: 2 enabled (feature-one, feature-three), 1 disabled (feature-two)
    expect(screen.getByText('2')).toBeInTheDocument(); // Enabled count
    expect(screen.getByText('1')).toBeInTheDocument(); // Disabled count
    expect(screen.getByText('Enabled')).toBeInTheDocument();
    expect(screen.getByText('Disabled')).toBeInTheDocument();
  });

  it('displays error when project ID is missing', async () => {
    renderWithBackstage(<FlagsmithOverviewCard />, {
      entity: mockEntityNoAnnotations,
    });

    await waitFor(() => {
      expect(screen.queryByText('Loading Flagsmith data...')).not.toBeInTheDocument();
    });

    expect(screen.getByText(/No Flagsmith project ID found/)).toBeInTheDocument();
  });

  it('displays error on API failure', async () => {
    const fetchApi = {
      fetch: jest.fn().mockResolvedValue({
        ok: false,
        statusText: 'Forbidden',
      }),
    };

    renderWithBackstage(<FlagsmithOverviewCard />, {
      fetchApi,
    });

    await waitFor(() => {
      expect(screen.queryByText('Loading Flagsmith data...')).not.toBeInTheDocument();
    });

    expect(screen.getByText(/Error:/)).toBeInTheDocument();
  });

  it('displays feature list', async () => {
    renderWithBackstage(<FlagsmithOverviewCard />, {
      fetchResponses: defaultFetchResponses,
    });

    await waitFor(() => {
      expect(screen.getByText('feature-one')).toBeInTheDocument();
    });

    // At least some features should be visible
    expect(screen.getByText('feature-one')).toBeInTheDocument();
  });

  it('renders card with title', async () => {
    renderWithBackstage(<FlagsmithOverviewCard />, {
      fetchResponses: defaultFetchResponses,
    });

    expect(screen.getByText('Flagsmith Feature Flags')).toBeInTheDocument();
  });

  it('renders dashboard link', async () => {
    renderWithBackstage(<FlagsmithOverviewCard />, {
      fetchResponses: defaultFetchResponses,
    });

    await waitFor(() => {
      expect(screen.getByText('feature-one')).toBeInTheDocument();
    });

    const dashboardButton = screen.getByRole('button', { name: /open dashboard/i });
    expect(dashboardButton).toBeInTheDocument();
  });

  it('shows environments count', async () => {
    renderWithBackstage(<FlagsmithOverviewCard />, {
      fetchResponses: defaultFetchResponses,
    });

    await waitFor(() => {
      expect(screen.getByText('Total Flags')).toBeInTheDocument();
    });

    // Should show number of environments
    expect(screen.getByText('Environments')).toBeInTheDocument();
  });

  it('handles many features with pagination', async () => {
    // Create more than 5 features to trigger pagination
    const manyFeatures = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      name: `feature-${i + 1}`,
      description: `Feature ${i + 1}`,
      created_date: '2024-01-01T00:00:00Z',
      project: 123,
      default_enabled: i % 2 === 0,
    }));

    renderWithBackstage(<FlagsmithOverviewCard />, {
      fetchResponses: {
        ...defaultFetchResponses,
        '/projects/123/features/': { results: manyFeatures },
      },
    });

    await waitFor(() => {
      expect(screen.getByText('feature-1')).toBeInTheDocument();
    });

    // Should show pagination
    expect(screen.getByRole('navigation', { name: /pagination/i })).toBeInTheDocument();
  });

  it('navigates pages when pagination is clicked', async () => {
    const manyFeatures = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      name: `feature-${i + 1}`,
      description: `Feature ${i + 1}`,
      created_date: '2024-01-01T00:00:00Z',
      project: 123,
      default_enabled: true,
    }));

    renderWithBackstage(<FlagsmithOverviewCard />, {
      fetchResponses: {
        ...defaultFetchResponses,
        '/projects/123/features/': { results: manyFeatures },
      },
    });

    await waitFor(() => {
      expect(screen.getByText('feature-1')).toBeInTheDocument();
    });

    // Click next page
    const nextButton = screen.getByRole('button', { name: /next page/i });
    fireEvent.click(nextButton);

    // Should show next page features
    await waitFor(() => {
      expect(screen.getByText('feature-6')).toBeInTheDocument();
    });
  });

  it('handles empty features list', async () => {
    renderWithBackstage(<FlagsmithOverviewCard />, {
      fetchResponses: {
        ...defaultFetchResponses,
        '/projects/123/features/': { results: [] },
      },
    });

    await waitFor(() => {
      expect(screen.queryByText('Loading Flagsmith data...')).not.toBeInTheDocument();
    });

    // Should show 0 total flags
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});
