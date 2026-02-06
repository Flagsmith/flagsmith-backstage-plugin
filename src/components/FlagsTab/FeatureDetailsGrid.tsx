import { Box, Chip, Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import ArchiveIcon from '@material-ui/icons/Archive';
import ScheduleIcon from '@material-ui/icons/Schedule';
import VpnKeyIcon from '@material-ui/icons/VpnKey';
import { FlagsmithFeature, FlagsmithFeatureVersion, FlagsmithTag } from '../../api/FlagsmithClient';
import { flagsmithColors } from '../../theme/flagsmithTheme';
import { detailCardStyle } from '../../theme/sharedStyles';
import { getFlagType, getValueType, isDefined } from '../../utils/flagTypeHelpers';
import { formatDate, formatDateTime } from '../../utils/dateFormatters';

const useStyles = makeStyles(theme => ({
  detailCard: detailCardStyle(theme),
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
  tagsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 4,
  },
}));

type LiveVersionInfo = FlagsmithFeature['live_version'];

interface FeatureDetailsGridProps {
  feature: FlagsmithFeature;
  tagMap: Map<number, FlagsmithTag>;
  liveVersion: LiveVersionInfo;
  segmentOverrides: number;
  scheduledVersion?: FlagsmithFeatureVersion | null;
}

/**
 * Get display name for the feature creator
 */
const getCreatorDisplayName = (feature: FlagsmithFeature): string => {
  if (!feature.created_by) return 'Unknown';
  const { email, first_name, last_name } = feature.created_by;
  if (email) return email;
  const fullName = `${first_name || ''} ${last_name || ''}`.trim();
  return fullName || 'Unknown';
};

export const FeatureDetailsGrid = ({
  feature,
  tagMap,
  liveVersion,
  segmentOverrides,
  scheduledVersion,
}: FeatureDetailsGridProps) => {
  const classes = useStyles();

  const flagType = getFlagType(feature);
  const valueType = getValueType(feature);

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
              <Typography variant="subtitle2">Scheduled Change</Typography>
            </Box>
            <Typography variant="body2">
              Scheduled for: {formatDateTime(scheduledVersion.live_from)}
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
                Live since: {formatDate(liveVersion.live_from)}
              </Typography>
            )}
          </Box>
        </Grid>
      )}

      {/* Targeting card */}
      <Grid item xs={12} md={4}>
        <Box className={classes.detailCard}>
          <Typography variant="subtitle2" gutterBottom>
            Targeting
          </Typography>
          <Typography variant="body2">
            Segment overrides: {segmentOverrides}
          </Typography>
          {isDefined(feature.num_identity_overrides) && (
            <Typography variant="body2">
              Identity overrides: {feature.num_identity_overrides}
            </Typography>
          )}
        </Box>
      </Grid>

      {/* Details card */}
      <Grid item xs={12} md={4}>
        <Box className={classes.detailCard}>
          <Typography variant="subtitle2" gutterBottom>
            Details
          </Typography>
          <Typography variant="body2">ID: {feature.id}</Typography>
          <Typography variant="body2">Flag Type: {flagType}</Typography>
          <Typography variant="body2">Value Type: {valueType}</Typography>
        </Box>
      </Grid>

      {/* Ownership card */}
      <Grid item xs={12} md={4}>
        <Box className={classes.detailCard}>
          <Typography variant="subtitle2" gutterBottom>
            Ownership
          </Typography>
          {feature.created_by && (
            <Typography variant="body2">
              Creator: {getCreatorDisplayName(feature)}
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
          <Box className={classes.tagsContainer}>
            {feature.tags.map((tagId, index) => (
              <Chip key={index} label={tagMap.get(tagId)?.label || tagId} size="small" variant="outlined" />
            ))}
          </Box>
        </Grid>
      )}
    </>
  );
};
