
import { render, screen } from '@testing-library/react';
import { FlagsmithLink } from '../FlagsmithLink';

describe('FlagsmithLink', () => {
  const defaultProps = {
    href: 'https://app.flagsmith.com/project/123',
  };

  it('renders as a link with children', () => {
    render(
      <FlagsmithLink {...defaultProps}>
        View in Flagsmith
      </FlagsmithLink>,
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', defaultProps.href);
    expect(link).toHaveTextContent('View in Flagsmith');
  });

  it('opens in new tab with security attributes', () => {
    render(
      <FlagsmithLink {...defaultProps}>
        Link
      </FlagsmithLink>,
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders with default tooltip', () => {
    render(
      <FlagsmithLink {...defaultProps}>
        Link
      </FlagsmithLink>,
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute(
      'aria-label',
      'Open in Flagsmith (opens in new tab)',
    );
  });

  it('renders with custom tooltip', () => {
    render(
      <FlagsmithLink {...defaultProps} tooltip="View Dashboard">
        Link
      </FlagsmithLink>,
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute(
      'aria-label',
      'View Dashboard (opens in new tab)',
    );
  });

  it('renders icon-only mode as link', () => {
    render(<FlagsmithLink {...defaultProps} iconOnly />);

    // MUI IconButton with component="a" renders as a link
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', defaultProps.href);
    expect(link).toHaveAttribute('aria-label', 'Open in Flagsmith');
  });

  it('renders icon-only mode with custom tooltip', () => {
    render(<FlagsmithLink {...defaultProps} iconOnly tooltip="Open Dashboard" />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('aria-label', 'Open Dashboard');
  });

  it('renders external link icon', () => {
    const { container } = render(
      <FlagsmithLink {...defaultProps}>
        Link
      </FlagsmithLink>,
    );

    // LaunchIcon should be present and hidden from screen readers
    const icon = container.querySelector('[aria-hidden="true"]');
    expect(icon).toBeInTheDocument();
  });

  it('renders icon-only with correct security attributes', () => {
    render(<FlagsmithLink {...defaultProps} iconOnly />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
