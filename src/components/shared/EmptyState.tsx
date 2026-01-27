import { Box, Typography } from '@material-ui/core';

interface EmptyStateProps {
  message?: string;
}

export const EmptyState = ({ message = 'No data found' }: EmptyStateProps) => (
  <Box display="flex" justifyContent="center" alignItems="center" p={2}>
    <Typography color="textSecondary">{message}</Typography>
  </Box>
);
