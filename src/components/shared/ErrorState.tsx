import { Box, Typography } from '@material-ui/core';

interface ErrorStateProps {
  message: string;
  hint?: string;
}

export const ErrorState = ({ message, hint }: ErrorStateProps) => (
  <Box p={2}>
    <Typography color="error">Error: {message}</Typography>
    {hint && (
      <Typography variant="body2" color="textSecondary" style={{ marginTop: 8 }}>
        {hint}
      </Typography>
    )}
  </Box>
);
