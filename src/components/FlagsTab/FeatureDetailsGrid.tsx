import { Box, Chip, Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { FlagsmithFeature } from '../../api/FlagsmithClient';
import { flagsmithColors } from '../../theme/flagsmithTheme';

const useStyles = makeStyles(theme => ({
  detailCard: {
    padding: theme.spacing(1.5),
    marginBottom: theme.spacing(1),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
  },
}));

type LiveVersionInfo = FlagsmithFeature['live_version'];

interface FeatureDetailsGridProps {
  feature: FlagsmithFeature;
  liveVersion: LiveVersionInfo;
  segmentOverrides: number;
}

export const FeatureDetailsGrid = ({
  feature,
  liveVersion,
  segmentOverrides,
}: FeatureDetailsGridProps) => {
  const classes = useStyles();

  return (
    <>
      {liveVersion && (
        <Grid item xs={12} md={4}>
          <Box className={classes.detailCard}>
            <Typography variant="subtitle2" gutterBottom>
              Version
            </Typography>
            <Typography variant="body2">
              Status: {liveVersion.is_live ? 'Active' : 'Inactive'}
            </Typography>
            {liveVersion.live_from && (
              <Typography variant="body2">
                Live since: {new Date(liveVersion.live_from).toLocaleDateString()}
              </Typography>
            )}
          </Box>
        </Grid>
      )}

      <Grid item xs={12} md={4}>
        <Box className={classes.detailCard}>
          <Typography variant="subtitle2" gutterBottom>
            Targeting
          </Typography>
          <Typography variant="body2">
            Segment overrides: {segmentOverrides}
          </Typography>
          {feature.num_identity_overrides !== null &&
            feature.num_identity_overrides !== undefined && (
              <Typography variant="body2">
                Identity overrides: {feature.num_identity_overrides}
              </Typography>
            )}
        </Box>
      </Grid>

      <Grid item xs={12} md={4}>
        <Box className={classes.detailCard}>
          <Typography variant="subtitle2" gutterBottom>
            Details
          </Typography>
          <Typography variant="body2">ID: {feature.id}</Typography>
          <Typography variant="body2">
            Type: {feature.type || 'Standard'}
          </Typography>
          {feature.is_server_key_only && (
            <Chip
              label="Server Key Only"
              size="small"
              style={{
                marginTop: 4,
                backgroundColor: flagsmithColors.secondary,
                color: 'white',
              }}
            />
          )}
        </Box>
      </Grid>

      {feature.tags && feature.tags.length > 0 && (
        <Grid item xs={12}>
          <Box display="flex" flexWrap="wrap" style={{ gap: 4 }}>
            {feature.tags.map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                size="small"
                variant="outlined"
              />
            ))}
          </Box>
        </Grid>
      )}

      {feature.owners && feature.owners.length > 0 && (
        <Grid item xs={12}>
          <Typography variant="body2" color="textSecondary">
            Owners:{' '}
            {feature.owners.map(o => o.email || `${o.name}`).join(', ')}
          </Typography>
        </Grid>
      )}
    </>
  );
};
