import { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Badge,
  IconButton,
} from '@material-ui/core';
import { ChevronLeft, ChevronRight } from '@material-ui/icons';
import { InfoCard } from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';
import { useApi, discoveryApiRef, fetchApiRef } from '@backstage/core-plugin-api';
import { FlagsmithClient, FlagsmithFeature, FlagsmithEnvironment } from '../api/FlagsmithClient';

export const FlagsmithOverviewCard = () => {
  const { entity } = useEntity();
  const discoveryApi = useApi(discoveryApiRef);
  const fetchApi = useApi(fetchApiRef);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projectInfo, setProjectInfo] = useState<any>(null);
  const [features, setFeatures] = useState<FlagsmithFeature[]>([]);
  const [environments, setEnvironments] = useState<FlagsmithEnvironment[]>([]);
  const [selectedEnvironment, setSelectedEnvironment] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const pageSize = 5;

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

        // Select first environment by default
        if (envs.length > 0) {
          setSelectedEnvironment(envs[0].id);
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId, discoveryApi, fetchApi]);

  // Fetch features when environment changes
  useEffect(() => {
    if (!selectedEnvironment || !projectId) return;

    const fetchFeaturesForEnvironment = async () => {
      try {
        const client = new FlagsmithClient(discoveryApi, fetchApi);
        const envFeatures = await client.getEnvironmentFeatures(selectedEnvironment, projectId);
        setFeatures(envFeatures);
      } catch (err) {
        console.error('Failed to fetch environment features:', err);
        setFeatures([]);
      }
    };

    fetchFeaturesForEnvironment();
  }, [selectedEnvironment, projectId, discoveryApi, fetchApi]);

  if (loading) {
    return (
      <InfoCard title="Flagsmith Flags">
        <Box display="flex" justifyContent="center" p={2}>
          <CircularProgress />
        </Box>
      </InfoCard>
    );
  }

  if (error) {
    return (
      <InfoCard title="Flagsmith Flags">
        <Box p={2}>
          <Typography color="error">
            Error: {error}
          </Typography>
        </Box>
      </InfoCard>
    );
  }

  const paginatedFeatures = features.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(features.length / pageSize);

  return (
    <InfoCard title="Flagsmith Flags" subheader={projectInfo?.name}>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Flag Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Environment</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedFeatures.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  <Typography color="textSecondary" variant="body2">
                    No feature flags found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedFeatures.map((feature) => (
                <TableRow key={feature.id} hover>
                  <TableCell>
                    <Typography variant="body2">{feature.name}</Typography>
                    {feature.description && (
                      <Typography variant="caption" color="textSecondary">
                        {feature.description.substring(0, 50)}
                        {feature.description.length > 50 ? '...' : ''}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      badgeContent={(feature.num_segment_overrides ?? 0) > 0 ? feature.num_segment_overrides : null}
                      color="secondary"
                      overlap="rectangular"
                    >
                      <Chip
                        label={feature.environment_state?.[0]?.enabled ? "Enabled" : "Disabled"}
                        color={feature.environment_state?.[0]?.enabled ? "primary" : "default"}
                        size="small"
                      />
                    </Badge>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="caption" color="textSecondary">
                      {environments.find(env => env.id === selectedEnvironment)?.name || 'Unknown'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Mini Pager */}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="space-between" alignItems="center" p={1} borderTop={1} borderColor="divider">
          <Typography variant="caption" color="textSecondary">
            Page {page + 1} of {totalPages} ({features.length} flags)
          </Typography>
          <Box>
            <IconButton
              size="small"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              <ChevronLeft />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              <ChevronRight />
            </IconButton>
          </Box>
        </Box>
      )}
    </InfoCard>
  );
};
