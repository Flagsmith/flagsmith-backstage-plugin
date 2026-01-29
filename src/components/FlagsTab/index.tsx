import { useState, useMemo } from 'react';
import {
  Typography,
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useEntity } from '@backstage/plugin-catalog-react';
import { SearchInput, FlagsmithLink, LoadingState, ErrorState } from '../shared';
import { buildProjectUrl } from '../../theme/flagsmithTheme';
import { useFlagsmithProject } from '../../hooks';
import {
  MAX_TABLE_ENVIRONMENTS,
  DEFAULT_ROWS_PER_PAGE,
  PAGINATION_OPTIONS,
} from '../../constants';
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
  errorHint: {
    marginTop: theme.spacing(2),
  },
}));

/** Number of fixed columns (checkbox, name, tags, created) */
const FIXED_COLUMNS_COUNT = 4;

export const FlagsTab = () => {
  const classes = useStyles();
  const { entity } = useEntity();
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);

  const projectId = entity.metadata.annotations?.['flagsmith.com/project-id'];
  const { project, environments, features, loading, error, client } =
    useFlagsmithProject(projectId);

  const filteredFeatures = useMemo(() => {
    if (!searchQuery.trim()) return features;
    const query = searchQuery.toLowerCase();
    return features.filter(
      f =>
        f.name.toLowerCase().includes(query) ||
        f.description?.toLowerCase().includes(query),
    );
  }, [features, searchQuery]);

  const paginatedFeatures = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredFeatures.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredFeatures, page, rowsPerPage]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const dashboardUrl = buildProjectUrl(
    projectId || '',
    environments[0]?.id?.toString(),
  );

  const displayedEnvs = environments.slice(0, MAX_TABLE_ENVIRONMENTS);
  const totalColumns = FIXED_COLUMNS_COUNT + displayedEnvs.length;

  if (loading) {
    return <LoadingState message="Loading feature flags..." />;
  }

  if (error) {
    return (
      <Box p={3}>
        <ErrorState
          message={error}
          hint={!projectId ? 'Add a flagsmith.com/project-id annotation to this entity to view feature flags.' : undefined}
        />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Grid container spacing={2} alignItems="center" className={classes.header}>
        <Grid item xs={12} md={6}>
          <Typography variant="h4">Feature Flags</Typography>
          <Typography variant="body2" color="textSecondary">
            {project?.name} ({features.length} flags)
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
              <TableCell>Tags</TableCell>
              {displayedEnvs.map(env => (
                <TableCell key={env.id} align="center">
                  {env.name}
                </TableCell>
              ))}
              <TableCell>Created</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredFeatures.length === 0 ? (
              <TableRow>
                <TableCell colSpan={totalColumns} align="center">
                  <Typography color="textSecondary">
                    {searchQuery
                      ? 'No flags match your search'
                      : 'No feature flags found for this project'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedFeatures.map(feature => (
                <ExpandableRow
                  key={feature.id}
                  feature={feature}
                  environments={environments}
                  client={client}
                  projectId={projectId!}
                  orgId={project?.organisation || 0}
                />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={filteredFeatures.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[...PAGINATION_OPTIONS]} // Spread needed: readonly tuple -> mutable array
      />
    </Box>
  );
};
