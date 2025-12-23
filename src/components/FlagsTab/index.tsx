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
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
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
  FlagsmithProject,
} from '../../api/FlagsmithClient';
import { SearchInput, FlagsmithLink } from '../shared';
import { buildProjectUrl } from '../../theme/flagsmithTheme';
import { ExpandableRow } from './ExpandableRow';

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
}));

export const FlagsTab = () => {
  const classes = useStyles();
  const { entity } = useEntity();
  const discoveryApi = useApi(discoveryApiRef);
  const fetchApi = useApi(fetchApiRef);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projectInfo, setProjectInfo] = useState<FlagsmithProject | null>(null);
  const [environments, setEnvironments] = useState<FlagsmithEnvironment[]>([]);
  const [features, setFeatures] = useState<FlagsmithFeature[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [client] = useState(() => new FlagsmithClient(discoveryApi, fetchApi));

  const projectId = entity.metadata.annotations?.['flagsmith.com/project-id'];

  useEffect(() => {
    if (!projectId) {
      setError('No Flagsmith project ID found in entity annotations');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const project = await client.getProject(parseInt(projectId, 10));
        setProjectInfo(project);

        const envs = await client.getProjectEnvironments(parseInt(projectId, 10));
        setEnvironments(envs);

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

  const filteredFeatures = useMemo(() => {
    if (!searchQuery.trim()) return features;
    const query = searchQuery.toLowerCase();
    return features.filter(
      f =>
        f.name.toLowerCase().includes(query) ||
        f.description?.toLowerCase().includes(query),
    );
  }, [features, searchQuery]);

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
