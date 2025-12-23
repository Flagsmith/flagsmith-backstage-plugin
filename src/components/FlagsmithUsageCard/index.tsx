import { Typography, Box, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { InfoCard } from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';
import { FlagsmithLink } from '../shared';
import { FLAGSMITH_DASHBOARD_URL } from '../../theme/flagsmithTheme';
import { useFlagsmithUsage } from '../../hooks';
import { UsageChart } from './UsageChart';

const useStyles = makeStyles(theme => ({
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
}));

export const FlagsmithUsageCard = () => {
  const classes = useStyles();
  const { entity } = useEntity();

  const projectId = entity.metadata.annotations?.['flagsmith.com/project-id'];
  const orgId = entity.metadata.annotations?.['flagsmith.com/org-id'];

  const { project, usageData, totalFlags, loading, error } = useFlagsmithUsage(
    projectId,
    orgId,
  );

  const usageUrl = `${FLAGSMITH_DASHBOARD_URL}/organisation/${orgId}/usage`;

  if (loading) {
    return (
      <InfoCard title="Flags Usage Data (30 Days)">
        <Box display="flex" justifyContent="center" p={2}>
          <CircularProgress />
        </Box>
      </InfoCard>
    );
  }

  if (error) {
    return (
      <InfoCard title="Flags Usage Data (30 Days)">
        <Box p={2}>
          <Typography color="error">Error: {error}</Typography>
          {!orgId && (
            <Typography variant="body2" style={{ marginTop: 8 }}>
              Add a <code>flagsmith.com/organization-id</code> annotation to this
              entity.
            </Typography>
          )}
        </Box>
      </InfoCard>
    );
  }

  const subheader = project?.name
    ? `${project.name} - ${totalFlags.toLocaleString()} total flag calls`
    : undefined;

  return (
    <InfoCard
      title="Flags Usage Data (30 Days)"
      subheader={subheader}
      action={
        orgId && (
          <Box className={classes.headerActions}>
            <FlagsmithLink href={usageUrl} iconOnly tooltip="View Usage Analytics" />
          </Box>
        )
      }
    >
      <Box p={2}>
        <UsageChart data={usageData} />
      </Box>
    </InfoCard>
  );
};
