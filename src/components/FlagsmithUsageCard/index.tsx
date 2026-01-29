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
  const orgId = entity.metadata.annotations?.['flagsmith.com/org-id'];

  const { project, usageData, totalFlags, loading, error } = useFlagsmithUsage(
    projectId,
    orgId,
  );

  const usageUrl = `${FLAGSMITH_DASHBOARD_URL}/organisation/${orgId}/usage`;

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
        <ErrorState
          message={error}
          hint={!orgId ? 'Add a flagsmith.com/organization-id annotation to this entity.' : undefined}
        />
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
