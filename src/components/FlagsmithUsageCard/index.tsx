import { Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { InfoCard } from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';
import { FlagsmithLink, LoadingState, ErrorState } from '../shared';
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

  const { project, usageData, totalFlags, loading, error } = useFlagsmithUsage(projectId);

  // Derive organization ID from project data for the dashboard link
  const orgId = project?.organisation;
  const usageUrl = orgId ? `${FLAGSMITH_DASHBOARD_URL}/organisation/${orgId}/usage` : undefined;

  if (loading) {
    return (
      <InfoCard title="Flags Usage Data (30 Days)">
        <LoadingState message="Loading usage data..." size={24} />
      </InfoCard>
    );
  }

  if (error) {
    return (
      <InfoCard title="Flags Usage Data (30 Days)">
        <ErrorState message={error} />
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
        usageUrl && (
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
