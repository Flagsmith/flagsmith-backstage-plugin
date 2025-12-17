import { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  CircularProgress,
} from '@material-ui/core';
import { InfoCard } from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';
import { useApi, discoveryApiRef, fetchApiRef } from '@backstage/core-plugin-api';
import { FlagsmithClient, FlagsmithUsageData } from '../api/FlagsmithClient';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: FlagsmithUsageData;
  }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <Box
        p={1.5}
        style={{
          backgroundColor: 'rgba(12, 0, 0, 0.95)',
          border: '1px solid #ccc',
          borderRadius: 4,
        }}
      >
        <Typography variant="subtitle2" style={{ fontWeight: 600 }}>
          {new Date(data.day).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </Typography>
        <Box mt={1}>
          <Typography variant="body2">
            <strong>Flags:</strong> {data.flags ?? 0}
          </Typography>
          <Typography variant="body2">
            <strong>Identities:</strong> {data.identities}
          </Typography>
          <Typography variant="body2">
            <strong>Traits:</strong> {data.traits}
          </Typography>
          <Typography variant="body2">
            <strong>Environment Document:</strong> {data.environment_document}
          </Typography>
        </Box>
      </Box>
    );
  }

  return null;
};

export const FlagsmithUsageCard = () => {
  const { entity } = useEntity();
  const discoveryApi = useApi(discoveryApiRef);
  const fetchApi = useApi(fetchApiRef);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usageData, setUsageData] = useState<FlagsmithUsageData[]>([]);
  const [projectInfo, setProjectInfo] = useState<any>(null);

  // Get project ID and org ID from entity annotations
  const projectId = entity.metadata.annotations?.['flagsmith.com/project-id'];
  const orgId = entity.metadata.annotations?.['flagsmith.com/org-id'];

  useEffect(() => {
    if (!projectId || !orgId) {
      setError('Missing Flagsmith project ID or organization ID in entity annotations');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const client = new FlagsmithClient(discoveryApi, fetchApi);

        // Fetch project info
        const project = await client.getProject(parseInt(projectId, 10));
        setProjectInfo(project);

        // Fetch usage data
        const usage = await client.getUsageData(parseInt(orgId, 10), parseInt(projectId, 10));
        setUsageData(usage);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId, orgId, discoveryApi, fetchApi]);

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
          <Typography color="error">
            Error: {error}
          </Typography>
          {!orgId && (
            <Typography variant="body2" style={{ marginTop: 8 }}>
              Add a <code>flagsmith.com/organization-id</code> annotation to this entity.
            </Typography>
          )}
        </Box>
      </InfoCard>
    );
  }

  // Calculate total flags
  const totalFlags = usageData.reduce((sum, day) => sum + (day.flags ?? 0), 0);

  return (
    <InfoCard
      title="Flags Usage Data (30 Days)"
      subheader={projectInfo?.name ? `${projectInfo.name} - ${totalFlags} total flag calls` : undefined}
    >
      <Box p={2}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={usageData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="day"
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="flags" fill="#3f51b5" />
          </BarChart>
        </ResponsiveContainer>

        {usageData.length === 0 && (
          <Box display="flex" justifyContent="center" alignItems="center" height={300}>
            <Typography color="textSecondary">
              No usage data available
            </Typography>
          </Box>
        )}
      </Box>
    </InfoCard>
  );
};
