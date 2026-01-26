import { useState } from 'react';
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
import { flagsmithColors } from '../../theme/flagsmithTheme';
import {
  FlagsmithClient,
  FlagsmithEnvironment,
  FlagsmithFeature,
  FlagsmithFeatureDetails,
} from '../../api/FlagsmithClient';
import { FlagsmithLink } from '../shared';
import { buildFlagUrl } from '../../theme/flagsmithTheme';
import { EnvironmentTable } from './EnvironmentTable';
import { FeatureDetailsGrid } from './FeatureDetailsGrid';
import { SegmentOverridesSection } from './SegmentOverridesSection';

const useStyles = makeStyles(theme => ({
  flagName: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
  },
  expandedContent: {
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(2),
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
  switchOn: {
    '& .MuiSwitch-switchBase.Mui-checked': {
      color: flagsmithColors.primary,
    },
    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
      backgroundColor: flagsmithColors.primary,
    },
  },
}));

interface ExpandableRowProps {
  feature: FlagsmithFeature;
  environments: FlagsmithEnvironment[];
  client: FlagsmithClient;
  projectId: string;
}

export const ExpandableRow = ({
  feature,
  environments,
  client,
  projectId,
}: ExpandableRowProps) => {
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
        setDetailsError(
          err instanceof Error ? err.message : 'Failed to load details',
        );
      } finally {
        setLoadingDetails(false);
      }
    }
  };

  const liveVersion = details?.liveVersion || feature.live_version;
  const segmentOverrides =
    details?.segmentOverrides ?? feature.num_segment_overrides ?? 0;
  const flagUrl = buildFlagUrl(
    projectId,
    primaryEnvId?.toString() || '',
    feature.id,
  );

  const displayedEnvs = environments.slice(0, 6);
  const tags = feature.tags || [];
  const displayTags = tags.slice(0, 3);
  const remainingTagsCount = tags.length - 3;

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
              {feature.description.length > 60
                ? `${feature.description.substring(0, 60)}...`
                : feature.description}
            </Typography>
          )}
        </TableCell>
        <TableCell className={classes.tagsCell}>
          <Box display="flex" flexWrap="wrap" style={{ gap: 2 }}>
            {displayTags.map((tag, index) => (
              <Chip
                key={index}
                label={tag}
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
            {new Date(feature.created_date).toLocaleDateString()}
          </Typography>
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4 + displayedEnvs.length}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box className={classes.expandedContent}>
              {loadingDetails && (
                <Box display="flex" alignItems="center" p={2}>
                  <CircularProgress size={20} />
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    style={{ marginLeft: 8 }}
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
                  <FeatureDetailsGrid
                    feature={feature}
                    liveVersion={liveVersion}
                    segmentOverrides={segmentOverrides}
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
};
