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
}

/**
 * Reusable search input component
 */
export const SearchInput = ({
  value,
  onChange,
  placeholder = 'Search flags...',
}: SearchInputProps) => {
  const classes = useStyles();

  const handleClear = () => onChange('');

  return (
    <TextField
      className={classes.root}
      variant="outlined"
      size="small"
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
      inputProps={{
        'aria-label': placeholder,
        role: 'searchbox',
      }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon color="action" aria-hidden="true" />
          </InputAdornment>
        ),
        endAdornment: value ? (
          <InputAdornment position="end">
            <IconButton
              className={classes.clearButton}
              onClick={handleClear}
              size="small"
              aria-label="Clear search"
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        ) : null,
      }}
    />
  );
};
