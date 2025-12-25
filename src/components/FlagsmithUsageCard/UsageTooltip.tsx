import { Box, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { FlagsmithUsageData } from '../../api/FlagsmithClient';

const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(1.5),
    backgroundColor: 'rgba(12, 0, 0, 0.95)',
    border: '1px solid #ccc',
    borderRadius: theme.shape.borderRadius,
  },
  title: {
    fontWeight: 600,
  },
  content: {
    marginTop: theme.spacing(1),
  },
}));

interface UsageTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: FlagsmithUsageData;
  }>;
}

export const UsageTooltip = ({ active, payload }: UsageTooltipProps) => {
  const classes = useStyles();

  if (!active || !payload || !payload.length) {
    return null;
  }

  const data = payload[0].payload;

  return (
    <Box className={classes.container}>
      <Typography variant="subtitle2" className={classes.title}>
        {new Date(data.day).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}
      </Typography>
      <Box className={classes.content}>
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
