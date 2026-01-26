import { useState, useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  FlagsmithClient,
  FlagsmithEnvironment,
  FlagsmithUsageData,
} from '../../api/FlagsmithClient';

const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(2),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.paper,
  },
  chartContainer: {
    width: '100%',
    height: 250,
    marginTop: theme.spacing(1),
  },
  noData: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 150,
    color: theme.palette.text.secondary,
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing(1),
    height: 150,
  },
}));

const ENV_COLORS: Record<string, string> = {
  development: '#4caf50',
  dev: '#4caf50',
  staging: '#ff9800',
  stage: '#ff9800',
  production: '#f44336',
  prod: '#f44336',
};

const DEFAULT_COLORS = ['#2196f3', '#9c27b0', '#00bcd4', '#795548', '#607d8b', '#e91e63'];

const getEnvColor = (envName: string, index: number): string => {
  const lowerName = envName.toLowerCase();
  for (const [key, color] of Object.entries(ENV_COLORS)) {
    if (lowerName.includes(key)) return color;
  }
  return DEFAULT_COLORS[index % DEFAULT_COLORS.length];
};

interface ChartDataPoint {
  date: string;
  [envName: string]: number | string;
}

interface FeatureAnalyticsSectionProps {
  client: FlagsmithClient;
  orgId: number;
  projectId: number;
  environments: FlagsmithEnvironment[];
}

export const FeatureAnalyticsSection = ({
  client,
  orgId,
  projectId,
  environments,
}: FeatureAnalyticsSectionProps) => {
  const classes = useStyles();
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [envNames, setEnvNames] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsageData = async () => {
      if (!orgId || !projectId || environments.length === 0) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const usageByEnv = await client.getUsageDataByEnvironments(
          orgId,
          projectId,
          environments.slice(0, 6).map(e => ({ id: e.id, name: e.name })),
        );

        const dataByDate = new Map<string, ChartDataPoint>();
        const envNamesList: string[] = [];

        usageByEnv.forEach((data: FlagsmithUsageData[], envName: string) => {
          envNamesList.push(envName);
          data.forEach(item => {
            const date = new Date(item.day).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            });
            if (!dataByDate.has(date)) {
              dataByDate.set(date, { date });
            }
            const point = dataByDate.get(date)!;
            point[envName] = item.flags ?? 0;
          });
        });

        const sortedData = Array.from(dataByDate.values()).sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateA.getTime() - dateB.getTime();
        });

        setChartData(sortedData);
        setEnvNames(envNamesList);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchUsageData();
  }, [client, orgId, projectId, environments]);

  if (loading) {
    return (
      <Box className={classes.container}>
        <Typography variant="subtitle2" gutterBottom>
          Usage Analytics
        </Typography>
        <Box className={classes.loading}>
          <CircularProgress size={20} />
          <Typography variant="body2" color="textSecondary">
            Loading analytics...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className={classes.container}>
        <Typography variant="subtitle2" gutterBottom>
          Usage Analytics
        </Typography>
        <Box className={classes.noData}>
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        </Box>
      </Box>
    );
  }

  if (chartData.length === 0) {
    return null;
  }

  return (
    <Box className={classes.container}>
      <Typography variant="subtitle2" gutterBottom>
        Usage Analytics (Last 30 Days)
      </Typography>
      <Box className={classes.chartContainer}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Legend />
            {envNames.map((envName, index) => (
              <Line
                key={envName}
                type="monotone"
                dataKey={envName}
                stroke={getEnvColor(envName, index)}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};
