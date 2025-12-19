import { useState, useEffect, useMemo } from 'react';
import {
  Typography,
  Box,
  CircularProgress,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Collapse,
  Chip,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import { useEntity } from '@backstage/plugin-catalog-react';
import {
  useApi,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';
import {
  FlagsmithClient,
  FlagsmithEnvironment,
  FlagsmithFeature,
  FlagsmithFeatureDetails,
} from '../api/FlagsmithClient';
import { FlagStatusIndicator, SearchInput, FlagsmithLink } from './shared';
import { flagsmithColors, buildFlagUrl, buildProjectUrl } from '../theme/flagsmithTheme';

const useStyles = makeStyles(theme => ({
  header: {
    marginBottom: theme.spacing(2),
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    justifyContent: 'flex-end',
  },
  flagName: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
  },
  expandedContent: {
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(2),
  },
  detailCard: {
    padding: theme.spacing(1.5),
    marginBottom: theme.spacing(1),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
  },
  showMoreButton: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    cursor: 'pointer',
    color: theme.palette.primary.main,
    fontSize: '0.875rem',
    marginTop: theme.spacing(1),
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  showMoreContent: {
    marginTop: theme.spacing(1.5),
    padding: theme.spacing(1.5),
    backgroundColor: theme.palette.type === 'dark'
      ? 'rgba(255, 255, 255, 0.05)'
      : 'rgba(0, 0, 0, 0.02)',
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
  },
  featureStateItem: {
    padding: theme.spacing(1),
    marginBottom: theme.spacing(0.5),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
  },
  segmentBadge: {
    backgroundColor: flagsmithColors.warning,
    color: 'white',
    fontSize: '0.7rem',
    height: 20,
    marginLeft: theme.spacing(1),
  },
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

interface ExpandableRowProps {
  feature: FlagsmithFeature;
  environments: FlagsmithEnvironment[];
  client: FlagsmithClient;
  projectId: string;
}

const ExpandableRow = ({
  feature,
  environments,
  client,
  projectId,
}: ExpandableRowProps) => {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [showMoreOpen, setShowMoreOpen] = useState(false);
  const [details, setDetails] = useState<FlagsmithFeatureDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  // Use first environment for loading details
  const primaryEnvId = environments[0]?.id;

  const handleToggle = async () => {
    const newOpen = !open;
    setOpen(newOpen);

    // Load details on first expand
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
  const segmentOverrides = details?.segmentOverrides ?? feature.num_segment_overrides ?? 0;

  // Build flag URL for first environment
  const flagUrl = buildFlagUrl(projectId, primaryEnvId?.toString() || '', feature.id);

  return (
    <>
      <TableRow hover>
        <TableCell padding="checkbox">
          <IconButton size="small" onClick={handleToggle}>
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
          <Typography variant="body2">
            {feature.type || 'FLAG'}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2">
            {new Date(feature.created_date).toLocaleDateString()}
          </Typography>
        </TableCell>
      </TableRow>

      {/* Expanded row content */}
      <TableRow>
        <TableCell
          style={{ paddingBottom: 0, paddingTop: 0 }}
          colSpan={4}
        >
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
                  {/* Version Info */}
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

                  {/* Targeting Info */}
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

                  {/* Metadata */}
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

                  {/* Tags */}
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

                  {/* Owners */}
                  {feature.owners && feature.owners.length > 0 && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="textSecondary">
                        Owners:{' '}
                        {feature.owners
                          .map(o => o.email || `${o.name}`)
                          .join(', ')}
                      </Typography>
                    </Grid>
                  )}

                  {/* Jira-style Per-Environment Table */}
                  <Grid item xs={12}>
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
                          // Get segments/variations count for this environment
                          const segmentCount = feature.num_segment_overrides ?? 0;
                          // For value, we use feature default or from environment_state if available
                          const value = feature.type === 'CONFIG' ? (feature as any).initial_value : null;

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
                  </Grid>

                  {/* Show More Section - Additional Details */}
                  <Grid item xs={12}>
                    <Box
                      className={classes.showMoreButton}
                      onClick={() => setShowMoreOpen(!showMoreOpen)}
                    >
                      {showMoreOpen ? <KeyboardArrowDown fontSize="small" /> : <KeyboardArrowRight fontSize="small" />}
                      <Typography variant="body2" component="span">
                        {showMoreOpen ? 'Hide additional details' : 'Show additional details'}
                      </Typography>
                    </Box>

                    <Collapse in={showMoreOpen} timeout="auto">
                      <Box className={classes.showMoreContent}>
                        {/* Published & Archived Status */}
                        <Box mb={1.5}>
                          <Typography variant="body2">
                            <strong>Published:</strong>{' '}
                            {liveVersion?.published ? 'Yes' : 'No'}
                            {liveVersion?.published_by && ` (by ${liveVersion.published_by})`}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Archived:</strong>{' '}
                            {feature.is_archived ? 'Yes' : 'No'}
                          </Typography>
                        </Box>

                        {/* Feature States with Segment Overrides */}
                        {details?.featureState && details.featureState.length > 0 && (
                          <Box>
                            <Typography variant="subtitle2" gutterBottom>
                              Segment Overrides
                            </Typography>
                            {details.featureState
                              .filter(state => state.feature_segment !== null)
                              .map((state, index) => (
                                <Box key={state.id || index} className={classes.featureStateItem}>
                                  <Box display="flex" alignItems="center">
                                    <FlagStatusIndicator enabled={state.enabled} size="small" />
                                    <Typography variant="body2" style={{ marginLeft: 8 }}>
                                      {state.enabled ? 'Enabled' : 'Disabled'}
                                    </Typography>
                                    {state.feature_segment && (
                                      <Chip
                                        label={`Segment: ${state.feature_segment.segment} (Priority: ${state.feature_segment.priority})`}
                                        size="small"
                                        className={classes.segmentBadge}
                                      />
                                    )}
                                  </Box>
                                  {state.feature_state_value && (
                                    <Box mt={0.5} ml={3}>
                                      {state.feature_state_value.string_value !== null &&
                                        state.feature_state_value.string_value !== undefined && (
                                          <Typography variant="caption" color="textSecondary">
                                            Value: "{state.feature_state_value.string_value}"
                                          </Typography>
                                        )}
                                      {state.feature_state_value.integer_value !== null &&
                                        state.feature_state_value.integer_value !== undefined && (
                                          <Typography variant="caption" color="textSecondary">
                                            Value: {state.feature_state_value.integer_value}
                                          </Typography>
                                        )}
                                      {state.feature_state_value.boolean_value !== null &&
                                        state.feature_state_value.boolean_value !== undefined && (
                                          <Typography variant="caption" color="textSecondary">
                                            Value: {String(state.feature_state_value.boolean_value)}
                                          </Typography>
                                        )}
                                    </Box>
                                  )}
                                </Box>
                              ))}
                            {details.featureState.filter(s => s.feature_segment !== null).length === 0 && (
                              <Typography variant="body2" color="textSecondary">
                                No segment overrides configured.
                              </Typography>
                            )}
                          </Box>
                        )}
                      </Box>
                    </Collapse>
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

export const FlagsTab = () => {
  const classes = useStyles();
  const { entity } = useEntity();
  const discoveryApi = useApi(discoveryApiRef);
  const fetchApi = useApi(fetchApiRef);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projectInfo, setProjectInfo] = useState<any>(null);
  const [environments, setEnvironments] = useState<FlagsmithEnvironment[]>([]);
  const [features, setFeatures] = useState<FlagsmithFeature[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [client] = useState(() => new FlagsmithClient(discoveryApi, fetchApi));

  // Get project ID from entity annotations
  const projectId = entity.metadata.annotations?.['flagsmith.com/project-id'];

  useEffect(() => {
    if (!projectId) {
      setError('No Flagsmith project ID found in entity annotations');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch project info
        const project = await client.getProject(parseInt(projectId, 10));
        setProjectInfo(project);

        // Fetch environments
        const envs = await client.getProjectEnvironments(parseInt(projectId, 10));
        setEnvironments(envs);

        // Fetch features
        const projectFeatures = await client.getProjectFeatures(projectId);
        setFeatures(projectFeatures);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId, client]);

  // Filter features based on search query
  const filteredFeatures = useMemo(() => {
    if (!searchQuery.trim()) return features;
    const query = searchQuery.toLowerCase();
    return features.filter(
      f =>
        f.name.toLowerCase().includes(query) ||
        f.description?.toLowerCase().includes(query),
    );
  }, [features, searchQuery]);

  // Build project dashboard URL
  const dashboardUrl = buildProjectUrl(
    projectId || '',
    environments[0]?.id?.toString(),
  );

  if (loading) {
    return (
      <Box p={3} display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">Error: {error}</Typography>
        {!projectId && (
          <Typography variant="body2" style={{ marginTop: 16 }}>
            Add a <code>flagsmith.com/project-id</code> annotation to this
            entity to view feature flags.
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Grid container spacing={2} alignItems="center" className={classes.header}>
        <Grid item xs={12} md={6}>
          <Typography variant="h4">Feature Flags</Typography>
          <Typography variant="body2" color="textSecondary">
            {projectInfo?.name} ({features.length} flags)
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box className={classes.headerActions}>
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search flags..."
            />
            <FlagsmithLink href={dashboardUrl} iconOnly tooltip="Open Dashboard" />
          </Box>
        </Grid>
      </Grid>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" />
              <TableCell>Flag Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Created</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredFeatures.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography color="textSecondary">
                    {searchQuery
                      ? 'No flags match your search'
                      : 'No feature flags found for this project'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredFeatures.map(feature => (
                <ExpandableRow
                  key={feature.id}
                  feature={feature}
                  environments={environments}
                  client={client}
                  projectId={projectId!}
                />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
