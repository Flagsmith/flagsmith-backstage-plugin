import { Box, Chip, Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import ArchiveIcon from '@material-ui/icons/Archive';
import ScheduleIcon from '@material-ui/icons/Schedule';
import VpnKeyIcon from '@material-ui/icons/VpnKey';
import { FlagsmithFeature, FlagsmithFeatureVersion } from '../../api/FlagsmithClient';
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
  scheduledCard: {
    padding: theme.spacing(1.5),
    marginBottom: theme.spacing(1),
    border: `1px solid ${theme.palette.warning.main}`,
    borderRadius: theme.shape.borderRadius,
    backgroundColor: `${theme.palette.warning.light}20`,
  },
  scheduledHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    color: theme.palette.warning.dark,
  },
  scheduleIcon: {
    fontSize: '1.2rem',
    color: theme.palette.warning.main,
  },
}));

type LiveVersionInfo = FlagsmithFeature['live_version'];

interface FeatureDetailsGridProps {
  feature: FlagsmithFeature;
  liveVersion: LiveVersionInfo;
  segmentOverrides: number;
  scheduledVersion?: FlagsmithFeatureVersion | null;
}

export const FeatureDetailsGrid = ({
  feature,
  liveVersion,
  segmentOverrides,
  scheduledVersion,
}: FeatureDetailsGridProps) => {
  const classes = useStyles();

  // Check if feature is multivariate
  const isMultivariate = feature.multivariate_options && feature.multivariate_options.length > 0;

  // Determine flag type display
  const getFlagType = () => {
    if (isMultivariate) return 'Multivariate';
    if (feature.type === 'CONFIG') return 'Remote Config';
    return 'Standard';
  };

  // Determine value type based on initial_value or multivariate options
  const getValueType = () => {
    if (isMultivariate && feature.multivariate_options && feature.multivariate_options.length > 0) {
      const firstOption = feature.multivariate_options[0];
      if (firstOption.string_value !== null && firstOption.string_value !== undefined) return 'String';
      if (firstOption.integer_value !== null && firstOption.integer_value !== undefined) return 'Number';
      if (firstOption.boolean_value !== null && firstOption.boolean_value !== undefined) return 'Boolean';
    }
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

      {/* Scheduled changes card */}
      {scheduledVersion && scheduledVersion.live_from && (
        <Grid item xs={12} md={4}>
          <Box className={classes.scheduledCard}>
            <Box className={classes.scheduledHeader}>
              <ScheduleIcon className={classes.scheduleIcon} />
              <Typography variant="subtitle2">
                Scheduled Change
              </Typography>
            </Box>
            <Typography variant="body2">
              Scheduled for: {new Date(scheduledVersion.live_from).toLocaleString()}
            </Typography>
            {scheduledVersion.published_by && (
              <Typography variant="body2" color="textSecondary">
                By: {scheduledVersion.published_by}
              </Typography>
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
            Flag Type: {getFlagType()}
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
