import { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  Badge,
} from '@material-ui/core';
import { KeyboardArrowDown, KeyboardArrowRight } from '@material-ui/icons';
import { useEntity } from '@backstage/plugin-catalog-react';
import { useApi, discoveryApiRef, fetchApiRef } from '@backstage/core-plugin-api';
import { FlagsmithClient, FlagsmithEnvironment, FlagsmithFeature } from '../api/FlagsmithClient';

interface ExpandableRowProps {
  feature: FlagsmithFeature;
}

const ExpandableRow = ({ feature }: ExpandableRowProps) => {
  const [open, setOpen] = useState(false);
  const [envStatesOpen, setEnvStatesOpen] = useState(false);

  console.log('Rendering feature row for:', feature);

  return (
    <>
      <TableRow>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowDown /> : <KeyboardArrowRight />}
          </IconButton>
        </TableCell>
        <TableCell>
          <Box>
            <Typography variant="subtitle2">{feature.name}</Typography>
            {feature.description && (
              <Typography variant="body2" color="textSecondary">
                {feature.description}
              </Typography>
            )}
          </Box>
        </TableCell>
        <TableCell>
          <Badge
            badgeContent={(feature.num_segment_overrides ?? 0) > 0 ? feature.num_segment_overrides : null}
            color="secondary"
            overlap="rectangular"
          >
            <Chip
              label={feature.environment_state[0].enabled === true ? "Enabled" : "Disabled"}
              color={feature.environment_state[0].enabled === true ? "primary" : "default"}
              size="small"
            />
          </Badge>
        </TableCell>
        <TableCell>
          <Typography variant="body2">-</Typography> {/* Placeholder for value */}
        </TableCell>
        <TableCell>
          <Typography variant="body2">
            {new Date(feature.created_date).toLocaleDateString()}
          </Typography>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={2}>
              {/* Main Info Row - 4 Columns */}
              <Grid container spacing={2}>
                {/* Column 1: Active Version */}
                {feature.live_version && (
                  <Grid item xs={12} md={3}>
                    <Typography variant="subtitle2" gutterBottom style={{ fontWeight: 600 }}>
                      Active Version
                    </Typography>
                    <Box ml={1}>
                      <Typography variant="body2" style={{ marginBottom: 4 }}>
                        <strong>Status:</strong>{' '}
                        {feature.live_version.is_live ? 'Active' : 'Inactive'}
                      </Typography>
                      <Typography variant="body2" style={{ marginBottom: 4 }}>
                        <strong>Published:</strong> {feature.live_version.published ? 'Yes' : 'No'}
                      </Typography>
                      {feature.live_version.live_from && (
                        <Typography variant="body2" style={{ marginBottom: 4 }}>
                          <strong>Active From:</strong> {new Date(feature.live_version.live_from).toLocaleString()}
                        </Typography>
                      )}
                      <Typography variant="body2" style={{ marginBottom: 4 }}>
                        <strong>Published By:</strong> User ID {feature.live_version.published_by}
                      </Typography>
                    </Box>
                  </Grid>
                )}

                {/* Column 2: Overview */}
                <Grid item xs={12} md={3}>
                  <Typography variant="subtitle2" gutterBottom style={{ fontWeight: 600 }}>
                    Overview
                  </Typography>
                  <Box ml={1}>
                    <Typography variant="body2" style={{ marginBottom: 4 }}>
                      <strong>ID:</strong> {feature.id}
                    </Typography>
                    <Typography variant="body2" style={{ marginBottom: 4 }}>
                      <strong>Type:</strong> {feature.type}
                    </Typography>
                    <Typography variant="body2" style={{ marginBottom: 4 }}>
                      <strong>Default Enabled:</strong> {feature.default_enabled ? 'Yes' : 'No'}
                    </Typography>
                    <Typography variant="body2" style={{ marginBottom: 4 }}>
                      <strong>Archived:</strong> {feature.is_archived ? 'Yes' : 'No'}
                    </Typography>
                    {feature.is_server_key_only && (
                      <Box mt={0.5}>
                        <Chip label="Server Key Only" size="small" color="secondary" />
                      </Box>
                    )}
                  </Box>
                </Grid>

                {/* Column 3: Owners */}
                {feature.owners && feature.owners.length > 0 && (
                  <Grid item xs={12} md={3}>
                    <Typography variant="subtitle2" gutterBottom style={{ fontWeight: 600 }}>
                      Owners
                    </Typography>
                    <Box ml={1}>
                      {feature.owners.map((owner: any) => (
                        <Box key={owner.id} mb={1}>
                          <Typography variant="body2">
                            <strong>{owner.first_name} {owner.last_name}</strong>
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {owner.email}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Last login: {new Date(owner.last_login).toLocaleString()}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Grid>
                )}

                {/* Column 4: Overrides */}
                <Grid item xs={12} md={3}>
                  <Typography variant="subtitle2" gutterBottom style={{ fontWeight: 600 }}>
                    Overrides
                  </Typography>
                  <Box ml={1}>
                    <Typography variant="body2" style={{ marginBottom: 4 }}>
                      <strong>Segment Overrides:</strong> {feature.num_segment_overrides || 0}
                    </Typography>
                    {feature.num_identity_overrides !== null && (
                      <Typography variant="body2" style={{ marginBottom: 4 }}>
                        <strong>Identity Overrides:</strong> {feature.num_identity_overrides}
                      </Typography>
                    )}
                  </Box>
                </Grid>

                {/* Tags Row (if exists) */}
                {feature.tags && feature.tags.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom style={{ fontWeight: 600 }}>
                      Tags
                    </Typography>
                    <Box ml={1} display="flex" flexWrap="wrap">
                      {feature.tags.map((tag: any, index: number) => (
                        <Chip key={index} label={tag} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Grid>
                )}
              </Grid>

              {/* Environment States - Collapsible Section */}
              {feature.environment_state && feature.environment_state.length > 0 && (
                <Box mt={3}>
                  <Box display="flex" alignItems="center" onClick={() => setEnvStatesOpen(!envStatesOpen)} style={{ cursor: 'pointer' }}>
                    <IconButton size="small">
                      {envStatesOpen ? <KeyboardArrowDown /> : <KeyboardArrowRight />}
                    </IconButton>
                    <Typography variant="subtitle2" style={{ fontWeight: 600 }}>
                      Environment States ({feature.environment_state.length})
                    </Typography>
                  </Box>
                  <Collapse in={envStatesOpen} timeout="auto" unmountOnExit>
                    <Box ml={2} mt={1}>
                      {feature.environment_state.map((state: any) => (
                        <Box
                          key={state.id}
                          mb={1.5}
                          p={1.5}
                          border={1}
                          borderColor="divider"
                          borderRadius={4}
                          bgcolor={state.enabled ? 'rgba(76, 175, 80, 0.05)' : 'rgba(158, 158, 158, 0.05)'}
                        >
                          <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap">
                            <Box display="flex" alignItems="center">
                              <Chip
                                label={state.enabled ? 'Enabled' : 'Disabled'}
                                color={state.enabled ? 'primary' : 'default'}
                                size="small"
                              />
                              {state.feature_segment && (
                                <Chip
                                  label="Segment Override"
                                  size="small"
                                  style={{ backgroundColor: '#ff9800', color: 'white' }}
                                />
                              )}
                              <Typography variant="body2">
                                <strong>Env ID:</strong> {state.environment}
                              </Typography>
                            </Box>
                            <Typography variant="caption" color="textSecondary">
                              Updated: {new Date(state.updated_at).toLocaleString()}
                            </Typography>
                          </Box>

                          {/* Feature State Value - Only if not null */}
                          {state.feature_state_value && (
                            state.feature_state_value.string_value !== null ||
                            state.feature_state_value.integer_value !== null ||
                            state.feature_state_value.boolean_value !== null
                          ) && (
                            <Box mt={1}>
                              {state.feature_state_value.string_value !== null && (
                                <Typography variant="body2">
                                  <strong>Value:</strong> {state.feature_state_value.string_value}
                                </Typography>
                              )}
                              {state.feature_state_value.integer_value !== null && (
                                <Typography variant="body2">
                                  <strong>Value:</strong> {state.feature_state_value.integer_value}
                                </Typography>
                              )}
                              {state.feature_state_value.boolean_value !== null && (
                                <Typography variant="body2">
                                  <strong>Value:</strong> {state.feature_state_value.boolean_value.toString()}
                                </Typography>
                              )}
                            </Box>
                          )}

                          {/* Segment Information */}
                          {state.feature_segment && (
                            <Box mt={1} p={1} bgcolor="rgba(255, 152, 0, 0.1)" borderRadius={2}>
                              <Typography variant="body2">
                                <strong>Segment ID:</strong> {state.feature_segment.segment} | <strong>Priority:</strong> {state.feature_segment.priority}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      ))}
                    </Box>
                  </Collapse>
                </Box>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

export const FlagsTab = () => {
  const { entity } = useEntity();
  const discoveryApi = useApi(discoveryApiRef);
  const fetchApi = useApi(fetchApiRef);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projectInfo, setProjectInfo] = useState<any>(null);
  const [environments, setEnvironments] = useState<FlagsmithEnvironment[]>([]);
  const [selectedEnvironment, setSelectedEnvironment] = useState<number | null>(null);
  const [features, setFeatures] = useState<FlagsmithFeature[]>([]);
  const [featuresLoading, setFeaturesLoading] = useState(false);

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
        const client = new FlagsmithClient(discoveryApi, fetchApi);
        
        // Fetch project info
        const project = await client.getProject(parseInt(projectId));
        setProjectInfo(project);
        
        // Fetch environments
        const envs = await client.getProjectEnvironments(parseInt(projectId));
        setEnvironments(envs);
        
        // Select first environment by default and fetch its features
        if (envs.length > 0) {
          setSelectedEnvironment(envs[0].id);
          // We'll fetch features for this environment in the effect below
        }
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId, discoveryApi, fetchApi]);

  // Separate effect to fetch features when environment changes
  useEffect(() => {
    if (!selectedEnvironment || !projectId) return;

    const fetchFeaturesForEnvironment = async () => {
      setFeaturesLoading(true);
      try {
        const client = new FlagsmithClient(discoveryApi, fetchApi);
        
        // Fetch features for the selected environment
        // We'll need to add this method to the client
        const envFeatures = await client.getEnvironmentFeatures(selectedEnvironment, projectId);
        setFeatures(envFeatures);
        
      } catch (err) {
        //console.error('Failed to fetch environment features:', err);
        // For now, fall back to project features
        try {
          const client = new FlagsmithClient(discoveryApi, fetchApi);
          const projectFeatures = await client.getProjectFeatures(projectId);
          setFeatures(projectFeatures);
        } catch (fallbackErr) {
          setError('Failed to fetch features');
        }
      } finally {
        setFeaturesLoading(false);
      }
    };

    fetchFeaturesForEnvironment();
  }, [selectedEnvironment, projectId, discoveryApi, fetchApi]);

  // Handle environment selection change
  const handleEnvironmentChange = (envId: number) => {
    setSelectedEnvironment(envId);
    // Features will be fetched by the useEffect above
  };

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
        <Typography color="error">
          Error: {error}
        </Typography>
        {!projectId && (
          <Typography variant="body2" style={{ marginTop: 16 }}>
            Add a <code>flagsmith.com/project-id</code> annotation to this entity to view feature flags.
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={6}>
          <Typography variant="h4">
            Feature Flags
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {projectInfo?.name} ({features.length} flags)
          </Typography>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Environment</InputLabel>
            <Select
              value={selectedEnvironment || ''}
              onChange={(e) => handleEnvironmentChange(e.target.value as number)}
              label="Environment"
            >
              {environments.map((env) => (
                <MenuItem key={env.id} value={env.id}>
                  {env.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Box mt={3}>
        {featuresLoading ? (
          <Box display="flex" justifyContent="center" p={2}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width={50}></TableCell>
                  <TableCell>Flag Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Value</TableCell>
                  <TableCell>Created</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {features.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography color="textSecondary">
                        No feature flags found for this project
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  features.map((feature) => (
                    <ExpandableRow 
                      key={feature.id} 
                      feature={feature}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Box>
  );
};