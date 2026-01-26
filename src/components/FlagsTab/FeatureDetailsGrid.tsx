import { Box, Chip, Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import ArchiveIcon from '@material-ui/icons/Archive';
import VpnKeyIcon from '@material-ui/icons/VpnKey';
import { FlagsmithFeature } from '../../api/FlagsmithClient';
import { flagsmithColors } from '../../theme/flagsmithTheme';

const useStyles = makeStyles(theme => ({
  detailCard: {
    padding: theme.spacing(1.5),
    marginBottom: theme.spacing(1),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
  },
  badgeChip: {
    marginRight: theme.spacing(0.5),
    marginTop: theme.spacing(0.5),
  },
  archivedChip: {
    backgroundColor: theme.palette.warning.light,
    color: theme.palette.warning.contrastText,
  },
  serverKeyChip: {
    backgroundColor: flagsmithColors.secondary,
    color: 'white',
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

  // Determine value type based on initial_value
  const getValueType = () => {
    if (feature.type === 'CONFIG' && feature.initial_value !== null && feature.initial_value !== undefined) {
      const value = feature.initial_value;
      if (value === 'true' || value === 'false') return 'Boolean';
      if (!isNaN(Number(value))) return 'Number';
      return 'String';
    }
    return 'Boolean'; // Flag type defaults to boolean
  };

  return (
    <>
      {/* Status badges row */}
      {(feature.is_server_key_only || feature.is_archived) && (
        <Grid item xs={12}>
          <Box display="flex" flexWrap="wrap">
            {feature.is_server_key_only && (
              <Chip
                icon={<VpnKeyIcon />}
                label="Server-side Only"
                size="small"
                className={`${classes.badgeChip} ${classes.serverKeyChip}`}
              />
            )}
            {feature.is_archived && (
              <Chip
                icon={<ArchiveIcon />}
                label="Archived"
                size="small"
                className={`${classes.badgeChip} ${classes.archivedChip}`}
              />
            )}
          </Box>
        </Grid>
      )}

      {/* Version card */}
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

      {/* Details card */}
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
            Flag Type: {feature.type === 'CONFIG' ? 'Config' : 'Standard'}
          </Typography>
          <Typography variant="body2">
            Value Type: {getValueType()}
          </Typography>
        </Box>
      </Grid>

      {/* Owners card */}
      <Grid item xs={12} md={4}>
        <Box className={classes.detailCard}>
          <Typography variant="subtitle2" gutterBottom>
            Ownership
          </Typography>
          {feature.created_by && (
            <Typography variant="body2">
              Creator: {feature.created_by.email || `${feature.created_by.first_name || ''} ${feature.created_by.last_name || ''}`.trim() || 'Unknown'}
            </Typography>
          )}
          {feature.owners && feature.owners.length > 0 ? (
            <Typography variant="body2">
              Assigned Users: {feature.owners.map(o => o.email || o.name).join(', ')}
            </Typography>
          ) : (
            <Typography variant="body2" color="textSecondary">
              No assigned users
            </Typography>
          )}
          {feature.group_owners && feature.group_owners.length > 0 && (
            <Typography variant="body2">
              Groups: {feature.group_owners.map(g => g.name).join(', ')}
            </Typography>
          )}
        </Box>
      </Grid>

      {/* Tags */}
      {feature.tags && feature.tags.length > 0 && (
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>
            Tags
          </Typography>
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
    </>
  );
};
