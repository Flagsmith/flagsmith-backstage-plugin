import {
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { FlagsmithEnvironment, FlagsmithFeature } from '../../api/FlagsmithClient';
import { flagsmithColors } from '../../theme/flagsmithTheme';

const useStyles = makeStyles(theme => ({
  envTable: {
    marginTop: theme.spacing(1),
    '& th, & td': {
      padding: theme.spacing(1, 1.5),
      borderBottom: `1px solid ${theme.palette.divider}`,
    },
    '& th': {
      fontWeight: 600,
      fontSize: '0.75rem',
      color: theme.palette.text.secondary,
      textTransform: 'uppercase',
    },
  },
  statusOn: {
    color: flagsmithColors.primary,
    fontWeight: 600,
  },
  statusOff: {
    color: theme.palette.text.secondary,
    fontWeight: 600,
  },
  envBadge: {
    fontSize: '0.7rem',
    height: 18,
    marginRight: theme.spacing(0.5),
    marginTop: theme.spacing(0.5),
  },
  valueCell: {
    fontFamily: 'monospace',
    fontSize: '0.85rem',
    color: theme.palette.text.primary,
  },
}));

interface EnvironmentTableProps {
  feature: FlagsmithFeature;
  environments: FlagsmithEnvironment[];
}

export const EnvironmentTable = ({
  feature,
  environments,
}: EnvironmentTableProps) => {
  const classes = useStyles();

  return (
    <Table size="small" className={classes.envTable}>
      <TableHead>
        <TableRow>
          <TableCell>Environment</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Value</TableCell>
          <TableCell>Last updated</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {environments.map(env => {
          const envState = feature.environment_state?.find(s => s.id === env.id);
          const enabled = envState?.enabled ?? feature.default_enabled ?? false;
          const segmentCount = feature.num_segment_overrides ?? 0;
          const value = feature.type === 'CONFIG' ? feature.initial_value : null;

          return (
            <TableRow key={env.id}>
              <TableCell>
                <Box>
                  <Typography variant="body2" style={{ fontWeight: 500 }}>
                    {env.name}
                  </Typography>
                  {segmentCount > 0 && (
                    <Chip
                      label={`${segmentCount} segment${segmentCount > 1 ? 's' : ''}`}
                      size="small"
                      variant="outlined"
                      className={classes.envBadge}
                    />
                  )}
                </Box>
              </TableCell>
              <TableCell>
                <Typography
                  variant="body2"
                  className={enabled ? classes.statusOn : classes.statusOff}
                >
                  {enabled ? 'ON' : 'OFF'}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" className={classes.valueCell}>
                  {value !== null && value !== undefined ? `"${value}"` : '-'}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="textSecondary">
                  {new Date(feature.created_date).toLocaleDateString()}
                </Typography>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
