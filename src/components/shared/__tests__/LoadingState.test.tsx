
import { render, screen } from '@testing-library/react';
import { LoadingState } from '../LoadingState';

describe('LoadingState', () => {
  it('renders with default props', () => {
    render(<LoadingState />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    render(<LoadingState message="Fetching data..." />);

    expect(screen.getByText('Fetching data...')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveAttribute(
      'aria-label',
      'Fetching data...',
    );
  });

  it('has correct ARIA attributes', () => {
    render(<LoadingState message="Loading feature flags..." />);

    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-label', 'Loading feature flags...');
  });

  it('hides spinner from screen readers', () => {
    const { container } = render(<LoadingState />);

    // CircularProgress should have aria-hidden
    const spinner = container.querySelector('[aria-hidden="true"]');
    expect(spinner).toBeInTheDocument();
  });

  it('renders without message when empty string provided', () => {
    render(<LoadingState message="" />);

    // The status box should still render but without message text
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });
});
