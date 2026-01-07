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
import { UsageTooltip } from './UsageTooltip';

interface UsageChartProps {
  data: FlagsmithUsageData[];
}

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
        <Tooltip content={<UsageTooltip />} />
        <Bar
          dataKey="flags"
          fill={flagsmithColors.primary}
          radius={[2, 2, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};
