import { useState, useEffect, useMemo } from 'react';
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
import {
  CHART_CONFIG,
  MAX_TABLE_ENVIRONMENTS,
  getEnvColor,
} from '../../constants';
import { getErrorMessage } from '../../utils/flagTypeHelpers';
import { formatShortDate } from '../../utils/dateFormatters';
import { ChartTooltip, ChartTooltipText } from '../shared';

const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(2),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.paper,
  },
  chartContainer: {
    width: '100%',
    height: CHART_CONFIG.HEIGHT,
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

interface ChartDataPoint {
  date: string;
  [envName: string]: number | string;
}

/**
 * Custom tooltip component for analytics chart
 */
const AnalyticsTooltip = ({ active, payload, label }: any) => {
  return (
    <ChartTooltip active={active} payload={payload} label={label}>
      {(data, tooltipLabel) => (
        <>
          <ChartTooltipText variant="subtitle2" fontWeight={600}>
            {tooltipLabel}
          </ChartTooltipText>
          <Box mt={1}>
            {data.map((entry: any, index: number) => (
              <Box
                key={`item-${index}`}
                display="flex"
                alignItems="center"
                mt={0.25}
                style={{ gap: '4px' }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: '8px',
                    height: '8px',
                    backgroundColor: entry.color,
                    borderRadius: '50%',
                  }}
                />
                <ChartTooltipText>
                  {entry.name}: {entry.value}
                </ChartTooltipText>
              </Box>
            ))}
          </Box>
        </>
      )}
    </ChartTooltip>
  );
};

interface FeatureAnalyticsSectionProps {
  client: FlagsmithClient;
  orgId: number;
  projectId: number;
  environments: FlagsmithEnvironment[];
}

/**
 * Transform usage data by environment into chart-friendly format
 */
const transformUsageData = (
  usageByEnv: Map<string, FlagsmithUsageData[]>,
): { chartData: ChartDataPoint[]; envNames: string[] } => {
  const dataByDate = new Map<string, ChartDataPoint>();
  const envNames: string[] = [];

  usageByEnv.forEach((data: FlagsmithUsageData[], envName: string) => {
    envNames.push(envName);
    data.forEach(item => {
      const date = formatShortDate(item.day);
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

  return { chartData: sortedData, envNames };
};

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

  // Memoize environments to prevent re-renders from reference changes
  const envIds = environments.map(e => e.id).join(',');
  const memoizedEnvironments = useMemo(
    () => environments.map(e => ({ id: e.id, name: e.name })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [envIds]
  );

  useEffect(() => {
    const fetchUsageData = async () => {
      if (!orgId || !projectId || memoizedEnvironments.length === 0) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const displayedEnvs = memoizedEnvironments.slice(0, MAX_TABLE_ENVIRONMENTS);

        const usageByEnv = await client.getUsageDataByEnvironments(
          orgId,
          projectId,
          displayedEnvs,
        );

        const { chartData: data, envNames: names } = transformUsageData(usageByEnv);
        setChartData(data);
        setEnvNames(names);
      } catch (err) {
        setError(getErrorMessage(err, 'Failed to load analytics'));
      } finally {
        setLoading(false);
      }
    };

    fetchUsageData();
  }, [client, orgId, projectId, memoizedEnvironments]);

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
          <LineChart data={chartData} margin={CHART_CONFIG.MARGIN}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip content={<AnalyticsTooltip />} />
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
