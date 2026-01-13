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
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
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
  const flagUrl = buildFlagUrl(
    projectId,
    primaryEnvId?.toString() || '',
    feature.id,
  );

  return (
    <>
      <TableRow hover>
        <TableCell padding="checkbox">
          <IconButton
            size="small"
            onClick={handleToggle}
            aria-label={open ? `Collapse ${feature.name}` : `Expand ${feature.name}`}
            aria-expanded={open}
          >
            {open ? <KeyboardArrowDown /> : <KeyboardArrowRight />}
          </IconButton>
        </TableCell>
        <TableCell>
          <Box className={classes.flagName}>
            <FlagsmithLink href={flagUrl} tooltip="Open in Flagsmith">
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
        <TableCell>
          <Typography variant="body2">{feature.type || 'FLAG'}</Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2">
            {new Date(feature.created_date).toLocaleDateString()}
          </Typography>
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
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
                  />

                  <Grid item xs={12}>
                    <EnvironmentTable
                      feature={feature}
                      environments={environments}
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
