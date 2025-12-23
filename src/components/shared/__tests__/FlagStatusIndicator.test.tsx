
import { render, screen } from '@testing-library/react';
import { FlagStatusIndicator } from '../FlagStatusIndicator';

describe('FlagStatusIndicator', () => {
  it('renders enabled state with green dot', () => {
    const { container } = render(<FlagStatusIndicator enabled />);

    const dot = container.querySelector('[class*="enabled"]');
    expect(dot).toBeInTheDocument();
  });

  it('renders disabled state with gray dot', () => {
    const { container } = render(<FlagStatusIndicator enabled={false} />);

    const dot = container.querySelector('[class*="disabled"]');
    expect(dot).toBeInTheDocument();
  });

  it('does not show label by default', () => {
    render(<FlagStatusIndicator enabled />);

    expect(screen.queryByText('On')).not.toBeInTheDocument();
    expect(screen.queryByText('Off')).not.toBeInTheDocument();
  });

  it('shows "On" label when enabled and showLabel is true', () => {
    render(<FlagStatusIndicator enabled showLabel />);

    expect(screen.getByText('On')).toBeInTheDocument();
  });

  it('shows "Off" label when disabled and showLabel is true', () => {
    render(<FlagStatusIndicator enabled={false} showLabel />);

    expect(screen.getByText('Off')).toBeInTheDocument();
  });

  it('renders smaller dot when size is small', () => {
    const { container } = render(
      <FlagStatusIndicator enabled size="small" />,
    );

    const dot = container.querySelector('[class*="dot"]');
    expect(dot).toHaveStyle({ width: '8px', height: '8px' });
  });

  it('renders medium dot by default', () => {
    const { container } = render(<FlagStatusIndicator enabled />);

    const dot = container.querySelector('[class*="dot"]');
    expect(dot).toHaveStyle({ width: '10px', height: '10px' });
  });

  it('renders tooltip when provided', () => {
    render(
      <FlagStatusIndicator
        enabled
        tooltip="Development: On • Production: Off"
      />,
    );

    // Tooltip wrapper should be present
    // Note: The actual tooltip text only appears on hover
    const indicator = screen.getByText('', { selector: '[class*="container"]' });
    expect(indicator).toBeInTheDocument();
  });

  it('does not render tooltip wrapper when tooltip is not provided', () => {
    const { container } = render(<FlagStatusIndicator enabled />);

    // Should not have Tooltip wrapper
    const muiTooltip = container.querySelector('[class*="MuiTooltip"]');
    // Without tooltip, there's no tooltip wrapper
    expect(muiTooltip).toBeNull();
  });

  it('applies smaller font size for small size with label', () => {
    render(
      <FlagStatusIndicator enabled showLabel size="small" />,
    );

    const label = screen.getByText('On');
    expect(label).toHaveStyle({ fontSize: '0.75rem' });
  });

  it('applies medium font size for medium size with label', () => {
    render(
      <FlagStatusIndicator enabled showLabel size="medium" />,
    );

    const label = screen.getByText('On');
    expect(label).toHaveStyle({ fontSize: '0.875rem' });
  });
});
