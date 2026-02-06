import { useState, memo } from 'react';
import {
  Typography,
  Box,
  CircularProgress,
  Grid,
  TableCell,
  TableRow,
  IconButton,
  Collapse,
  Chip,
  Switch,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import {
  FlagsmithClient,
  FlagsmithEnvironment,
  FlagsmithFeature,
  FlagsmithFeatureDetails,
  FlagsmithTag,
} from '../../api/FlagsmithClient';
import { FlagsmithLink } from '../shared';
import { buildFlagUrl } from '../../theme/flagsmithTheme';
import { switchOnStyle } from '../../theme/sharedStyles';
import {
  MAX_DISPLAY_TAGS,
  MAX_TABLE_ENVIRONMENTS,
  DESCRIPTION_TRUNCATE_LENGTH,
} from '../../constants';
import { truncateText, getErrorMessage } from '../../utils/flagTypeHelpers';
import { formatDate } from '../../utils/dateFormatters';
import { EnvironmentTable } from './EnvironmentTable';
import { FeatureAnalyticsSection } from './FeatureAnalyticsSection';
import { FeatureDetailsGrid } from './FeatureDetailsGrid';
import { SegmentOverridesSection } from './SegmentOverridesSection';

const useStyles = makeStyles(theme => ({
  flagName: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
  },
  expandedContent: {
    // No backgroundColor - inherit from parent table
  },
  expandedCell: {
    paddingBottom: 0,
    paddingTop: 0,
  },
  clickableRow: {
    cursor: 'pointer',
  },
  tagChip: {
    fontSize: '0.7rem',
    height: 20,
    marginRight: theme.spacing(0.5),
  },
  tagsCell: {
    maxWidth: 200,
  },
  switchOn: switchOnStyle,
  loadingText: {
    marginLeft: theme.spacing(1),
  },
  tagsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 2,
  },
}));

/** Number of fixed columns before environment columns (checkbox, name, tags) */
const FIXED_COLUMNS_COUNT = 3;
/** Number of fixed columns after environment columns (created date) */
const TRAILING_COLUMNS_COUNT = 1;

interface ExpandableRowProps {
  feature: FlagsmithFeature;
  environments: FlagsmithEnvironment[];
  tagMap: Map<number, FlagsmithTag>;
  client: FlagsmithClient;
  projectId: string;
  orgId: number;
}

export const ExpandableRow = memo(
  ({ feature, environments, tagMap, client, projectId, orgId }: ExpandableRowProps) => {
    const classes = useStyles();
    const [open, setOpen] = useState(false);
    const [details, setDetails] = useState<FlagsmithFeatureDetails | null>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [detailsError, setDetailsError] = useState<string | null>(null);

    const primaryEnvId = environments[0]?.id;

    const handleToggle = async () => {
      const newOpen = !open;
      setOpen(newOpen);

      if (newOpen && !details && !loadingDetails && primaryEnvId) {
        setLoadingDetails(true);
        setDetailsError(null);
        try {
          const featureDetails = await client.getFeatureDetails(
            primaryEnvId,
            feature.id,
          );
          setDetails(featureDetails);
        } catch (err) {
          setDetailsError(getErrorMessage(err, 'Failed to load details'));
        } finally {
          setLoadingDetails(false);
        }
      }
    };

    const liveVersion = details?.liveVersion || feature.live_version;
    const scheduledVersion = details?.scheduledVersion || null;
    const segmentOverrides =
      details?.segmentOverrides ?? feature.num_segment_overrides ?? 0;
    const flagUrl = buildFlagUrl(
      projectId,
      primaryEnvId?.toString() || '',
      feature.id,
    );

    const displayedEnvs = environments.slice(0, MAX_TABLE_ENVIRONMENTS);
    const tags = feature.tags || [];
    const displayTags = tags.slice(0, MAX_DISPLAY_TAGS);
    const remainingTagsCount = tags.length - MAX_DISPLAY_TAGS;
    const totalColumns =
      FIXED_COLUMNS_COUNT + displayedEnvs.length + TRAILING_COLUMNS_COUNT;

    return (
      <>
        <TableRow hover className={classes.clickableRow} onClick={handleToggle}>
          <TableCell padding="checkbox">
            <IconButton
              size="small"
              onClick={e => {
                e.stopPropagation();
                handleToggle();
              }}
              aria-label={open ? `Collapse ${feature.name}` : `Expand ${feature.name}`}
              aria-expanded={open}
            >
              {open ? <KeyboardArrowDown /> : <KeyboardArrowRight />}
            </IconButton>
          </TableCell>
          <TableCell>
            <Box className={classes.flagName}>
              <FlagsmithLink
                href={flagUrl}
                tooltip="Open in Flagsmith"
                onClick={e => e.stopPropagation()}
              >
                <Typography variant="subtitle2">{feature.name}</Typography>
              </FlagsmithLink>
            </Box>
            {feature.description && (
              <Typography variant="body2" color="textSecondary">
                {truncateText(feature.description, DESCRIPTION_TRUNCATE_LENGTH)}
              </Typography>
            )}
          </TableCell>
          <TableCell className={classes.tagsCell}>
            <Box className={classes.tagsContainer}>
              {displayTags.map((tagId, index) => (
                <Chip
                  key={index}
                  label={tagMap.get(tagId)?.label || tagId}
                  size="small"
                  variant="outlined"
                  className={classes.tagChip}
                />
              ))}
              {remainingTagsCount > 0 && (
                <Chip
                  label={`+${remainingTagsCount}`}
                  size="small"
                  variant="outlined"
                  className={classes.tagChip}
                />
              )}
            </Box>
          </TableCell>
          {displayedEnvs.map(env => {
            const envState = feature.environment_state?.find(s => s.id === env.id);
            const enabled = envState?.enabled ?? feature.default_enabled ?? false;
            return (
              <TableCell key={env.id} align="center">
                <Switch
                  checked={enabled}
                  size="small"
                  disabled
                  className={classes.switchOn}
                />
              </TableCell>
            );
          })}
          <TableCell>
            <Typography variant="body2">
              {formatDate(feature.created_date)}
            </Typography>
          </TableCell>
        </TableRow>

        <TableRow>
          <TableCell className={classes.expandedCell} colSpan={totalColumns}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box className={classes.expandedContent} p={2}>
                {loadingDetails && (
                  <Box display="flex" alignItems="center" p={2}>
                    <CircularProgress size={20} />
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      className={classes.loadingText}
                    >
                      Loading feature details...
                    </Typography>
                  </Box>
                )}
                {!loadingDetails && detailsError && (
                  <Typography color="error" variant="body2">
                    {detailsError}
                  </Typography>
                )}
                {!loadingDetails && !detailsError && (
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FeatureAnalyticsSection
                        client={client}
                        orgId={orgId}
                        projectId={parseInt(projectId, 10)}
                        environments={environments}
                      />
                    </Grid>

                    <FeatureDetailsGrid
                      feature={feature}
                      tagMap={tagMap}
                      liveVersion={liveVersion}
                      segmentOverrides={segmentOverrides}
                      scheduledVersion={scheduledVersion}
                    />

                    <Grid item xs={12}>
                      <EnvironmentTable
                        feature={feature}
                        environments={environments}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <SegmentOverridesSection
                        feature={feature}
                        details={details}
                        liveVersion={liveVersion}
                      />
                    </Grid>
                  </Grid>
                )}
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </>
    );
  },
);

ExpandableRow.displayName = 'ExpandableRow';
