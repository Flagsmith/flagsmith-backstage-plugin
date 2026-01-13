import { useState } from 'react';
import {
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { InfoCard } from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';
import { FlagsmithLink, MiniPagination, LoadingState } from '../shared';
import { buildProjectUrl } from '../../theme/flagsmithTheme';
import { useFlagsmithProject } from '../../hooks';
import { paginate } from '../../utils';
import { FeatureFlagRow } from './FeatureFlagRow';

const useStyles = makeStyles(theme => ({
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
}));

const PAGE_SIZE = 5;

export const FlagsmithOverviewCard = () => {
  const classes = useStyles();
  const { entity } = useEntity();
  const [page, setPage] = useState(0);

  const projectId = entity.metadata.annotations?.['flagsmith.com/project-id'];
  const { project, environments, features, loading, error } = useFlagsmithProject(projectId);

  if (loading) {
    return (
      <InfoCard title="Flagsmith Flags">
        <LoadingState message="Loading flags..." size={24} />
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

  const { paginatedItems: paginatedFeatures, totalPages } = paginate(
    features,
    page,
    PAGE_SIZE,
  );
  const dashboardUrl = buildProjectUrl(
    projectId || '',
    environments[0]?.id?.toString(),
  );

  return (
    <InfoCard
      title="Flagsmith Flags"
      subheader={project?.name}
      action={
        <Box className={classes.headerActions}>
          <FlagsmithLink href={dashboardUrl} iconOnly tooltip="Open Dashboard" />
        </Box>
      }
    >
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
                <FeatureFlagRow
                  key={feature.id}
                  feature={feature}
                  environments={environments}
                />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <MiniPagination
        page={page}
        totalPages={totalPages}
        totalItems={features.length}
        onPrevious={() => setPage(p => Math.max(0, p - 1))}
        onNext={() => setPage(p => Math.min(totalPages - 1, p + 1))}
        itemLabel="flags"
      />
    </InfoCard>
  );
};
