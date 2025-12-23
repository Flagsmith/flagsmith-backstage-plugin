import { Box, CircularProgress, Typography } from '@material-ui/core';

interface LoadingStateProps {
  message?: string;
  size?: number;
}

export const LoadingState = ({
  message = 'Loading...',
  size = 40,
}: LoadingStateProps) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      p={3}
      role="status"
      aria-label={message}
    >
      <CircularProgress size={size} aria-hidden="true" />
      {message && (
        <Typography
          variant="body2"
          color="textSecondary"
          style={{ marginTop: 16 }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
};
