import { Box, Typography } from '@material-ui/core';
import { FlagsmithUsageData } from '../../api/FlagsmithClient';

interface UsageTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: FlagsmithUsageData;
  }>;
}

export const UsageTooltip = ({ active, payload }: UsageTooltipProps) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const data = payload[0].payload;

  return (
    <Box
      p={1.5}
      style={{
        backgroundColor: 'rgba(12, 0, 0, 0.95)',
        border: '1px solid #ccc',
        borderRadius: 4,
      }}
    >
      <Typography variant="subtitle2" style={{ fontWeight: 600 }}>
        {new Date(data.day).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}
      </Typography>
      <Box mt={1}>
        <Typography variant="body2">
          <strong>Flags:</strong> {data.flags ?? 0}
        </Typography>
        <Typography variant="body2">
          <strong>Identities:</strong> {data.identities}
        </Typography>
        <Typography variant="body2">
          <strong>Traits:</strong> {data.traits}
        </Typography>
        <Typography variant="body2">
          <strong>Environment Document:</strong> {data.environment_document}
        </Typography>
      </Box>
    </Box>
  );
};
