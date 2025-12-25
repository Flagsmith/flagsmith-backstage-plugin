import { Box, CircularProgress, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing(3),
  },
  message: {
    marginTop: theme.spacing(2),
  },
}));

interface LoadingStateProps {
  message?: string;
  size?: number;
}

export const LoadingState = ({
  message = 'Loading...',
  size = 40,
}: LoadingStateProps) => {
  const classes = useStyles();

  return (
    <Box className={classes.container} role="status" aria-label={message}>
      <CircularProgress size={size} aria-hidden="true" />
      {message && (
        <Typography
          variant="body2"
          color="textSecondary"
          className={classes.message}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
};
