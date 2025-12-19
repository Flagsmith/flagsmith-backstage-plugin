import { useState, useCallback } from 'react';
import { TextField, InputAdornment } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import SearchIcon from '@material-ui/icons/Search';
import ClearIcon from '@material-ui/icons/Clear';
import IconButton from '@material-ui/core/IconButton';

const useStyles = makeStyles(() => ({
  root: {
    minWidth: 200,
  },
  clearButton: {
    padding: 4,
  },
}));

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

/**
 * Reusable search input with debounce support
 */
export const SearchInput = ({
  value,
  onChange,
  placeholder = 'Search flags...',
  debounceMs = 300,
}: SearchInputProps) => {
  const classes = useStyles();
  const [localValue, setLocalValue] = useState(value);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(
    null,
  );

  const handleChange = useCallback(
    (newValue: string) => {
      setLocalValue(newValue);

      // Clear existing timeout
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }

      // Set new timeout for debounced onChange
      const timeout = setTimeout(() => {
        onChange(newValue);
      }, debounceMs);

      setDebounceTimeout(timeout);
    },
    [onChange, debounceMs, debounceTimeout],
  );

  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };

  return (
    <TextField
      className={classes.root}
      variant="outlined"
      size="small"
      placeholder={placeholder}
      value={localValue}
      onChange={e => handleChange(e.target.value)}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon color="action" />
          </InputAdornment>
        ),
        endAdornment: localValue ? (
          <InputAdornment position="end">
            <IconButton
              className={classes.clearButton}
              onClick={handleClear}
              size="small"
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        ) : null,
      }}
    />
  );
};
