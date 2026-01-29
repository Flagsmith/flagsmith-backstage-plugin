import { Box, Typography } from '@material-ui/core';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { FlagsmithUsageData } from '../../api/FlagsmithClient';
import { flagsmithColors } from '../../theme/flagsmithTheme';
import { ChartTooltip, ChartTooltipText } from '../shared';

interface UsageChartProps {
  data: FlagsmithUsageData[];
}

/**
 * Custom tooltip for usage chart displaying flags, identities, traits, and environment document
 */
const UsageChartTooltip = ({ active, payload }: any) => (
  <ChartTooltip active={active} payload={payload}>
    {(data) => {
      const usageData = data[0].payload as FlagsmithUsageData;
      return (
        <>
          <ChartTooltipText variant="subtitle2" fontWeight={600}>
            {new Date(usageData.day).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </ChartTooltipText>
          <Box mt={1}>
            <ChartTooltipText>
              <strong>Flags:</strong> {usageData.flags ?? 0}
            </ChartTooltipText>
            <ChartTooltipText>
              <strong>Identities:</strong> {usageData.identities}
            </ChartTooltipText>
            <ChartTooltipText>
              <strong>Traits:</strong> {usageData.traits}
            </ChartTooltipText>
            <ChartTooltipText>
              <strong>Environment Document:</strong> {usageData.environment_document}
            </ChartTooltipText>
          </Box>
        </>
      );
    }}
  </ChartTooltip>
);

export const UsageChart = ({ data }: UsageChartProps) => {
  if (data.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={300}>
        <Typography color="textSecondary">
          No usage data available
        </Typography>
      </Box>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="day"
          tickFormatter={value => {
            const date = new Date(value);
            return `${date.getMonth() + 1}/${date.getDate()}`;
          }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis />
        <Tooltip content={<UsageChartTooltip />} />
        <Bar
          dataKey="flags"
          fill={flagsmithColors.primary}
          radius={[2, 2, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};
