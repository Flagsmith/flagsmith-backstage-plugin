
import { render, screen, fireEvent } from '@testing-library/react';
import { MiniPagination } from '../MiniPagination';

describe('MiniPagination', () => {
  const defaultProps = {
    page: 0,
    totalPages: 3,
    totalItems: 25,
    onPrevious: jest.fn(),
    onNext: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when totalPages is 1', () => {
    const { container } = render(
      <MiniPagination {...defaultProps} totalPages={1} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when totalPages is 0', () => {
    const { container } = render(
      <MiniPagination {...defaultProps} totalPages={0} totalItems={0} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('renders pagination info correctly', () => {
    render(<MiniPagination {...defaultProps} />);

    expect(screen.getByText('Page 1 of 3 (25 items)')).toBeInTheDocument();
  });

  it('renders with custom item label', () => {
    render(<MiniPagination {...defaultProps} itemLabel="flags" />);

    expect(screen.getByText('Page 1 of 3 (25 flags)')).toBeInTheDocument();
  });

  it('has correct ARIA attributes', () => {
    render(<MiniPagination {...defaultProps} itemLabel="flags" />);

    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Pagination for flags');
  });

  it('disables previous button on first page', () => {
    render(<MiniPagination {...defaultProps} page={0} />);

    const prevButton = screen.getByRole('button', { name: /previous page/i });
    expect(prevButton).toBeDisabled();
  });

  it('enables previous button on subsequent pages', () => {
    render(<MiniPagination {...defaultProps} page={1} />);

    const prevButton = screen.getByRole('button', { name: /previous page/i });
    expect(prevButton).not.toBeDisabled();
  });

  it('disables next button on last page', () => {
    render(<MiniPagination {...defaultProps} page={2} totalPages={3} />);

    const nextButton = screen.getByRole('button', { name: /next page/i });
    expect(nextButton).toBeDisabled();
  });

  it('enables next button on non-last pages', () => {
    render(<MiniPagination {...defaultProps} page={0} />);

    const nextButton = screen.getByRole('button', { name: /next page/i });
    expect(nextButton).not.toBeDisabled();
  });

  it('calls onPrevious when previous button is clicked', () => {
    const onPrevious = jest.fn();
    render(<MiniPagination {...defaultProps} page={1} onPrevious={onPrevious} />);

    const prevButton = screen.getByRole('button', { name: /previous page/i });
    fireEvent.click(prevButton);

    expect(onPrevious).toHaveBeenCalledTimes(1);
  });

  it('calls onNext when next button is clicked', () => {
    const onNext = jest.fn();
    render(<MiniPagination {...defaultProps} page={0} onNext={onNext} />);

    const nextButton = screen.getByRole('button', { name: /next page/i });
    fireEvent.click(nextButton);

    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('does not call onPrevious when disabled', () => {
    const onPrevious = jest.fn();
    render(<MiniPagination {...defaultProps} page={0} onPrevious={onPrevious} />);

    const prevButton = screen.getByRole('button', { name: /previous page/i });
    fireEvent.click(prevButton);

    expect(onPrevious).not.toHaveBeenCalled();
  });

  it('does not call onNext when disabled', () => {
    const onNext = jest.fn();
    render(<MiniPagination {...defaultProps} page={2} totalPages={3} onNext={onNext} />);

    const nextButton = screen.getByRole('button', { name: /next page/i });
    fireEvent.click(nextButton);

    expect(onNext).not.toHaveBeenCalled();
  });

  it('displays correct page number (1-indexed)', () => {
    render(<MiniPagination {...defaultProps} page={2} totalPages={5} />);

    expect(screen.getByText('Page 3 of 5 (25 items)')).toBeInTheDocument();
  });
});
