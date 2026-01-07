import { Box, TableCell, TableRow, Tooltip, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { FlagsmithFeature, FlagsmithEnvironment } from '../../api/FlagsmithClient';
import { FlagStatusIndicator } from '../shared';
import { getFeatureEnvStatus, buildEnvStatusTooltip } from '../../utils';

const useStyles = makeStyles(() => ({
  envDots: {
    display: 'flex',
    gap: 2,
    justifyContent: 'flex-end',
  },
}));

interface FeatureFlagRowProps {
  feature: FlagsmithFeature;
  environments: FlagsmithEnvironment[];
}

export const FeatureFlagRow = ({ feature, environments }: FeatureFlagRowProps) => {
  const classes = useStyles();

  return (
    <TableRow hover>
      <TableCell>
        <Typography variant="body2">{feature.name}</Typography>
        {feature.description && (
          <Typography variant="caption" color="textSecondary">
            {feature.description.substring(0, 40)}
            {feature.description.length > 40 ? '...' : ''}
          </Typography>
        )}
      </TableCell>
      <TableCell align="right">
        <Tooltip title={buildEnvStatusTooltip(feature, environments)}>
          <Box className={classes.envDots}>
            {environments.map(env => (
              <FlagStatusIndicator
                key={env.id}
                enabled={getFeatureEnvStatus(feature, env.id)}
                size="small"
              />
            ))}
          </Box>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
};
