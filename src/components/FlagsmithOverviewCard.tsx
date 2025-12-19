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
  IconButton,
  Tooltip,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import { InfoCard } from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';
import {
  useApi,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';
import {
  FlagsmithClient,
  FlagsmithFeature,
  FlagsmithEnvironment,
} from '../api/FlagsmithClient';
import { FlagStatusIndicator, FlagsmithLink } from './shared';
import { buildProjectUrl } from '../theme/flagsmithTheme';

const useStyles = makeStyles(theme => ({
  statsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(1),
    fontSize: '0.75rem',
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
  },
  envDots: {
    display: 'flex',
    gap: 2,
    justifyContent: 'flex-end',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
}));

export const FlagsmithOverviewCard = () => {
  const classes = useStyles();
  const { entity } = useEntity();
  const discoveryApi = useApi(discoveryApiRef);
  const fetchApi = useApi(fetchApiRef);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projectInfo, setProjectInfo] = useState<any>(null);
  const [features, setFeatures] = useState<FlagsmithFeature[]>([]);
  const [environments, setEnvironments] = useState<FlagsmithEnvironment[]>([]);
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
  }, [projectId, discoveryApi, fetchApi]);

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
          <Typography color="error">Error: {error}</Typography>
        </Box>
      </InfoCard>
    );
  }

  const paginatedFeatures = features.slice(
    page * pageSize,
    (page + 1) * pageSize,
  );
  const totalPages = Math.ceil(features.length / pageSize);

  // Calculate enabled/disabled counts
  const enabledCount = features.filter(f => f.default_enabled).length;
  const disabledCount = features.length - enabledCount;

  // Build dashboard URL
  const dashboardUrl = buildProjectUrl(
    projectId || '',
    environments[0]?.id?.toString(),
  );

  // Get environment status for a feature
  const getEnvStatus = (feature: FlagsmithFeature, envId: number): boolean => {
    if (!feature.environment_state) return feature.default_enabled ?? false;
    const state = feature.environment_state.find(s => s.id === envId);
    return state?.enabled ?? feature.default_enabled ?? false;
  };

  // Build environment status tooltip
  const buildEnvTooltip = (feature: FlagsmithFeature): string => {
    return environments
      .map(env => `${env.name}: ${getEnvStatus(feature, env.id) ? 'On' : 'Off'}`)
      .join(' • ');
  };

  return (
    <InfoCard
      title="Flagsmith Flags"
      subheader={projectInfo?.name}
      action={
        <Box className={classes.headerActions}>
          <FlagsmithLink href={dashboardUrl} iconOnly tooltip="Open Dashboard" />
        </Box>
      }
    >
      {/* Summary Stats */}
      <Box px={2} pt={1}>
        <Box className={classes.statsRow}>
          <Box className={classes.statItem}>
            <FlagStatusIndicator enabled size="small" />
            <Typography variant="caption">{enabledCount} Enabled</Typography>
          </Box>
          <Box className={classes.statItem}>
            <FlagStatusIndicator enabled={false} size="small" />
            <Typography variant="caption">{disabledCount} Disabled</Typography>
          </Box>
        </Box>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Flag Name</TableCell>
              <TableCell align="right">
                <Tooltip title={environments.map(e => e.name).join(' • ')}>
                  <span>Environments</span>
                </Tooltip>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedFeatures.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} align="center">
                  <Typography color="textSecondary" variant="body2">
                    No feature flags found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedFeatures.map(feature => (
                <TableRow key={feature.id} hover>
                  <TableCell>
                    <Typography variant="body2">{feature.name}</Typography>
                    {feature.description && (
                      <Typography variant="caption" color="textSecondary">
                        {feature.description.substring(0, 40)}
                        {feature.description.length > 40 ? '...' : ''}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title={buildEnvTooltip(feature)}>
                      <Box className={classes.envDots}>
                        {environments.map(env => (
                          <FlagStatusIndicator
                            key={env.id}
                            enabled={getEnvStatus(feature, env.id)}
                            size="small"
                          />
                        ))}
                      </Box>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Mini Pager */}
      {totalPages > 1 && (
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          p={1}
          borderTop={1}
          borderColor="divider"
        >
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
