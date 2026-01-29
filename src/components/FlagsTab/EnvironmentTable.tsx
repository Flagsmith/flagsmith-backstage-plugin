import {
  Box,
  Chip,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { FlagsmithEnvironment, FlagsmithFeature } from '../../api/FlagsmithClient';
import { switchOnStyle } from '../../theme/sharedStyles';
import { MAX_DETAIL_ENVIRONMENTS } from '../../constants';
import { isDefined } from '../../utils/flagTypeHelpers';
import { formatDate } from '../../utils/dateFormatters';

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
  switchOn: switchOnStyle,
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
  envName: {
    fontWeight: 500,
  },
  overridesContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 4,
  },
  hiddenEnvsMessage: {
    marginTop: theme.spacing(1),
  },
}));

interface EnvironmentTableProps {
  feature: FlagsmithFeature;
  environments: FlagsmithEnvironment[];
}

/**
 * Format override count with proper pluralization
 */
const formatOverrideLabel = (count: number, singular: string, plural: string): string => {
  return `${count} ${count > 1 ? plural : singular}`;
};

export const EnvironmentTable = ({
  feature,
  environments,
}: EnvironmentTableProps) => {
  const classes = useStyles();
  const displayedEnvironments = environments.slice(0, MAX_DETAIL_ENVIRONMENTS);
  const hiddenCount = environments.length - MAX_DETAIL_ENVIRONMENTS;

  // Check if any environment uses v2 versioning
  const hasVersioning = displayedEnvironments.some(env => env.use_v2_feature_versioning);

  return (
    <>
      <Table size="small" className={classes.envTable}>
        <TableHead>
          <TableRow>
            <TableCell>Environment</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Value</TableCell>
            <TableCell>Overrides</TableCell>
            {hasVersioning && <TableCell>Version</TableCell>}
            <TableCell>Last updated</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {displayedEnvironments.map(env => {
            const envState = feature.environment_state?.find(s => s.id === env.id);
            const enabled = envState?.enabled ?? feature.default_enabled ?? false;
            const segmentCount = feature.num_segment_overrides ?? 0;
            const identityCount = feature.num_identity_overrides ?? 0;
            const value = feature.type === 'CONFIG' ? feature.initial_value : null;
            const hasOverrides = segmentCount > 0 || identityCount > 0;

            return (
              <TableRow key={env.id}>
                <TableCell>
                  <Typography variant="body2" className={classes.envName}>
                    {env.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Switch
                    checked={enabled}
                    size="small"
                    disabled
                    className={classes.switchOn}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" className={classes.valueCell}>
                    {isDefined(value) ? `"${value}"` : '-'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box className={classes.overridesContainer}>
                    {segmentCount > 0 && (
                      <Chip
                        label={formatOverrideLabel(segmentCount, 'segment', 'segments')}
                        size="small"
                        variant="outlined"
                        className={classes.envBadge}
                      />
                    )}
                    {identityCount > 0 && (
                      <Chip
                        label={formatOverrideLabel(identityCount, 'identity', 'identities')}
                        size="small"
                        variant="outlined"
                        className={classes.envBadge}
                      />
                    )}
                    {!hasOverrides && (
                      <Typography variant="body2" color="textSecondary">
                        -
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                {hasVersioning && (
                  <TableCell>
                    <Typography variant="body2" color="textSecondary">
                      {env.use_v2_feature_versioning ? 'v2' : 'v1'}
                    </Typography>
                  </TableCell>
                )}
                <TableCell>
                  <Typography variant="body2" color="textSecondary">
                    {formatDate(feature.created_date)}
                  </Typography>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {hiddenCount > 0 && (
        <Box className={classes.hiddenEnvsMessage}>
          <Typography variant="body2" color="textSecondary">
            +{hiddenCount} more environment{hiddenCount > 1 ? 's' : ''} not shown
          </Typography>
        </Box>
      )}
    </>
  );
};
