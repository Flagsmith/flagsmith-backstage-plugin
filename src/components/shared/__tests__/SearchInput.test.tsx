
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchInput } from '../SearchInput';

describe('SearchInput', () => {
  const defaultProps = {
    value: '',
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders with default placeholder', () => {
    render(<SearchInput {...defaultProps} />);

    expect(screen.getByPlaceholderText('Search flags...')).toBeInTheDocument();
  });

  it('renders with custom placeholder', () => {
    render(<SearchInput {...defaultProps} placeholder="Find features..." />);

    expect(screen.getByPlaceholderText('Find features...')).toBeInTheDocument();
  });

  it('has correct ARIA attributes', () => {
    render(<SearchInput {...defaultProps} placeholder="Search flags..." />);

    const input = screen.getByRole('searchbox');
    expect(input).toHaveAttribute('aria-label', 'Search flags...');
  });

  it('displays the initial value', () => {
    render(<SearchInput {...defaultProps} value="test query" />);

    const input = screen.getByRole('searchbox');
    expect(input).toHaveValue('test query');
  });

  it('updates local value on input', async () => {
    render(<SearchInput {...defaultProps} />);

    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'new value' } });

    expect(input).toHaveValue('new value');
  });

  it('debounces onChange calls', async () => {
    const onChange = jest.fn();
    render(<SearchInput {...defaultProps} onChange={onChange} debounceMs={300} />);

    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'test' } });

    // onChange should not be called immediately
    expect(onChange).not.toHaveBeenCalled();

    // Advance timers by debounce duration
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(onChange).toHaveBeenCalledWith('test');
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('uses custom debounce delay', async () => {
    const onChange = jest.fn();
    render(<SearchInput {...defaultProps} onChange={onChange} debounceMs={500} />);

    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'test' } });

    // Should not be called after default 300ms
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(onChange).not.toHaveBeenCalled();

    // Should be called after 500ms total
    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(onChange).toHaveBeenCalledWith('test');
  });

  it('cancels previous debounce on new input', async () => {
    const onChange = jest.fn();
    render(<SearchInput {...defaultProps} onChange={onChange} debounceMs={300} />);

    const input = screen.getByRole('searchbox');

    // First input
    fireEvent.change(input, { target: { value: 'first' } });

    // Wait halfway
    act(() => {
      jest.advanceTimersByTime(150);
    });

    // Second input before debounce completes
    fireEvent.change(input, { target: { value: 'second' } });

    // Wait for original debounce time to pass
    act(() => {
      jest.advanceTimersByTime(150);
    });

    // Should not have been called with 'first'
    expect(onChange).not.toHaveBeenCalledWith('first');

    // Wait for new debounce to complete
    act(() => {
      jest.advanceTimersByTime(150);
    });

    expect(onChange).toHaveBeenCalledWith('second');
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('shows clear button when value is present', () => {
    render(<SearchInput {...defaultProps} value="test" />);

    expect(screen.getByRole('button', { name: /clear search/i })).toBeInTheDocument();
  });

  it('hides clear button when value is empty', () => {
    render(<SearchInput {...defaultProps} value="" />);

    expect(screen.queryByRole('button', { name: /clear search/i })).not.toBeInTheDocument();
  });

  it('clears input when clear button is clicked', () => {
    const onChange = jest.fn();
    render(<SearchInput {...defaultProps} value="test" onChange={onChange} />);

    // Type something to set local state
    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'something' } });

    const clearButton = screen.getByRole('button', { name: /clear search/i });
    fireEvent.click(clearButton);

    // Clear should call onChange immediately (no debounce)
    expect(onChange).toHaveBeenCalledWith('');
    expect(input).toHaveValue('');
  });

  it('renders search icon', () => {
    const { container } = render(<SearchInput {...defaultProps} />);

    // SearchIcon should be present
    const searchIcon = container.querySelector('[aria-hidden="true"]');
    expect(searchIcon).toBeInTheDocument();
  });
});
