import { Box, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { FlagStatusIndicator } from '../shared';

const useStyles = makeStyles(theme => ({
  statsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(1),
    fontSize: '0.75rem',
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
  },
}));

interface FlagStatsRowProps {
  enabledCount: number;
  disabledCount: number;
}

export const FlagStatsRow = ({ enabledCount, disabledCount }: FlagStatsRowProps) => {
  const classes = useStyles();

  return (
    <Box px={2} pt={1}>
      <Box className={classes.statsRow}>
        <Box className={classes.statItem}>
          <FlagStatusIndicator enabled size="small" />
          <Typography variant="caption">{enabledCount} Enabled</Typography>
        </Box>
        <Box className={classes.statItem}>
          <FlagStatusIndicator enabled={false} size="small" />
          <Typography variant="caption">{disabledCount} Disabled</Typography>
        </Box>
      </Box>
    </Box>
  );
};
