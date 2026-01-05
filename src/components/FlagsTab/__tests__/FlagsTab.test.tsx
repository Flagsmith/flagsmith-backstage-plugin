
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { FlagsTab } from '../index';
import {
  renderWithBackstage,
  mockProject,
  mockEnvironments,
  mockFeatures,
  mockEntity,
  mockEntityNoAnnotations,
} from '../../../__tests__/fixtures';

describe('FlagsTab', () => {
  const defaultFetchResponses = {
    '/projects/123/': mockProject,
    '/projects/123/environments/': { results: mockEnvironments },
    '/projects/123/features/': { results: mockFeatures },
  };

  it('shows loading state initially', () => {
    renderWithBackstage(<FlagsTab />, {
      fetchResponses: defaultFetchResponses,
    });

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Loading feature flags...')).toBeInTheDocument();
  });

  it('displays feature flags after loading', async () => {
    renderWithBackstage(<FlagsTab />, {
      fetchResponses: defaultFetchResponses,
    });

    await waitFor(() => {
      expect(screen.queryByText('Loading feature flags...')).not.toBeInTheDocument();
    });

    // Should display project name and flag count
    expect(screen.getByText(/Test Project/)).toBeInTheDocument();
    expect(screen.getByText(/3 flags/)).toBeInTheDocument();

    // Should display feature names
    expect(screen.getByText('feature-one')).toBeInTheDocument();
    expect(screen.getByText('feature-two')).toBeInTheDocument();
    expect(screen.getByText('feature-three')).toBeInTheDocument();
  });

  it('displays error when project ID is missing', async () => {
    renderWithBackstage(<FlagsTab />, {
      entity: mockEntityNoAnnotations,
    });

    await waitFor(() => {
      expect(screen.queryByText('Loading feature flags...')).not.toBeInTheDocument();
    });

    expect(screen.getByText(/No Flagsmith project ID found/)).toBeInTheDocument();
    expect(screen.getByText(/flagsmith.com\/project-id/)).toBeInTheDocument();
  });

  it('displays error on API failure', async () => {
    const fetchApi = {
      fetch: jest.fn().mockResolvedValue({
        ok: false,
        statusText: 'Internal Server Error',
      }),
    };

    renderWithBackstage(<FlagsTab />, {
      fetchApi,
    });

    await waitFor(() => {
      expect(screen.queryByText('Loading feature flags...')).not.toBeInTheDocument();
    });

    expect(screen.getByText(/Error:/)).toBeInTheDocument();
  });

  it('filters features by search query', async () => {
    renderWithBackstage(<FlagsTab />, {
      fetchResponses: defaultFetchResponses,
    });

    await waitFor(() => {
      expect(screen.getByText('feature-one')).toBeInTheDocument();
    });

    const searchInput = screen.getByRole('searchbox');
    fireEvent.change(searchInput, { target: { value: 'feature-one' } });

    // Wait for debounce
    await waitFor(() => {
      expect(screen.getByText('feature-one')).toBeInTheDocument();
      expect(screen.queryByText('feature-two')).not.toBeInTheDocument();
      expect(screen.queryByText('feature-three')).not.toBeInTheDocument();
    }, { timeout: 500 });
  });

  it('shows no results message when search has no matches', async () => {
    renderWithBackstage(<FlagsTab />, {
      fetchResponses: defaultFetchResponses,
    });

    await waitFor(() => {
      expect(screen.getByText('feature-one')).toBeInTheDocument();
    });

    const searchInput = screen.getByRole('searchbox');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    await waitFor(() => {
      expect(screen.getByText('No flags match your search')).toBeInTheDocument();
    }, { timeout: 500 });
  });

  it('displays table headers', async () => {
    renderWithBackstage(<FlagsTab />, {
      fetchResponses: defaultFetchResponses,
    });

    await waitFor(() => {
      expect(screen.getByText('Flag Name')).toBeInTheDocument();
    });

    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Created')).toBeInTheDocument();
  });

  it('displays feature types', async () => {
    renderWithBackstage(<FlagsTab />, {
      fetchResponses: defaultFetchResponses,
    });

    await waitFor(() => {
      expect(screen.getByText('feature-one')).toBeInTheDocument();
    });

    expect(screen.getAllByText('FLAG').length).toBeGreaterThan(0);
    expect(screen.getByText('CONFIG')).toBeInTheDocument();
  });

  it('has expandable rows', async () => {
    renderWithBackstage(<FlagsTab />, {
      fetchResponses: defaultFetchResponses,
    });

    await waitFor(() => {
      expect(screen.getByText('feature-one')).toBeInTheDocument();
    });

    // Should have expand buttons
    const expandButtons = screen.getAllByRole('button', { name: /expand/i });
    expect(expandButtons.length).toBeGreaterThan(0);
  });

  it('displays truncated description', async () => {
    renderWithBackstage(<FlagsTab />, {
      fetchResponses: defaultFetchResponses,
    });

    await waitFor(() => {
      expect(screen.getByText('First test feature')).toBeInTheDocument();
    });
  });

  it('renders Flagsmith dashboard link', async () => {
    renderWithBackstage(<FlagsTab />, {
      fetchResponses: defaultFetchResponses,
    });

    await waitFor(() => {
      expect(screen.getByText('feature-one')).toBeInTheDocument();
    });

    // Should have Open Dashboard button
    const dashboardButton = screen.getByRole('button', { name: /open dashboard/i });
    expect(dashboardButton).toBeInTheDocument();
  });
});
